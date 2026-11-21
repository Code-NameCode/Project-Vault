/* ============================================================
   AXIOM — Command Centre interactions
   NOTE: all data below is SIMULATED demonstration data.
   ============================================================ */
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rnd = (min, max) => min + Math.random() * (max - min);
const fmt = n => n.toLocaleString('en-GB', { maximumFractionDigits: 1 });

/* ---------- NAV (mobile) ---------- */
$('#navToggle').addEventListener('click', () => $('.nav-links').classList.toggle('open'));
$$('.nav-links a').forEach(a => a.addEventListener('click', () => $('.nav-links').classList.remove('open')));

/* ---------- ANIMATED COUNTERS ---------- */
const counters = $$('[data-count]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = parseFloat(el.dataset.count),
      dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1400;
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * ease).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    counterObs.unobserve(el);
  });
}, { threshold: .5 });
counters.forEach(c => counterObs.observe(c));

/* ---------- HERO CONSOLE ---------- */
const HERO_LINES = [
  ['ok', 'pipeline.ingest :: batch reconciled'],
  ['info', 'autoscaler node pool rebalanced'],
  ['ok', 'policy.eval :: rules passed, 0 violations'],
  ['warn', 'queue.depth elevated — backpressure engaged'],
  ['info', 'snapshot committed → cold-store'],
  ['ok', 'handoff :: downstream SLAs nominal'],
  ['info', 'cache.warm :: edge regions synced'],
  ['ok', 'telemetry.flush :: 3 sinks acknowledged'],
];
const heroBody = $('.console-body');
const heroConsole = $('.hero-console');
let heroPaused = false;
heroConsole.addEventListener('mouseenter', () => heroPaused = true);
heroConsole.addEventListener('mouseleave', () => heroPaused = false);

function heroLine() {
  if (heroPaused) return;
  const [lvl, msg] = HERO_LINES[Math.floor(Math.random() * HERO_LINES.length)];
  const t = new Date().toISOString().slice(11, 23);
  const row = document.createElement('div');
  row.className = 'console-row';
  row.innerHTML = `<span class="t">${t}</span><span class="lvl ${lvl}">${lvl.toUpperCase()}</span><span>${msg}</span>`;
  heroBody.appendChild(row);
  while (heroBody.children.length > 7) heroBody.firstChild.remove();
}
setInterval(heroLine, 1600);
heroLine();

/* load bars */
const loadBars = $('#loadBars'), loadPct = $('#loadPct');
const BAR_COUNT = 24;
loadBars.innerHTML = Array.from({ length: BAR_COUNT }, () => '<i></i>').join('');
setInterval(() => {
  const load = rnd(38, 86);
  $$('i', loadBars).forEach((b, i) => {
    const on = i / BAR_COUNT < load / 100;
    b.style.background = on ? (load > 75 ? 'var(--warn)' : 'var(--blue)') : 'var(--panel-2)';
    b.style.height = on ? `${8 + Math.random() * 8}px` : '6px';
  });
  loadPct.textContent = load.toFixed(0) + '%';
}, 900);

/* ---------- DEMO TABS ---------- */
$$('#demoTabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('#demoTabs .tab').forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
    $$('.tab-panel', $('#demo')).forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
  });
});

/* stream toggle */
const streamToggle = $('#streamToggle');
const onStream = () => !streamToggle.checked;
streamToggle.addEventListener('change', () => {
  $$('.pnode').forEach(n => n.classList.toggle('is-streaming', streamToggle.checked));
});

