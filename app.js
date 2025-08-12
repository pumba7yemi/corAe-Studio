/* corAe Studio – Always‑Wins Runner (vanilla JS, no build) */

const els = {
  title: document.getElementById('wf-title'),
  why: document.getElementById('wf-why'),
  stepIdx: document.getElementById('step-idx'),
  stepTotal: document.getElementById('step-total'),
  elapsed: document.getElementById('elapsed'),
  card: document.getElementById('step-card'),
  help: document.getElementById('btn-help'),
  back: document.getElementById('btn-back'),
  next: document.getElementById('btn-next'),
  assist: document.getElementById('assist'),
  toast: document.getElementById('toast'),
  summaryPanel: document.getElementById('summary'),
  summaryText: document.getElementById('summary-text'),
  restart: document.getElementById('btn-restart'),
  clear: document.getElementById('btn-clear'),
  introPanel: document.getElementById('intro'),
};

const STORE_KEY = 'corAe:alwaysWins:state';

const state = {
  wf: null,
  idx: 0,
  startedAt: null,
  timers: { elapsedInterval: null, stepStart: null },
};

init();

async function init(){
  try{
    // Load workflow (can be replaced by API later)
    const resp = await fetch('data/sample-workflow.json', { cache:'no-store' });
    const wf = await resp.json();
    state.wf = wf;

    // Restore progress if exists
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved?.wfId === wf.id) {
      state.idx = saved.idx ?? 0;
      state.startedAt = saved.startedAt ?? Date.now();
    } else {
      state.idx = 0;
      state.startedAt = Date.now();
    }

    els.title.textContent = wf.title;
    els.why.textContent = wf.why;
    els.stepTotal.textContent = wf.steps.length;

    wireControls();
    startElapsedTimer();
    renderStep();
  }catch(e){
    showToast('Failed to load workflow. Check /data/sample-workflow.json', true);
    console.error(e);
  }
}

function wireControls(){
  els.help.addEventListener('click', onHelp);
  els.back.addEventListener('click', onBack);
  els.next.addEventListener('click', onNext);
  els.restart.addEventListener('click', restart);
  els.clear.addEventListener('click', () => {
    localStorage.removeItem(STORE_KEY);
    showToast('Saved progress cleared.');
  });
}

function startElapsedTimer(){
  tickElapsed();
  state.timers.elapsedInterval = setInterval(tickElapsed, 1000);
}
function tickElapsed(){
  const secs = Math.floor((Date.now() - state.startedAt) / 1000);
  const mm = String(Math.floor(secs/60)).padStart(2,'0');
  const ss = String(secs%60).padStart(2,'0');
  els.elapsed.textContent = `${mm}:${ss}`;
}

function renderStep(){
  const steps = state.wf.steps;
  if (state.idx >= steps.length) return renderSummary();

  const step = steps[state.idx];

  els.stepIdx.textContent = state.idx + 1;
  els.assist.classList.add('hidden');
  els.introPanel.classList.remove('hidden');
  els.summaryPanel.classList.add('hidden');

  // Build the step card
  els.card.innerHTML = `
    <h3>${step.title}</h3>
    <p>${step.instruction}</p>
    ${step.image ? `<div class="img" style="background-image:url('${step.image}')"></div>` : ''}
    ${step.hint ? `<p class="helptext">💡 ${step.hint}</p>` : ''}

    <label class="checkline">
      <input type="checkbox" id="confirm-done" />
      <span>I have done this step.</span>
    </label>
  `;

  // Gate "Next" behind confirmation
  const confirm = document.getElementById('confirm-done');
  els.next.disabled = true;
  confirm.addEventListener('change', () => {
    els.next.disabled = !confirm.checked;
  });

  // Back availability
  els.back.disabled = state.idx === 0;

  // Persist
  persist();
}

function onHelp(){
  const step = state.wf.steps[state.idx];
  els.assist.classList.remove('hidden');
  els.assist.innerHTML = `
    <strong>Help for “${step.title}”</strong><br/>
    • ${step.help?.text ?? 'Follow the image and instruction above.'}<br/>
    • If you’re stuck, <em>a supervisor is being pinged</em> to jump in 👋
  `;
  // Simulate a ping
  showToast('Supervisor pinged. Stay on this screen.');
}

function onBack(){
  if (state.idx === 0) return;
  state.idx -= 1;
  renderStep();
}

function onNext(){
  state.idx += 1;
  if (state.idx >= state.wf.steps.length){
    renderSummary();
  } else {
    renderStep();
  }
}

function renderSummary(){
  els.introPanel.classList.add('hidden');
  els.summaryPanel.classList.remove('hidden');

  const done = state.wf.steps.length;
  els.summaryText.textContent =
    `✅ “${state.wf.title}” completed. ${done} steps done. Reason: ${state.wf.why}`;

  // Persist finished state
  persist();
}

function restart(){
  state.idx = 0;
  state.startedAt = Date.now();
  renderStep();
  showToast('Workflow restarted.');
  persist();
}

function persist(){
  localStorage.setItem(STORE_KEY, JSON.stringify({
    wfId: state.wf.id,
    idx: state.idx,
    startedAt: state.startedAt,
  }));
}

function showToast(msg, isError=false){
  els.toast.textContent = msg;
  els.toast.classList.toggle('hidden', false);
  els.toast.style.borderLeft = `4px solid ${isError ? '#ef4444' : '#7c5cff'}`;
  setTimeout(()=> els.toast.classList.add('hidden'), 3000);
}
