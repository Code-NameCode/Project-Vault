/* ============================================================
   THE FUTURE IS NOW — OS interface logic
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------- Boot sequence ---------- */
const bootLines = [
  "> INITIALIZING NEXUS OS v4.7.1 ...",
  "> LOADING KERNEL MODULES ............ OK",
  "> MOUNTING VIRTUAL FILESYSTEM ........ OK",
  "> ESTABLISHING SECURE CHANNEL ......... OK",
  "> CALIBRATING HOLOGRAPHIC RENDERER .... OK",
  "> SYNCING TELEMETRY STREAMS .......... OK",
  "> LOADING AI CO-PROCESSOR ............ OK",
  "> SYSTEM READY.",
];
const bootTerm = document.getElementById('boot-term');
const bootBar = document.getElementById('boot-bar');
const bootStatus = document.getElementById('boot-status');

let bootIdx = 0;
function runBoot() {
  if (bootIdx < bootLines.length) {
    const line = document.createElement('div');
    line.textContent = bootLines[bootIdx];
    bootTerm.appendChild(line);
    bootTerm.scrollTop = bootTerm.scrollHeight;
    bootBar.querySelector('span').style.width = ((bootIdx + 1) / bootLines.length * 100) + '%';
    bootStatus.textContent = 'LOADING ' + Math.round((bootIdx + 1) / bootLines.length * 100) + '%';
    bootIdx++;
    setTimeout(runBoot, 220 + Math.random() * 180);
  } else {
    bootStatus.textContent = 'SYSTEM ONLINE';
    setTimeout(() => {
      document.getElementById('boot').classList.add('hidden');
      startSystems();
    }, 700);
  }
}