/* ---------- DEPLOY CONFIGURATOR ---------- */
const est = { cost: $('#estCost'), thr: $('#estThroughput'), boot: $('#estBoot'), ha: $('#estHA') };
function updateEstimate() {
  const clsMult = { standard: 1, performance: 2.2, compute: 4.5 }[$('#deployClass').value];
  const reps = +$('#deployReplicas').value;
  const ha = $('#deployHA').checked, edge = $('#deployEdge').checked;
  let cost = 92 * reps * clsMult;
  if (ha) cost *= 1.4;
  if (edge) cost += 180;
  est.cost.textContent = '£' + Math.round(cost).toLocaleString('en-GB');
  est.thr.textContent = `${Math.round(reps * clsMult * 6)}k evt/s`;
  est.boot.textContent = `${Math.round(edge ? 28 : 42 + clsMult * 6)}s`;
  est.ha.textContent = ha ? '2 × availability zones' : 'single zone';
  drawDeployChart(clsMult, reps);
}
['deployRegion', 'deployClass', 'deployHA', 'deployEdge'].forEach(id =>
  $('#' + id).addEventListener('change', updateEstimate));
$('#deployReplicas').addEventListener('input', e => {
  $('#replicaOut').textContent = e.target.value;
  updateEstimate();
});

function drawDeployChart(clsMult, reps) {
  const c = $('#deployChart'), ctx = c.getContext('2d');
  const w = c.width = c.offsetWidth * devicePixelRatio, h = c.height = 180 * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const W = w / devicePixelRatio, H = h / devicePixelRatio;
  ctx.clearRect(0, 0, W, H);
  const cap = reps * clsMult * 6;
  const pts = Array.from({ length: 40 }, (_, i) =>
    Math.min(cap, (Math.sin(i / 5) * .3 + .55 + rnd(-.06, .06)) * cap * (i / 39 * .5 + .5)));
  ctx.strokeStyle = 'rgba(255,255,255,.07)';
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, H / 4 * i); ctx.lineTo(W, H / 4 * i); ctx.stroke(); }
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#3b82f6'); grad.addColorStop(1, '#a3e635');
  ctx.beginPath();
  pts.forEach((v, i) => { const x = i / (pts.length - 1) * (W - 20) + 10, y = H - 14 - (v / cap) * (H - 34); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
  ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();
  ctx.lineTo(W - 10, H - 10); ctx.lineTo(10, H - 10); ctx.closePath();
  const fill = ctx.createLinearGradient(0, 0, 0, H);
  fill.addColorStop(0, 'rgba(59,130,246,.18)'); fill.addColorStop(1, 'rgba(59,130,246,0)');
  ctx.fillStyle = fill; ctx.fill();
}

/* deploy simulation */
$('#deployBtn').addEventListener('click', () => {
  const btn = $('#deployBtn'), prog = $('#deployProgress'), wrap = $('.progress'), log = $('#deployLog');
  btn.disabled = true; wrap.classList.add('active');
  const steps = [
    'Resolving image axiom/core:4.2.7…',
    `Provisioning ${$('#deployReplicas').value} replicas in ${$('#deployRegion').value}…`,
    'Applying policy bundle (214 rules)…',
    'Warming edge cache…',
    'Deployment healthy ✓ — endpoints live',
  ];
  let i = 0;
  const iv = setInterval(() => {
    log.textContent = steps[i];
    prog.style.width = ((i + 1) / steps.length * 100) + '%';
    if (++i >= steps.length) {
      clearInterval(iv);
      btn.disabled = false;
      btn.textContent = 'Deploy again';
    }
  }, 700);
});

/* ---------- PIPELINE INSPECTOR ---------- */
const STAGES = {
  ingest:   { name: 'Ingest', metrics: [['12.4k/s', 'throughput'], ['0.8%', 'drop rate'], ['6', 'source connectors'], ['TCP+gRPC', 'protocols']] },
  validate: { name: 'Validate', metrics: [['99.97%', 'pass rate'], ['214', 'active rules'], ['1.2ms', 'avg eval time'], ['quarantine', 'failure policy']] },
  transform:{ name: 'Transform', metrics: [['38ms', 'p95 latency'], ['17', 'transforms'], ['WASM', 'runtime'], ['hot-reload', 'deploy mode']] },
  enrich:   { name: 'Enrich', metrics: [['6', 'enrichment sources'], ['4ms', 'lookup time'], ['LRU', 'cache policy'], ['94%', 'cache hit rate']] },
  route:    { name: 'Route', metrics: [['4', 'active sinks'], ['exactly-once', 'delivery'], ['0', 'dead-letter depth'], ['21ms', 'ack latency']] },
};
$$('.pnode').forEach(node => {
  node.addEventListener('click', () => {
    $$('.pnode').forEach(n => n.classList.remove('is-selected'));
    node.classList.add('is-selected');
    const s = STAGES[node.dataset.node];
    $('#inspectBody').hidden = false;
    $('.inspect-hint').hidden = true;
    $('#inspectName').textContent = `Stage: ${s.name}`;
    $('#inspectMetrics').innerHTML = s.metrics.map(([v, l]) =>
      `<div class="inspect-metric"><b>${v}</b><span>${l}</span></div>`).join('');
  });
});
// kick pipeline animation state
$$('.pnode').forEach(n => n.classList.add('is-streaming'));

/* ---------- GAUGE + SCENARIOS ---------- */
const gauge = $('#healthGauge'), gctx = gauge.getContext('2d');
let health = 98.6, targetHealth = 98.6;
function drawGauge() {
  const dpr = devicePixelRatio, W = 220, H = 130;
  gauge.width = W * dpr; gauge.height = H * dpr;
  gctx.scale(dpr, dpr);
  const cx = W / 2, cy = H - 12, r = 88;
  gctx.clearRect(0, 0, W, H);
  gctx.lineWidth = 14; gctx.lineCap = 'round';
  gctx.strokeStyle = 'rgba(255,255,255,.08)';
  gctx.beginPath(); gctx.arc(cx, cy, r, Math.PI, 2 * Math.PI); gctx.stroke();
  const frac = (health - 60) / 40; // 60–100 mapped
  const col = health > 95 ? '#a3e635' : health > 85 ? '#3b82f6' : '#fbbf24';
  const grad = gctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#3b82f6'); grad.addColorStop(1, col);
  gctx.strokeStyle = grad;
  gctx.shadowColor = col; gctx.shadowBlur = 12;
  gctx.beginPath(); gctx.arc(cx, cy, r, Math.PI, Math.PI * (1 + Math.max(0.02, frac))); gctx.stroke();
  gctx.shadowBlur = 0;
  $('#healthVal').textContent = health.toFixed(1);
}
function animateGauge() {
  const diff = targetHealth - health;
  health += diff * .06 + rnd(-.12, .12);
  health = Math.max(60, Math.min(100, health));
  drawGauge();
  requestAnimationFrame(animateGauge);
}
animateGauge();

const SCENARIOS = {
  nominal: 98.6, traffic: 91.2, degrade: 78.4, recovery: 97.9,
};
$('#scenarioSelect').addEventListener('change', e => {
  targetHealth = SCENARIOS[e.target.value];
});

/* ---------- EVENT STREAM + FILTERS ---------- */
const EVENTS = [
  ['ok', 'healthcheck :: all probes green'], ['info', 'deploy.rollout :: canary 25%'],
  ['warn', 'latency.p95 above soft threshold'], ['ok', 'autoscale :: +2 replicas'],
  ['info', 'config.reload :: policy v214 active'], ['warn', 'retry rate elevated on sink s3'],
  ['ok', 'backup :: snapshot verified'], ['info', 'cert rotation :: completed'],
  ['ok', 'slo burn :: 4% of 30d budget'], ['warn', 'dependency: payment-api slow (620ms)'],
];
const eventList = $('#eventList');
let evFilter = 'all', evQuery = '';
function addEvent() {
  if (!onStream()) return;
  const [lvl, msg] = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const row = document.createElement('div');
  row.className = `event-row is-${lvl}`;
  row.dataset.lvl = lvl;
  row.innerHTML = `<span class="t">${new Date().toISOString().slice(11, 19)}</span><span class="lvl ${lvl}">${lvl.toUpperCase()}</span><span>${msg}</span>`;
  eventList.prepend(row);
  while (eventList.children.length > 14) eventList.lastChild.remove();
  applyEventFilters();
}
setInterval(addEvent, 2100);
EVENTS.slice(0, 8).forEach(([lvl, msg], i) => {
  const row = document.createElement('div');
  row.className = `event-row is-${lvl}`;
  row.dataset.lvl = lvl;
  row.innerHTML = `<span class="t">09:4${i}:0${i}</span><span class="lvl ${lvl}">${lvl.toUpperCase()}</span><span>${msg}</span>`;
  eventList.appendChild(row);
});
function applyEventFilters() {
  $$('.event-row', eventList).forEach(r => {
    const matchF = evFilter === 'all' || r.dataset.lvl === evFilter;
    const matchQ = !evQuery || r.textContent.toLowerCase().includes(evQuery);
    r.style.display = matchF && matchQ ? '' : 'none';
  });
}
$$('#eventFilters .chip').forEach(c => c.addEventListener('click', () => {
  $$('#eventFilters .chip').forEach(x => x.classList.remove('is-active'));
  c.classList.add('is-active');
  evFilter = c.dataset.filter;
  applyEventFilters();
}));
$('#eventSearch').addEventListener('input', e => { evQuery = e.target.value.toLowerCase(); applyEventFilters(); });

/* ---------- CAPABILITIES GRID ---------- */
const CAPS = [
  ['Streaming ingest', 'data', 'Fault-tolerant ingestion from 340+ sources with exactly-once semantics.', '340 sources', 'ACTIVE'],
  ['Deterministic transforms', 'data', 'Versioned WASM transforms with hot-reload and full replay.', '1.2M replays', 'ACTIVE'],
  ['Policy engine', 'security', '214 declarative rules evaluated on every event, in-line.', '214 rules', 'ENFORCING'],
  ['Zero-trust access', 'security', 'Per-route mTLS, short-lived credentials, full audit trail.', '100% coverage', 'ENFORCING'],
  ['Autonomous scaling', 'automation', 'Predictive autoscaler reacts before saturation, not after.', '3.2s reaction', 'ACTIVE'],
  ['Workflow orchestration', 'automation', 'Durable workflows with checkpointing and auto-retry.', '48k runs/day', 'ACTIVE'],
  ['Anomaly detection', 'ai', 'Streaming models flag deviations from learned baselines.', '96.4% precision', 'LEARNING'],
  ['Natural-language query', 'ai', 'Ask operational questions; get deterministic, sourced answers.', '<1s answers', 'BETA'],
  ['Unified schema registry', 'data', 'Single source of truth for every contract and version.', '2,190 schemas', 'ACTIVE'],
  ['Cost telemetry', 'automation', 'Per-pipeline cost attribution with budget guardrails.', '±1.8% accuracy', 'ACTIVE'],
  ['Edge presence', 'security', 'Regional compute close to your data, residency-aware.', '11 regions', 'ACTIVE'],
  ['Incident copilot', 'ai', 'Correlates signals into timelines and proposes mitigations.', '−63% MTTR', 'BETA'],
];
const capGrid = $('#capGrid');
capGrid.innerHTML = CAPS.map(([name, cat, desc, stat, status]) => `
  <div class="card cap-card" data-cat="${cat}">
    <span class="cap-cat">${cat.toUpperCase()}</span>
    <div class="cap-meta"><span>${stat}</span><span class="cap-status">● ${status}</span></div>
    <h3>${name}</h3><p>${desc}</p>
    <div class="cap-meter"><i data-w="${(60 + Math.random() * 40).toFixed(0)}"></i></div>
  </div>`).join('');
const capObs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    $$('.cap-meter i', e.target).forEach(i => i.style.width = i.dataset.w + '%');
    capObs.unobserve(e.target);
  }
}), { threshold: .3 });
capGrid.querySelectorAll('.cap-card').forEach(c => capObs.observe(c));
$$('#capFilters .chip').forEach(c => c.addEventListener('click', () => {
  $$('#capFilters .chip').forEach(x => x.classList.remove('is-active'));
  c.classList.add('is-active');
  const cat = c.dataset.cat;
  $$('.cap-card', capGrid).forEach(card =>
    card.classList.toggle('is-hidden', cat !== 'all' && card.dataset.cat !== cat));
}));

