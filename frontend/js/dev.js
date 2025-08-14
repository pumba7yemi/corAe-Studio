const $ = s => document.querySelector(s);
const resultsEl = $('#results');
const statusEl = $('#status');

let generated = []; // {path, content, action}

function fileCard(f, i){
  const wrap = document.createElement('div');
  wrap.className = 'file';
  wrap.innerHTML = `
    <div class="row" style="justify-content:space-between">
      <label><input type="checkbox" data-idx="${i}" checked /> <strong>${f.path}</strong> <span class="muted">(${f.action||'create'})</span></label>
      <button class="btn" data-copy="${i}">Copy</button>
    </div>
    <pre>${escapeHtml(f.content)}</pre>
  `;
  return wrap;
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function generate(){
  resultsEl.innerHTML = '';
  statusEl.textContent = 'Generating…';
  const body = {
    module: $('#module').value,
    prompt: $('#prompt').value.trim()
  };
  const r = await fetch('/api/dev/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){ statusEl.textContent = 'Generation failed'; return; }
  const data = await r.json();
  generated = data.files || [];
  if(!generated.length){ statusEl.textContent = 'No files returned'; return; }
  generated.forEach((f,i)=>resultsEl.appendChild(fileCard(f,i)));
  statusEl.textContent = `Generated ${generated.length} file(s)`;
  resultsEl.addEventListener('click', (e)=>{
    const copyIdx = e.target?.dataset?.copy;
    if(copyIdx!=null){
      navigator.clipboard.writeText(generated[copyIdx].content);
      e.target.textContent = 'Copied';
      setTimeout(()=>e.target.textContent='Copy',900);
    }
  }, { once:true });
}

async function commit(){
  const chosen = [];
  document.querySelectorAll('input[type=checkbox][data-idx]').forEach(cb=>{
    if(cb.checked) chosen.push(generated[Number(cb.dataset.idx)]);
  });
  if(!chosen.length){ statusEl.textContent = 'Select at least one file'; return; }
  statusEl.textContent = 'Committing…';
  const r = await fetch('/api/dev/commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({files:chosen})});
  const data = await r.json().catch(()=> ({}));
  if(r.ok){ statusEl.innerHTML = `<span class="ok">Committed ${chosen.length} file(s)</span>`; }
  else { statusEl.innerHTML = `<span class="err">Commit failed: ${data?.error||r.statusText}</span>`; }
}

$('#btnGenerate').onclick = generate;
$('#btnCommit').onclick = commit;
$('#btnRefresh').onclick = ()=>location.reload();
