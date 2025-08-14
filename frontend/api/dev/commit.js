export const config = { runtime: 'nodejs' };

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const TOKEN  = process.env.GITHUB_TOKEN;
const BRANCH = process.env.GITHUB_BRANCH || 'main';

async function gh(path, init={}){
  init.headers = {
    ...(init.headers||{}),
    "Authorization": `Bearer ${TOKEN}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "corae-dev-agent"
  };
  const url = `https://api.github.com${path}`;
  const r = await fetch(url, init);
  if(!r.ok){
    const t = await r.text();
    throw new Error(`${r.status} ${r.statusText} – ${t}`);
  }
  return r.json();
}

function b64(s){
  return Buffer.from(s, 'utf8').toString('base64');
}

export default async function handler(req, res){
  if(req.method !== 'POST'){ res.status(405).end(); return; }
  if(!OWNER || !REPO || !TOKEN){
    res.status(400).json({ error: "Missing GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN envs" });
    return;
  }
  const { files } = req.body || {};
  if(!Array.isArray(files) || !files.length){
    res.status(400).json({ error: "files array required" });
    return;
  }

  try{
    for(const f of files){
      const path = f.path.replace(/^\/+/, '');
      // Get existing SHA (if any)
      let sha = undefined;
      try{
        const info = await gh(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(BRANCH)}`);
        sha = info.sha;
      }catch(_e){ /* file may not exist yet */ }

      await gh(`/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`,{
        method:'PUT',
        body: JSON.stringify({
          message: `DevAgent: ${sha ? 'update' : 'create'} ${path}`,
          content: b64(String(f.content||'')),
          branch: BRANCH,
          sha
        })
      });
    }
    res.status(200).json({ ok:true, count: files.length });
  }catch(e){
    res.status(500).json({ error: String(e) });
  }
}