/* ---------- PERFORMANCE CHART ---------- */
const perfCanvas = $('#perfChart'), pctx = perfCanvas.getContext('2d');
let perfRange = '1h', hoverX = null;
const RANGE_DATA = {
  '1h': { n: 60, thr: [180, 220], lat: [30, 48] },
  '24h': { n: 96, thr: [120, 240], lat: [28, 62] },
  '7d': { n: 84, thr: [90, 260], lat: [26, 74] },
};
function genSeries(n, [min, max]) {
  const out = []; let v = rnd(min, (min + max) / 2);
  for (let i = 0; i < n; i++) {
    v += rnd(-8, 9);
    const diurnal = Math.sin(i / n * Math.PI * 2) * (max - min) * .3;
    out.push(Math.max(min, Math.min(max, v + diurnal)));
  }
  return out;
}
const seriesCache = {};
function drawPerf() {
  const dpr = devicePixelRatio;
  const W = perfCanvas.offsetWidth, H = perfCanvas.offsetHeight;
  perfCanvas.width = W * dpr; perfCanvas.height = H * dpr;
  pctx.scale(dpr, dpr);
  pctx.clearRect(0, 0, W, H);
  const { n } = RANGE_DATA[perfRange];
  if (!seriesCache[perfRange])
    seriesCache[perfRange] = { thr: genSeries(n, RANGE_DATA[perfRange].thr), lat: genSeries(n, RANGE_DATA[perfRange].lat) };
  const { thr, lat } = seriesCache[perfRange];
  const pad = { l: 44, r: 44, t: 14, b: 26 };
  const maxT = Math.max(...thr) * 1.1, maxL = Math.max(...lat) * 1.3;
  // grid
  pctx.font = '10px JetBrains Mono'; pctx.fillStyle = '#4b5865';
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (H - pad.t - pad.b) * i / 4;
    pctx.strokeStyle = 'rgba(255,255,255,.06)';
    pctx.beginPath(); pctx.moveTo(pad.l, y); pctx.lineTo(W - pad.r, y); pctx.stroke();
    pctx.fillText(Math.round(maxT * (1 - i / 4)) + 'k', 6, y + 3);
    pctx.fillText(Math.round(maxL * (1 - i / 4)) + 'ms', W - 40, y + 3);
  }
  const plot = (arr, color, maxV, fill) => {
    pctx.beginPath();
    arr.forEach((v, i) => {
      const x = pad.l + (W - pad.l - pad.r) * i / (arr.length - 1);
      const y = pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
      i ? pctx.lineTo(x, y) : pctx.moveTo(x, y);
    });
    pctx.strokeStyle = color; pctx.lineWidth = 2; pctx.stroke();
    if (fill) {
      pctx.lineTo(W - pad.r, H - pad.b); pctx.lineTo(pad.l, H - pad.b); pctx.closePath();
      const g = pctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(59,130,246,.15)'); g.addColorStop(1, 'rgba(59,130,246,0)');
      pctx.fillStyle = g; pctx.fill();
    }
  };
  plot(thr, '#3b82f6', maxT, true);
  plot(lat, '#a3e635', maxL, false);
  // hover crosshair
  if (hoverX != null && hoverX > pad.l && hoverX < W - pad.r) {
    const idx = Math.round((hoverX - pad.l) / (W - pad.l - pad.r) * (n - 1));
    const x = pad.l + (W - pad.l - pad.r) * idx / (n - 1);
    pctx.strokeStyle = 'rgba(255,255,255,.25)'; pctx.lineWidth = 1;
    pctx.beginPath(); pctx.moveTo(x, pad.t); pctx.lineTo(x, H - pad.b); pctx.stroke();
    const label = `${Math.round(thr[idx])}k evt/s · ${Math.round(lat[idx])}ms`;
    pctx.fillStyle = 'rgba(11,14,19,.9)';
    const tw = pctx.measureText(label).width + 16;
    const bx = Math.min(x + 8, W - pad.r - tw);
    pctx.beginPath(); pctx.roundRect(bx, pad.t + 6, tw, 24, 6); pctx.fill();
    pctx.strokeStyle = 'rgba(255,255,255,.2)'; pctx.stroke();
    pctx.fillStyle = '#e8edf2'; pctx.fillText(label, bx + 8, pad.t + 22);
  }
  // metrics
  const peak = Math.max(...thr), p95 = [...lat].sort((a, b) => a - b)[Math.floor(n * .95)];
  $('#mThroughput').textContent = peak.toFixed(0) + 'k evt/s';
  $('#mLatency').textContent = p95.toFixed(0) + 'ms';
  $('#mError').textContent = (rnd(1.4, 4.2)).toFixed(1) + '%';
  $('#mEfficiency').textContent = '£' + (rnd(.8, 1.6)).toFixed(2) + '/M evt';
}
perfCanvas.addEventListener('mousemove', e => { hoverX = e.offsetX; drawPerf(); });
perfCanvas.addEventListener('mouseleave', () => { hoverX = null; drawPerf(); });
$$('#rangeTabs .tab').forEach(t => t.addEventListener('click', () => {
  $$('#rangeTabs .tab').forEach(x => x.classList.remove('is-active'));
  t.classList.add('is-active');
  perfRange = t.dataset.range;
  drawPerf();
}));
new ResizeObserver(() => drawPerf()).observe($('.chart-wrap'));
drawPerf();

