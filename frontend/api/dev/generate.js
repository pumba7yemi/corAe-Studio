export const config = { runtime: 'nodejs' }; // ensure Buffer available if needed later

const SYS = `You are corAe.DevAgent. Output ONLY JSON matching:
{
  "files": [
    {"path": "frontend/public/xyz.html", "content": "...", "action": "create|update"}
  ]
}
- Use valid POSIX paths rooted in this repo.
- Prefer small, incremental files.
- Never include explanations in content unless it's code comments.
`;

async function callLLM(prompt){
  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey){
    // Fallback demo so UI works without a key
    return {
      files: [
        {
          path: "frontend/public/hello-dev.html",
          action: "create",
          content: "<!doctype html><title>Hello</title><h1>Hello from DevAgent</h1>"
        }
      ]
    };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYS },
        { role: "user", content: prompt }
      ]
    })
  });
  if(!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const txt = data.choices?.[0]?.message?.content?.trim() || "{}";
  try { return JSON.parse(txt); }
  catch { return { files: [] }; }
}

export default async function handler(req, res){
  if(req.method !== 'POST'){ res.status(405).end(); return; }
  const { module, prompt } = req.body || {};
  const full = `Module: ${module || 'General'}\n\nTask:\n${prompt || ''}`;
  try {
    const out = await callLLM(full);
    res.status(200).json({ files: out.files || [] });
  } catch (e){
    res.status(500).json({ error: String(e) });
  }
}
