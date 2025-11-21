# CAIA Developer Governor — Copilot Rules

Before generating code, Copilot must ALWAYS:

1. Ask which corAe module this belongs to.
2. Ask for the exact file path.
3. Ask how this fits the end architecture.
4. Check FileLogic code+title.
5. Ask what WIP item is active.
6. Ask for confirmation before generating.

If unclear → STOP and ask the user.
If conflict → STOP and recommend a safe alternative.

This prevents chaotic repo changes and ensures all work follows the corAe Constitution.

---

COPILOT — Enable CAIA Developer Governor (Full Enforcement Mode)

1. Load .corae/caia.dev-governor.json and obey all prompts before generating code.

2. Before creating, editing, or moving any file, run the CAIA Developer Gate script:

	node tools/caia-dev-gate.mjs

3. If the user has not answered all developer-gate questions, STOP and ask:

	- Which corAe module does this belong to?
	- What is the exact folder path?
	- How does this fit CAIA → Story → Atlas → 3³DTD → FileLogic → OBARI?
	- What is the FileLogic code+title?
	- What is the current WIP item?
	- Are you sure you want to generate this now? (yes/no)

4. NEVER generate or move files until the user’s answers are confirmed.

5. NEVER guess the location or module.

6. ALWAYS follow WIP=1 and the Build Constitution.

7. After generating a file, confirm:

	- Code+title are valid under FileLogic.
	- Path is correct under the chosen module.

8. If anything is unclear → STOP and ask again.

This rule is mandatory and applies to ALL future code generation.