/* ---------- Live clock ---------- */
function startClock() {
  const el = document.getElementById('clock');
  setInterval(() => {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} UTC+0`;
  }, 1000);
}

/* ---------- Live data stream ---------- */
const streamEl = document.getElementById('stream');
const streamMsgs = [
  "TELEMETRY >> node-07 latency 12ms",
  "AI CORE >> inference batch 441 committed",
  "GRID >> 14 nodes synchronized",
  "SECURITY >> perimeter scan clean",
  "DATA >> 2.4TB ingested / 0.3TB egress",
  "RENDER >> holographic frame 60fps",
  "NETWORK >> 847 active connections",
  "CORE >> thermal load 41C nominal",
];
function pushStream() {
  const row = document.createElement('div');
  row.className = 'row';
  const ts = new Date().toISOString().slice(11, 19);
  const msg = streamMsgs[Math.floor(Math.random() * streamMsgs.length)];
  row.innerHTML = `<span class="ts">[${ts}]</span> <span class="val">${msg}</span>`;
  streamEl.appendChild(row);
  if (streamEl.children.length > 14) streamEl.removeChild(streamEl.firstChild);
  setTimeout(pushStream, 900 + Math.random() * 600);
}

/* ---------- Counters ---------- */
const counters = {
  ops: { el: null, val: 1248902, inc: 37 },
  users: { el: null, val: 8421, inc: 2 },
  data: { el: null, val: 4.72, inc: 0.01, decimals: 2, suffix: 'PB' },
  uptime: { el: null, val: 99.98, inc: 0, decimals: 2, suffix: '%' },
};
function wireCounters() {
  counters.ops.el = document.getElementById('c-ops');
  counters.users.el = document.getElementById('c-users');
  counters.data.el = document.getElementById('c-data');
  counters.uptime.el = document.getElementById('c-uptime');
}
function fmtCounter(c) {
  let v = c.val;
  if (c.decimals) v = v.toFixed(c.decimals);
  else v = Math.floor(v).toLocaleString();
  return v + (c.suffix || '');
}
function tickCounters() {
  Object.values(counters).forEach(c => {
    if (c.inc) c.val += c.inc * (0.6 + Math.random() * 0.8);
    c.el.textContent = fmtCounter(c);
  });
  const ev = document.getElementById('ev-count');
  const ss = document.getElementById('sess-count');
  if (ev) ev.textContent = Math.floor(1.2e9 + Math.random() * 1e6).toLocaleString();
  if (ss) ss.textContent = Math.floor(800 + Math.random() * 60).toLocaleString();
  const st = document.getElementById('scan-time');
  if (st) {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    st.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }
  setTimeout(tickCounters, 1200);
}

/* ---------- Capability modules ---------- */
const moduleData = {
  m1: { id: 'MOD-01', name: 'NEURAL ORCHESTRATION', desc: 'Distributed AI agent coordination across heterogeneous compute clusters.', kv: [['LATENCY', '4.2ms p99'], ['THROUGHPUT', '1.2M ops/s'], ['STATUS', 'OPERATIONAL'], ['REGION', 'GLOBAL EDGE']] },
  m2: { id: 'MOD-02', name: 'HOLOGRAPHIC RENDER', desc: 'Real-time volumetric display pipeline for spatial interfaces.', kv: [['RESOLUTION', '8K volumetric'], ['REFRESH', '120Hz'], ['STATUS', 'OPERATIONAL'], ['ENGINE', 'PHOTON v3']] },
  m3: { id: 'MOD-03', name: 'QUANTUM ENCRYPTION', desc: 'Post-quantum cryptographic layer for all data in transit.', kv: [['ALGORITHM', 'CRYSTALS-Kyber'], ['KEY ROTATION', '60s'], ['STATUS', 'OPERATIONAL'], ['COMPLIANCE', 'FIPS 203']] },
  m4: { id: 'MOD-04', name: 'TELEMETRY FUSION', desc: 'Unified stream processing for billions of events per second.', kv: [['INGEST', '4.2B evt/day'], ['LAG', '< 80ms'], ['STATUS', 'OPERATIONAL'], ['STORE', 'COLUMNAR']] },
  m5: { id: 'MOD-05', name: 'ADAPTIVE UI ENGINE', desc: 'Interface that reconfigures itself based on operator context.', kv: [['MODES', '14'], ['PERSONALIZATION', 'REAL-TIME'], ['STATUS', 'OPERATIONAL'], ['LEARNING', 'ON-DEVICE']] },
  m6: { id: 'MOD-06', name: 'PREDICTIVE MAINTENANCE', desc: 'Forecasting hardware degradation before it becomes failure.', kv: [['ACCURACY', '97.4%'], ['HORIZON', '30 days'], ['STATUS', 'OPERATIONAL'], ['MODELS', 'ENSEMBLE']] },
};
let openModule = null;
function initModules() {
  $$('.module').forEach(m => {
    m.addEventListener('click', () => {
      const id = m.dataset.id;
      const detail = document.getElementById('module-detail');
      if (openModule === id) {
        detail.classList.remove('open');
        openModule = null;
        return;
      }
      openModule = id;
      const d = moduleData[id];
      detail.innerHTML = `
        <div style="color:var(--cyan);margin-bottom:12px;letter-spacing:0.2em">${d.id} // ${d.name}</div>
        <div style="color:var(--text-dim);margin-bottom:16px">${d.desc}</div>
        <div class="kv">${d.kv.map(([k,v]) => `<div class="k">${k}</div><div class="v">${v}</div>`).join('')}</div>
      `;
      detail.classList.add('open');
    });
  });
}

/* ---------- Data viz canvas ---------- */
let canvas, ctx;
function initCanvas() {
  canvas = document.getElementById('viz-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  drawViz();
}
function resizeCanvas() {
  const r = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  canvas.style.width = r.width + 'px';
  canvas.style.height = r.height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
const vizNodes = Array.from({ length: 48 }, () => ({
  x: Math.random(), y: Math.random(),
  vx: (Math.random() - 0.5) * 0.0008,
  vy: (Math.random() - 0.5) * 0.0008,
  r: 1.5 + Math.random() * 2.5,
}));
function drawViz() {
  const r = canvas.parentElement.getBoundingClientRect();
  const W = r.width, H = r.height;
  ctx.clearRect(0, 0, W, H);
  // grid
  ctx.strokeStyle = 'rgba(0,245,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // nodes
  vizNodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > 1) n.vx *= -1;
    if (n.y < 0 || n.y > 1) n.vy *= -1;
    const px = n.x * W, py = n.y * H;
    ctx.beginPath();
    ctx.arc(px, py, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,245,255,0.8)';
    ctx.shadowColor = 'rgba(0,245,255,0.8)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  // connections
  for (let i = 0; i < vizNodes.length; i++) {
    for (let j = i + 1; j < vizNodes.length; j++) {
      const a = vizNodes[i], b = vizNodes[j];
      const dx = (a.x - b.x) * W, dy = (a.y - b.y) * H;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x * W, a.y * H);
        ctx.lineTo(b.x * W, b.y * H);
        ctx.strokeStyle = `rgba(57,255,20,${(1 - dist / 120) * 0.35})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawViz);
}

