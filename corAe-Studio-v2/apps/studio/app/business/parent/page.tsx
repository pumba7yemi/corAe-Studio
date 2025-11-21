import React from 'react';

async function readJson(rel: string) {
  try {
    const p = require('path').join(process.cwd(), 'corAe-Studio-v2', rel);
    const fs = require('fs');
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { return null; }
}

export default async function Page() {
  const parent = await readJson('business/_parent/parent-script.json');
  const haveYou = await readJson('business/_parent/business-have-you.json');
  const three = await readJson('business/_parent/business-3x3dtd.json');

  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold">Business Parent Script</h2>
      <div className="mt-4">
        <h3 className="font-medium">Parent Script</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded mt-2">{JSON.stringify(parent, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h3 className="font-medium">Have-You</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded mt-2">{JSON.stringify(haveYou, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h3 className="font-medium">3x3DTD</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded mt-2">{JSON.stringify(three, null, 2)}</pre>
      </div>
    </section>
  );
}
