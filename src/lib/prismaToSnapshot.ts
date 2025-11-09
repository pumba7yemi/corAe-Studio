// src/prismaToSnapshot.ts
// very small Prisma -> SMSME Snapshot converter (covers models, fields, ? optional, [] list, @id/@unique/@default, enums)

export type SMSMESnapshot = {
  label?: string | null;
  prismaVer?: string | null;
  models: {
    name: string;
    dbName?: string | null;
    fields: { name: string; type: string; nullable?: boolean; default?: any; isList?: boolean }[];
    indexes?: { name?: string | null; fields: string[]; unique?: boolean }[];
    uniques?: { name?: string | null; fields: string[] }[];
  }[];
  enums?: { name: string; values: string[] }[];
};

export function prismaToSnapshot(schemaText: string, label = "from_prisma"): SMSMESnapshot {
  const lines = schemaText.replace(/\r/g, "").split("\n");

  const models: SMSMESnapshot["models"] = [];
  const enums: NonNullable<SMSMESnapshot["enums"]> = [];

  let i = 0;
  function skipEmpty() { while (i < lines.length && /^\s*$/.test(lines[i])) i++; }

  // naive block scanner
  while (i < lines.length) {
    skipEmpty();
    const line = lines[i] ?? "";
    // model
    let m = line.match(/^\s*model\s+(\w+)\s*{\s*$/);
    if (m) {
      const name = m[1];
      i++;
      const fields: any[] = [];
      const uniques: any[] = [];
      const indexes: any[] = [];

      while (i < lines.length && !/^\s*}\s*$/.test(lines[i])) {
        const L = lines[i].trim();
        // @@unique / @@index
        let mu = L.match(/^@@unique\s*\((.+)\)\s*$/);
        if (mu) {
          const fieldsList = mu[1].replace(/fields\s*:\s*/, "").replace(/[{}]/g, "");
          const fs = fieldsList.split(",").map(s => s.replace(/[\[\]\s]/g, "")).filter(Boolean);
          uniques.push({ fields: fs });
          i++; continue;
        }
        let mi = L.match(/^@@index\s*\((.+)\)\s*$/);
        if (mi) {
          const fieldsList = mi[1].replace(/fields\s*:\s*/, "").replace(/[{}]/g, "");
          const fs = fieldsList.split(",").map(s => s.replace(/[\[\]\s]/g, "")).filter(Boolean);
          indexes.push({ fields: fs, unique: false });
          i++; continue;
        }
        // field line: name type + modifiers + attributes
        let mf = L.match(/^(\w+)\s+([A-Za-z0-9_\[\]]+)(\?)?\s*(.*)$/);
        if (mf) {
          const fname = mf[1];
          let ftype = mf[2];
          const nullable = Boolean(mf[3]);
          const rest = mf[4] || "";

          let isList = false;
          if (/\[\]$/.test(ftype)) { isList = true; ftype = ftype.replace(/\[\]$/, ""); }

          // attributes
          let defVal: any = undefined;
          // @default("x") / @default(1) / @default(uuid())
          const d = rest.match(/@default\(([^)]+)\)/);
          if (d) {
            const raw = d[1].trim();
            if (/^".*"$/.test(raw) || /^'.*'$/.test(raw)) defVal = raw.slice(1, -1);
            else if (/^\d+(\.\d+)?$/.test(raw)) defVal = Number(raw);
            else defVal = String(raw); // function or enum — leave as string
          }

          fields.push({ name: fname, type: ftype.toLowerCase(), nullable, default: defVal, isList });
          i++; continue;
        }
        i++;
      }
      // consume closing brace
      if (i < lines.length && /^\s*}\s*$/.test(lines[i])) i++;

      models.push({ name, fields, uniques, indexes });
      continue;
    }

    // enum
    let e = line.match(/^\s*enum\s+(\w+)\s*{\s*$/);
    if (e) {
      const name = e[1];
      i++;
      const values: string[] = [];
      while (i < lines.length && !/^\s*}\s*$/.test(lines[i])) {
        const v = (lines[i].trim().match(/^(\w+)/)?.[1]) || "";
        if (v) values.push(v);
        i++;
      }
      if (i < lines.length && /^\s*}\s*$/.test(lines[i])) i++;
      enums.push({ name, values });
      continue;
    }

    i++;
  }

  return { label, prismaVer: null, models, enums };
}