/* slight live drift on cached series */
setInterval(() => {
  const s = seriesCache[perfRange];
  if (!s) return;
  s.thr = s.thr.map(v => Math.max(20, v + rnd(-2, 2)));
  drawPerf();
}, 2000);

/* ---------- ACCORDION ---------- */
const FEATURES = [
  ['Deterministic replay', 'Every pipeline state is checkpointed. Replay any window — from one minute to one year — with identical results, in a sandboxed environment before touching production.',
    [['<60s', 'year-long replay'], ['100%', 'state fidelity'], ['sandboxed', 'execution']]],
  ['Predictive autoscaling', 'The autoscaler models load 90 seconds ahead using seasonal patterns, scaling before saturation. Rollback guards revert any scaling decision that degrades latency.',
    [['90s', 'forecast horizon'], ['3.2s', 'median reaction'], ['0', 'saturation events*']]],
  ['Policy-as-code', 'Access, retention and routing rules expressed declaratively, versioned in git, evaluated on every event. Violations quarantined — never silently dropped.',
    [['214', 'built-in rules'], ['git-native', 'workflow'], ['quarantine', 'failure mode']]],
  ['Unified observability', 'Metrics, logs, traces and cost attribution correlated on a single timeline. Ask questions in plain language; answers cite the exact underlying events.',
    [['11', 'signal types fused'], ['<1s', 'query latency'], ['sourced', 'every answer']]],
  ['Incident copilot', 'When anomalies fire, the copilot assembles the timeline, isolates the blast radius and drafts a mitigation — a human approves every action.',
    [['−63%', 'mean time to repair'], ['human-gated', 'all actions'], ['24/7', 'coverage']]],
];
$('#accordion').innerHTML = FEATURES.map(([t, d, specs], i) => `
  <div class="acc-item">
    <button class="acc-head" aria-expanded="false">
      <span class="acc-num">0${i + 1}</span><h3>${t}</h3><span class="acc-icon">+</span>
    </button>
    <div class="acc-body"><div class="acc-inner">
      <p>${d}</p>
      <div class="acc-specs">${specs.map(([v, l]) => `<div class="acc-spec"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    </div></div>
  </div>`).join('');
$$('.acc-head').forEach(head => {
  head.addEventListener('click', () => {
    const item = head.parentElement, body = $('.acc-body', item);
    const open = item.classList.contains('is-open');
    $$('.acc-item').forEach(x => { x.classList.remove('is-open'); $('.acc-body', x).style.maxHeight = '0'; $('.acc-head', x).setAttribute('aria-expanded', 'false'); });
    if (!open) {
      item.classList.add('is-open');
      body.style.maxHeight = body.scrollHeight + 'px';
      head.setAttribute('aria-expanded', 'true');
    }
  });
});
// open first panel by default
$('.acc-head').click();

/* ---------- INTEGRATIONS ---------- */
const INTEGRATIONS = [
  ['Snowflake', 'SNW', '#29b5e8', 'Warehouse sync with change-data-capture and schema-drift handling.', '2-way', '<5min lag', 'Data'],
  ['Kafka', 'KFK', '#a3e635', 'Native consumer/producer with exactly-once transactional semantics.', '2-way', 'real-time', 'Streaming'],
  ['PostgreSQL', 'PG', '#3b82f6', 'Logical replication with automatic DDL change propagation.', '2-way', '<10s lag', 'Database'],
  ['Datadog', 'DD', '#774aa4', 'Two-way metric and event exchange with tag mapping.', '2-way', 'real-time', 'Observability'],
  ['Slack', 'SL', '#e01e5a', 'Alert routing, acknowledgment and incident actions in-channel.', 'out', 'real-time', 'Alerting'],
  ['Salesforce', 'SF', '#00a1e0', 'Bulk + streaming API ingestion with relationship flattening.', 'in', '15min lag', 'CRM'],
  ['Stripe', 'ST', '#635bff', 'Webhook ingestion with replay and idempotency guards.', 'in', 'real-time', 'Payments'],
  ['AWS S3', 'S3', '#f90', 'Cold archive with lifecycle policies and integrity proofs.', 'out', 'batch', 'Storage'],
];
const integGrid = $('#integGrid'), integDetail = $('#integDetail');
integGrid.innerHTML = INTEGRATIONS.map(([name, ab, col], i) => `
  <div class="integ-tile" data-i="${i}">
    <span class="integ-logo" style="background:${col}22;color:${col};border:1px solid ${col}44">${ab}</span>
    <b>${name}</b><span>CONNECTOR</span>
  </div>`).join('');
function showInteg(i) {
  const [name, ab, col, desc, dir, lag, cat] = INTEGRATIONS[i];
  $$('.integ-tile').forEach(t => t.classList.toggle('is-selected', +t.dataset.i === i));
  integDetail.innerHTML = `
    <span class="integ-tag mono">CONNECTOR PROFILE · DEMO CATALOGUE</span>
    <h4>${name}</h4>
    <p>${desc}</p>
    <div class="integ-stats">
      <div class="integ-stat"><span>Direction</span><b>${dir}</b></div>
      <div class="integ-stat"><span>Typical latency</span><b>${lag}</b></div>
      <div class="integ-stat"><span>Category</span><b>${cat}</b></div>
      <div class="integ-stat"><span>Auth</span><b>OAuth2 / mTLS</b></div>
      <div class="integ-stat"><span>Setup time</span><b>~7 minutes</b></div>
    </div>`;
}
$$('.integ-tile').forEach(t => t.addEventListener('click', () => showInteg(+t.dataset.i)));
showInteg(1);

/* ---------- PRICING TOGGLE ---------- */
$('#billingToggle').addEventListener('change', e => {
  const annual = e.target.checked;
  $$('.price-amount[data-monthly]').forEach(el => {
    el.textContent = annual ? el.dataset.annual : el.dataset.monthly;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  });
});

/* ---------- CONTACT FORM ---------- */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const status = $('#formStatus');
  const name = $('#cName').value.trim(), email = $('#cEmail').value.trim(), company = $('#cCompany').value.trim();
  if (!name || !email || !company || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    status.className = 'form-status mono err';
    status.textContent = 'ERR :: please complete all fields with a valid work email.';
    return;
  }
  status.className = 'form-status mono';
  status.textContent = 'Validating…';
  setTimeout(() => {
    status.className = 'form-status mono sent';
    status.textContent = `✓ Request queued (SIMULATED). A solutions engineer would contact ${email} within one business day.`;
    e.target.reset();
  }, 900);
});