/* ---------- Bar chart animate ---------- */
function animateBars() {
  $$('.bar-row .bar > span').forEach((s, i) => {
    const target = 40 + Math.random() * 55;
    setTimeout(() => { s.style.width = target + '%'; s.parentElement.nextElementSibling.textContent = Math.round(target) + '%'; }, i * 120);
  });
}

/* ---------- Product card tilt ---------- */
function initTilt() {
  $$('.demo-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ---------- Contact terminal ---------- */
const termOut = document.getElementById('term-out');
const termInput = document.getElementById('term-input');
const termCommands = {
  help: () => [
    'AVAILABLE COMMANDS:',
    '  help        - show this list',
    '  status      - system status',
    '  modules     - list capability modules',
    '  contact     - contact details',
    '  clear       - clear terminal',
    '  whoami      - operator identity',
    '  version     - system version',
    '  echo <msg>  - echo a message',
  ],
  status: () => [
    'NEXUS OS v4.7.1 — STATUS REPORT',
    '  CPU LOAD ......... 34%',
    '  MEMORY .......... 61% of 2.1TB',
    '  NETWORK ......... ONLINE (847 conn)',
    '  THERMAL ......... 41C NOMINAL',
    '  SECURITY ........ PERIMETER CLEAN',
  ],
  modules: () => Object.values(moduleData).map(m => `  ${m.id}  ${m.name}`),
  contact: () => [
    'CONTACT CHANNELS (simulated demo):',
    '  EMAIL .... nexus@future.now',
    '  SIGNAL ... +1 415 000 0000',
    '  HQ ....... ORBITAL STATION 7, LEO',
    '  HOURS .... 24/7 OPERATIONS',
  ],
  whoami: () => ['OPERATOR: GUEST', 'CLEARANCE: VISITOR', 'SESSION: ' + Math.random().toString(36).slice(2, 10).toUpperCase()],
  version: () => ['NEXUS OS v4.7.1', 'BUILD 2040.11.18', 'KERNEL 6.9.0-future'],
  clear: () => { termOut.innerHTML = ''; return []; },
};
function termPrint(lines, cls = '') {
  lines.forEach(l => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = l;
    termOut.appendChild(div);
  });
  termOut.scrollTop = termOut.scrollHeight;
}
function termHandle(cmd) {
  const trimmed = cmd.trim();
  if (!trimmed) return;
  const echo = document.createElement('div');
  echo.innerHTML = `<span class="prompt">nexus@future:~$</span> ${escapeHtml(trimmed)}`;
  termOut.appendChild(echo);
  const [name, ...args] = trimmed.split(/\s+/);
  const fn = termCommands[name.toLowerCase()];
  if (fn) {
    const out = fn(args);
    if (name.toLowerCase() !== 'clear') termPrint(out);
  } else if (name.toLowerCase() === 'echo') {
    termPrint([args.join(' ')]);
  } else {
    termPrint([`command not found: ${name}`, 'type "help" for available commands'], 'err');
  }
  termOut.scrollTop = termOut.scrollHeight;
}
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

termInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    termHandle(termInput.value);
    termInput.value = '';
  }
});

/* ---------- Navigation smooth scroll ---------- */
function initNav() {
  $$('.rail-btn[data-target]').forEach(b => {
    b.addEventListener('click', () => {
      const t = document.getElementById(b.dataset.target);
      if (t) t.scrollIntoView({ behavior: 'smooth' });
      $$('.rail-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- Cursor glow ---------- */
function initCursor() {
  const g = document.getElementById('cursor-glow');
  window.addEventListener('mousemove', e => {
    g.style.left = e.clientX + 'px';
    g.style.top = e.clientY + 'px';
  });
}

/* ---------- Glitch on hover for showcase title ---------- */
function initGlitch() {
  const g = document.querySelector('.glitch');
  if (!g) return;
  setInterval(() => {
    g.classList.add('glitching');
    setTimeout(() => g.classList.remove('glitching'), 400);
  }, 4000);
}

/* ---------- Start systems ---------- */
function startSystems() {
  wireCounters();
  startClock();
  pushStream();
  tickCounters();
  initModules();
  initCanvas();
  animateBars();
  setInterval(animateBars, 6000);
  initTilt();
  initNav();
  initReveal();
  initCursor();
  initGlitch();
  // welcome terminal line
  termPrint(['NEXUS OS v4.7.1 — CONTACT TERMINAL', 'Type "help" for available commands.', ''], 'info');
}

window.addEventListener('load', () => {
  runBoot();
});