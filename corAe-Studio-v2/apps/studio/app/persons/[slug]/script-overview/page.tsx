import React from 'react';

async function readJson(rel: string) {
  try {
    const p = require('path').join(process.cwd(), 'corAe-Studio-v2', rel);
    const fs = require('fs');
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) { return null; }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const parent = await readJson('business/_parent/parent-script.json');
  const personHome = await readJson(`persons/${slug}/home/daily-3x3dtd.json`);
  const personCorr = await readJson(`persons/${slug}/home/corridor.json`);
  const personWork = await readJson(`persons/${slug}/work/daily-workfocus.json`);
  const personBiz = await readJson(`persons/${slug}/business/weekly-review.json`);

  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold">Script Overview — {slug}</h2>
      <div className="mt-4">
        <h3 className="font-medium">Parent-derived items</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded mt-2">{JSON.stringify(parent, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h3 className="font-medium">Home (merged)</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded mt-2">{JSON.stringify(personHome, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h3 className="font-medium">Work (merged)</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded mt-2">{JSON.stringify(personWork, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h3 className="font-medium">Business (merged)</h3>
        <pre className="text-xs bg-slate-900 p-2 rounded mt-2">{JSON.stringify(personBiz, null, 2)}</pre>
      </div>
    </section>
  );
}
