import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const root = process.cwd();
const ruleFile = path.join(root, ".corae/caia.dev-governor.json");
const patternsFile = path.join(root, ".corae/caia.patterns.json");
const logsDir = path.join(root, ".corae", "logs", "dev-gate");

// Read governor config
if (!fs.existsSync(ruleFile)) {
  console.log("No Developer Governor found. Skipping.");
  process.exit(0);
}

const raw = fs.readFileSync(ruleFile, "utf8");
const rules = JSON.parse(raw || "{}");

// Mode resolution and CI bypass
const args = process.argv.slice(2).map(String);
const env = process.env;

// Read repository build rules (optional)
const buildRuleFile = path.join(root, ".corae", "caia.rule.build.json");
let buildRules = {};
if (fs.existsSync(buildRuleFile)) {
  try {
    const rb = fs.readFileSync(buildRuleFile, "utf8");
    buildRules = rb ? JSON.parse(rb) : {};
  } catch (e) {
    console.warn("Failed to read build rule file:", e && e.message ? e.message : e);
    buildRules = {};
  }
}

// Parse simple context args e.g. --pillar=obari or --context=pillar:obari
const context = {};
for (const a of args) {
  if (a.startsWith("--pillar=")) {
    context.pillar = a.split("=")[1];
  } else if (a.startsWith("--context=")) {
    const v = a.split("=")[1] || "";
    if (v.includes(":")) {
      const [k, val] = v.split(":", 2);
      context[k] = val;
    } else {
      context.misc = v;
    }
  }
}

// CI bypass: if set, skip gate entirely
if (env.CAIA_DEV_GATE_SKIP === "true") {
  console.log("CAIA Developer Gate SKIPPED via CAIA_DEV_GATE_SKIP=true (CI bypass)");
  process.exit(0);
}

// Default behaviour: Calm Autopilot unless CAIA_DEV_MODE forces interactive
let mode = "calm"; // calm autopilot by default
if (env.CAIA_DEV_MODE === "true" || args.includes("--interactive") || args.includes("--mode=interactive")) {
  mode = "interactive";
}

// Logging default: enabled unless explicitly set to false
const enableLogs = env.CAIA_DEV_LOG !== "false";

// Ensure logs dir exists when needed
if (enableLogs) {
  try {
    await fsp.mkdir(logsDir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

// Load or init pattern memory
let patterns = {};
try {
  if (fs.existsSync(patternsFile)) {
    const p = fs.readFileSync(patternsFile, "utf8");
    patterns = p ? JSON.parse(p) : {};
  }
} catch (e) {
  console.warn("Failed to read pattern memory:", e && e.message ? e.message : e);
  patterns = {};
}

function slugKey(msg) {
  return String(msg).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function recordPattern(key) {
  const now = new Date().toISOString().slice(0, 10);
  patterns[key] = patterns[key] || { count: 0, lastApplied: null };
  patterns[key].count = (patterns[key].count || 0) + 1;
  patterns[key].lastApplied = now;
}

async function flushPatterns() {
  try {
    await fsp.mkdir(path.dirname(patternsFile), { recursive: true });
    await fsp.writeFile(patternsFile, JSON.stringify(patterns, null, 2), "utf8");
  } catch (e) {
    // ignore
  }
}

async function writeLog(entry) {
  if (!enableLogs) return;
  try {
    await fsp.mkdir(logsDir, { recursive: true });
    const name = `${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const p = path.join(logsDir, name);
    await fsp.writeFile(p, JSON.stringify(entry, null, 2), "utf8");
  } catch (e) {
    // ignore
  }
}

console.log(`CAIA Developer Gate Active — mode=${mode}\n`);

function interactiveAsk(q) {
  return new Promise((resolve) => {
    process.stdout.write(q + " ");
    process.stdin.once("data", (data) => resolve(String(data).trim()));
  });
}

function autoDecide(prompt, key) {
  const k = key || slugKey(prompt);
  const entry = patterns[k] || { count: 0 };
  const c = entry.count || 0;

  // Apply thresholds per spec
  if (c >= 20) return { answer: true, reason: "trusted-default" };
  if (c >= 7) return { answer: true, reason: "auto-silent" };
  if (c >= 3 && c < 7) return { answer: true, reason: "auto-with-ask-if-interactive" };

  // default for calm mode: answer yes by default but mark as default-auto
  return { answer: true, reason: "default-auto" };
}

async function decide(prompt, opts = { key: null, default: "" }) {
  const key = opts.key || slugKey(prompt);
  if (mode === "interactive") {
    const a = await interactiveAsk(prompt);
    await writeLog({ time: new Date().toISOString(), prompt, answer: a, mode: "interactive" });
    if (String(a).toLowerCase() === "yes" || String(a).toLowerCase() === "y") recordPattern(key);
    await flushPatterns();
    return { answer: a, autoApplied: false, reason: "interactive" };
  }

  // calm autopilot
  const decision = autoDecide(prompt, key);
  const willAuto = Boolean(decision.answer);
  const answer = willAuto ? (opts.default || "yes") : "no";
  const autoApplied = decision.reason === "auto-silent" || decision.reason === "trusted-default" || decision.reason === "auto-with-ask-if-interactive";
  await writeLog({ time: new Date().toISOString(), prompt, answer, mode: "calm", reason: decision.reason, autoApplied });
  if (decision.reason && decision.reason.startsWith("auto")) recordPattern(key);
  await flushPatterns();
  return { answer, autoApplied, reason: decision.reason };
}

 (async () => {
  // Enforce calming behaviour rules by logging intent (hard enforcement requires context)
  await writeLog({ time: new Date().toISOString(), mode, rules: rules.rules || {}, buildRules: buildRules.enforce || {}, context, note: "Gate run start" });

  try {
    const decisions = [];
    const autoAppliedList = [];
    const manualList = [];

    if (rules.rules && rules.rules.requireModule) {
      const d = await decide(rules.messages.modulePrompt, { default: "dev" });
      decisions.push({ prompt: rules.messages.modulePrompt, ...d });
      if (d.autoApplied) autoAppliedList.push('module'); else manualList.push('module');
    }

    if (rules.rules && rules.rules.requirePathConfirmation) {
      const d = await decide(rules.messages.pathPrompt, { default: "." });
      decisions.push({ prompt: rules.messages.pathPrompt, ...d });
      if (d.autoApplied) autoAppliedList.push('path'); else manualList.push('path');
    }

    if (rules.rules && rules.rules.requireEndArchitectureCheck) {
      const d = await decide(rules.messages.architecturePrompt, { default: "aligned" });
      decisions.push({ prompt: rules.messages.architecturePrompt, ...d });
      if (d.autoApplied) autoAppliedList.push('architecture'); else manualList.push('architecture');
    }

    if (rules.rules && rules.rules.requireFilelogicCheck) {
      const d = await decide(rules.messages.fileLogicPrompt, { default: "ok" });
      decisions.push({ prompt: rules.messages.fileLogicPrompt, ...d });
      if (d.autoApplied) autoAppliedList.push('filelogic'); else manualList.push('filelogic');
    }

    if (rules.rules && rules.rules.requireWipCheck) {
      const d = await decide(rules.messages.wipPrompt, { default: "WIP=1" });
      decisions.push({ prompt: rules.messages.wipPrompt, ...d });
      if (d.autoApplied) autoAppliedList.push('wip'); else manualList.push('wip');
    }

    const conf = await decide(rules.messages.confPrompt, { default: "yes" });
    decisions.push({ prompt: rules.messages.confPrompt, ...conf });
    if (!conf.autoApplied && mode === "interactive") {
      console.log("Request cancelled by Developer Governor.");
      await writeLog({ time: new Date().toISOString(), result: "cancelled", decisions });
      process.exit(1);
    }

    // Summary
    const patternsUpdated = Object.keys(patterns).length;
    // collect policy violations (e.g. check for .ps1 files when noPS1 enforced)
    function findFilesSync(dir, ext, out = [], max = 200) {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const it of items) {
          const p = path.join(dir, it.name);
          if (it.isDirectory()) {
            findFilesSync(p, ext, out, max);
          } else if (it.isFile() && p.toLowerCase().endsWith(ext.toLowerCase())) {
            out.push(path.relative(root, p));
          }
          if (out.length >= max) return out;
        }
      } catch (e) {
        // ignore
      }
      return out;
    }

    const policyViolations = {};
    if (buildRules.enforce && buildRules.enforce.noPS1) {
      const ps1 = findFilesSync(root, ".ps1", [], 200);
      const refs = [];

      // Also detect textual references to .ps1 in common files (docs, scripts, configs)
      function findTextRefs(dir, out = [], max = 200) {
        try {
          const items = fs.readdirSync(dir, { withFileTypes: true });
          for (const it of items) {
            const p = path.join(dir, it.name);
            if (it.isDirectory()) {
              if (['node_modules', '.git', '.corae/logs'].includes(it.name)) continue;
              findTextRefs(p, out, max);
            } else if (it.isFile()) {
              const ext = path.extname(it.name).toLowerCase();
              if (['.md', '.json', '.js', '.ts', '.mjs', '.mts', '.yml', '.yaml', '.sh'].includes(ext) || it.name.toLowerCase().includes('readme')) {
                try {
                  const txt = fs.readFileSync(p, 'utf8');
                  if (txt && txt.toLowerCase().includes('.ps1')) out.push(path.relative(root, p));
                } catch (e) {
                  // ignore file read errors
                }
              }
            }
            if (out.length >= max) return out;
          }
        } catch (e) {
          // ignore
        }
        return out;
      }

      if (ps1.length) policyViolations.noPS1 = ps1;
      const textRefs = findTextRefs(root, [], 200);
      // Also check package.json scripts for .ps1 references explicitly
      try {
        const pkgPath = path.join(root, 'package.json');
        if (fs.existsSync(pkgPath)) {
          const pj = JSON.parse(fs.readFileSync(pkgPath, 'utf8') || '{}');
          if (pj.scripts) {
            for (const [k, v] of Object.entries(pj.scripts)) {
              try {
                if (String(v).toLowerCase().includes('.ps1')) {
                  textRefs.push(`package.json -> scripts.${k}`);
                }
              } catch (e) { /* ignore */ }
            }
          }
        }
      } catch (e) {
        // ignore package.json read errors
      }
      if (textRefs.length) refs.push(...textRefs.filter((p) => !policyViolations.noPS1 || !policyViolations.noPS1.includes(p)));
      if (refs.length) policyViolations.noPS1References = refs;
    }

    // If there are policy violations for noPS1, fail the gate run loudly
    const hasNoPS1 = policyViolations && (Array.isArray(policyViolations.noPS1) && policyViolations.noPS1.length) || (Array.isArray(policyViolations.noPS1References) && policyViolations.noPS1References.length);
    if (hasNoPS1) {
      const summary = {
        time: new Date().toISOString(),
        result: 'failed-policy-violation',
        mode,
        decisions,
        autoApplied: autoAppliedList,
        manual: manualList,
        context,
        policyViolations
      };
      await writeLog(summary);
      console.error('Developer Governor failed: policy violations detected (noPS1 enforced). See logs for details.');
      await flushPatterns();
      process.exit(2);
    }

    const summary = {
      time: new Date().toISOString(),
      result: "approved",
      mode,
      patternsUpdated,
      autoApplied: autoAppliedList,
      manual: manualList,
      decisions,
      context,
      policyViolations
    };
    await writeLog(summary);
    // Also write a stable-named dev-gate file for Studio to read
    try {
      await fsp.mkdir(logsDir, { recursive: true });
      const out = {
        when: summary.time,
        mode: summary.mode,
        decisions: summary.decisions,
        autoApplied: summary.autoApplied,
        manual: summary.manual,
      };
      await fsp.writeFile(path.join(logsDir, `dev-gate-${Date.now()}.json`), JSON.stringify(out, null, 2), "utf8");
    } catch (e) {
      // ignore
    }
    console.log("CAIA Calm-Mode Complete");
    console.log(`Patterns updated: ${patternsUpdated}`);
    console.log(`Auto-applied: ${autoAppliedList.length ? autoAppliedList.join(', ') : 'none'}`);
    console.log(`Remaining manual: ${manualList.length ? manualList.join(', ') : 'none'}`);
    console.log("Developer Governor approved — continue.");
    await flushPatterns();
    process.exit(0);
  } catch (e) {
    await writeLog({ time: new Date().toISOString(), error: String(e) });
    console.error("Developer Governor error:", e && e.message ? e.message : e);
    process.exit(1);
  }
})();
