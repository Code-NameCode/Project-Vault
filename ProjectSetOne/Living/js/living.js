/* ══════════════════════════════════════════════════
   SOMA · living.js — the organism's nervous system
   ══════════════════════════════════════════════════ */
(() => {
"use strict";

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TOUCH   = matchMedia("(hover: none), (pointer: coarse)").matches;
if (TOUCH) document.body.classList.add("touch");

const rand = (a = 1, b = 0) => Math.random() * (a - b) + b;
const lerp = (a, b, t) => a + (b - a) * t;

/* ── global state: the organism's vitals ─────────── */
const vitals = {
  mx: innerWidth / 2, my: innerHeight / 2,   // pointer
  vx: 0, vy: 0,                              // pointer velocity
  speed: 0,                                  // smoothed speed 0..1
  agitation: 0,                              // 0..1, decays over time
  scrollY: 0,
  scrollP: 0,                                // 0..1 through page
  t: 0,
};
document.body.dataset.alive = "1";

function trackPointer(x, y) {
  const dx = x - vitals.mx, dy = y - vitals.my;
  vitals.vx = dx; vitals.vy = dy;
  const s = Math.min(1, Math.hypot(dx, dy) / 60);
  vitals.speed = lerp(vitals.speed, s, 0.3);
  vitals.agitation = Math.min(1, vitals.agitation + s * 0.06);
  vitals.mx = x; vitals.my = y;
}
addEventListener("mousemove", e => trackPointer(e.clientX, e.clientY), { passive: true });
addEventListener("touchmove", e => {
  const t = e.touches[0];
  if (t) trackPointer(t.clientX, t.clientY);
}, { passive: true });
addEventListener("scroll", () => {
  vitals.scrollY = scrollY;
  vitals.scrollP = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
}, { passive: true });

/* agitation decays — the organism calms down */
setInterval(() => { vitals.agitation = Math.max(0, vitals.agitation - 0.02); }, 100);

/* ══════════════════════════════════════════════════
   1 · AMBIENT FIELD — fullscreen drifting cells
   ══════════════════════════════════════════════════ */
const ambient = document.getElementById("ambient");
const actx = ambient.getContext("2d");
let cells = [];

function sizeAmbient() {
  ambient.width = innerWidth; ambient.height = innerHeight;
  const n = REDUCED ? 6 : Math.min(16, Math.round(innerWidth / 110));
  cells = Array.from({ length: n }, () => ({
    x: rand(innerWidth), y: rand(innerHeight),
    r: rand(260, 90), vx: rand(.25, -.25), vy: rand(.18, -.18),
    hue: [286, 338, 14, 74][Math.floor(rand(4))],
    ph: rand(Math.PI * 2),
  }));
}
sizeAmbient();
addEventListener("resize", sizeAmbient);

function drawAmbient() {
  const { width: w, height: h } = ambient;
  actx.clearRect(0, 0, w, h);
  // atmospheric wash that shifts with scroll
  const g = actx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, `hsl(272 42% ${7 + vitals.scrollP * 4}%)`);
  g.addColorStop(1, `hsl(${340 - vitals.scrollP * 60} 35% 6%)`);
  actx.fillStyle = g; actx.fillRect(0, 0, w, h);

  for (const c of cells) {
    if (!REDUCED) {
      c.x += c.vx + (vitals.mx - c.x) * 0.0006 * (1 + vitals.agitation);
      c.y += c.vy + (vitals.my - c.y) * 0.0006 * (1 + vitals.agitation);
      // slow drift wrap
      if (c.x < -c.r) c.x = w + c.r; if (c.x > w + c.r) c.x = -c.r;
      if (c.y < -c.r) c.y = h + c.r; if (c.y > h + c.r) c.y = -c.r;
    }
    const pulse = 1 + Math.sin(vitals.t * 0.6 + c.ph) * 0.12 * (0.5 + vitals.agitation);
    const rg = actx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * pulse);
    rg.addColorStop(0, `hsla(${c.hue} 60% 40% / ${0.16 + vitals.agitation * 0.1})`);
    rg.addColorStop(1, "transparent");
    actx.fillStyle = rg;
    actx.beginPath(); actx.arc(c.x, c.y, c.r * pulse, 0, Math.PI * 2); actx.fill();
  }
}

/* ══════════════════════════════════════════════════
   2 · HERO — metaball organism reacting to cursor
   ══════════════════════════════════════════════════ */
const heroC = document.getElementById("heroCanvas");
const hctx = heroC.getContext("2d");
let blobs = [], sparks = [];

function sizeHero() {
  const hero = document.getElementById("hero");
  heroC.width = hero.offsetWidth; heroC.height = hero.offsetHeight;
  blobs = Array.from({ length: 7 }, (_, i) => ({
    bx: rand(heroC.width), by: rand(heroC.height),
    ph: rand(Math.PI * 2), sp: rand(0.5, 0.15),
    r: rand(heroC.height * 0.30, heroC.height * 0.14),
    follow: 0.02 + i * 0.008, // each blob follows cursor with lag
    x: rand(heroC.width), y: rand(heroC.height),
  }));
}
sizeHero();
addEventListener("resize", sizeHero);

function drawHero() {
  const w = heroC.width, h = heroC.height;
  hctx.clearRect(0, 0, w, h);
  const rect = heroC.getBoundingClientRect();
  const lx = vitals.mx - rect.left, ly = vitals.my - rect.top;

  // metaball bodies (drawn as soft overlapping orbs)
  const pts = [];
  for (const b of blobs) {
    const tx = lx + Math.cos(vitals.t * b.sp * 2 + b.ph) * (60 + b.r * 0.6);
    const ty = ly + Math.sin(vitals.t * b.sp * 1.6 + b.ph * 1.3) * (50 + b.r * 0.5);
    b.x = lerp(b.x, REDUCED ? b.bx : tx, b.follow * (REDUCED ? 0 : 1));
    b.y = lerp(b.y, REDUCED ? b.by : ty, b.follow * (REDUCED ? 0 : 1));
    pts.push(b);
  }

  // threshold-ish look: layered radial gradients with screen-ish blending
  hctx.globalCompositeOperation = "lighter";
  for (const b of pts) {
    const r = b.r * (1 + Math.sin(vitals.t + b.ph) * 0.1 * (0.4 + vitals.agitation));
    const g = hctx.createRadialGradient(b.x, b.y, r * 0.1, b.x, b.y, r);
    g.addColorStop(0, "rgba(255,107,74,0.5)");
    g.addColorStop(0.5, "rgba(224,54,124,0.22)");
    g.addColorStop(1, "rgba(58,18,82,0)");
    hctx.fillStyle = g;
    hctx.beginPath(); hctx.arc(b.x, b.y, r, 0, Math.PI * 2); hctx.fill();
  }
  hctx.globalCompositeOperation = "source-over";

  // sparks: mouse-reactive particles emitted by movement
  if (!REDUCED && vitals.speed > 0.25 && Math.random() < vitals.speed * 0.7) {
    sparks.push({
      x: lx + rand(30, -30), y: ly + rand(30, -30),
      vx: rand(1.4, -1.4), vy: rand(-0.4, -1.8),
      life: 1, r: rand(2.6, 0.8),
      hue: [16, 338, 74][Math.floor(rand(3))],
    });
  }
  hctx.globalCompositeOperation = "lighter";
  sparks = sparks.filter(s => s.life > 0);
  for (const s of sparks) {
    s.x += s.vx + (vitals.vx * 0.06); s.y += s.vy;
    s.vx *= 0.97; s.vy *= 0.97;
    s.life -= 0.016;
    hctx.fillStyle = `hsla(${s.hue} 85% 62% / ${s.life * 0.8})`;
    hctx.beginPath(); hctx.arc(s.x, s.y, s.r * s.life + 0.3, 0, Math.PI * 2); hctx.fill();
  }
  hctx.globalCompositeOperation = "source-over";
  if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
}

/* hero headline: letters lean toward the cursor (dynamic typography) */
const heroTitle = document.getElementById("heroTitle");
function initTitleMorph() {
  if (REDUCED) return;
  document.querySelectorAll("#heroTitle .line").forEach(line => {
    const text = line.textContent;
    line.textContent = "";
    [...text].forEach(ch => {
      const s = document.createElement("span");
      s.textContent = ch === " " ? "\u00A0" : ch;
      s.style.display = "inline-block";
      s.style.transition = "transform .35s cubic-bezier(.22,1,.36,1)";
      line.appendChild(s);
    });
    const rect = () => line.getBoundingClientRect();
    line.addEventListener("mousemove", e => {
      const r = rect();
      [...line.children].forEach((s, i) => {
        const sr = s.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (sr.left + sr.width / 2), e.clientY - (sr.top + sr.height / 2));
        const f = Math.max(0, 1 - d / 160);
        s.style.transform =
          `translateY(${-f * 14}px) rotate(${(e.clientX - sr.left - sr.width / 2) / 22 * f}deg) scale(${1 + f * 0.12})`;
        s.style.color = f > 0.55 ? "var(--acid)" : "";
      });
    });
    line.addEventListener("mouseleave", () => {
      [...line.children].forEach(s => { s.style.transform = ""; s.style.color = ""; });
    });
  });
}
initTitleMorph();

/* ══════════════════════════════════════════════════
   3 · PULSE — morphing SVG blob + live readout
   ══════════════════════════════════════════════════ */
const blobPath = document.getElementById("blobPath");
const N = 10;
function blobD(t) {
  const cx = 200, cy = 200, base = 130;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const wob = 1
      + Math.sin(t * 1.3 + i * 1.7) * (0.10 + vitals.agitation * 0.22)
      + Math.cos(t * 0.7 - i * 2.3) * (0.06 + vitals.agitation * 0.14);
    const r = base * wob;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  // smooth closed catmull-rom-ish path
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= N; i++) {
    const p = pts[i % N], prev = pts[i - 1];
    const mx = (prev[0] + p[0]) / 2, my = (prev[1] + p[1]) / 2;
    d += ` Q ${prev[0].toFixed(1)} ${prev[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + " Z";
}
const bpmEl = document.getElementById("bpm");
const agEl = document.getElementById("agitation");
const vitalsTxt = document.getElementById("vitals");

function updatePulse() {
  if (blobPath) blobPath.setAttribute("d", blobD(vitals.t));
  if (bpmEl) bpmEl.textContent = Math.round(60 + vitals.agitation * 60);
  if (agEl) agEl.textContent = vitals.agitation.toFixed(2);
  if (vitalsTxt) {
    const mood =
      vitals.agitation > 0.55 ? "excited — you move fast" :
      vitals.agitation > 0.2  ? "curious — it senses you" :
      vitals.scrollP > 0.1    ? "walking with you" :
      "listening for you";
    if (vitalsTxt.textContent !== mood) vitalsTxt.textContent = mood;
  }
}

/* ══════════════════════════════════════════════════
   4 · GALLERY — procedurally grown specimens
   ══════════════════════════════════════════════════ */
const specimenGrid = document.getElementById("specimens");
const specimens = [];

// tiny seeded PRNG so each specimen is a unique "seed"
function mulberry(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function growSpecimen(sp) {
  const { ctx: c, cv } = sp;
  const w = cv.width = cv.offsetWidth * devicePixelRatio;
  const h = cv.height = cv.offsetHeight * devicePixelRatio;
  const rng = mulberry(Math.floor(rand(1e9)));
  const hue = Math.floor(rng() * 360);
  const style = Math.floor(rng() * 3); // 3 growth archetypes
  c.clearRect(0, 0, w, h);
  c.fillStyle = `hsl(${hue} 30% 8%)`; c.fillRect(0, 0, w, h);
  c.lineCap = "round";

  if (style === 0) { // branching veins
    const branch = (x, y, a, len, depth) => {
      if (depth <= 0 || len < 4) return;
      const nx = x + Math.cos(a) * len, ny = y + Math.sin(a) * len;
      c.strokeStyle = `hsla(${hue + depth * 14} 70% ${35 + depth * 8}% / .8)`;
      c.lineWidth = depth * 1.3 * devicePixelRatio;
      c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
      const n = 2 + (rng() > 0.7 ? 1 : 0);
      for (let i = 0; i < n; i++)
        branch(nx, ny, a + (rng() - 0.5) * 1.6, len * (0.62 + rng() * 0.2), depth - 1);
    };
    for (let i = 0; i < 3; i++)
      branch(w * (0.2 + rng() * 0.6), h, -Math.PI / 2 + (rng() - 0.5) * 0.8, h * 0.22, 7);
  } else if (style === 1) { // coral rings
    for (let i = 0; i < 26; i++) {
      const x = rng() * w, y = rng() * h, r = (4 + rng() * 30) * devicePixelRatio;
      c.strokeStyle = `hsla(${hue + rng() * 60} 75% ${40 + rng() * 30}% / ${0.25 + rng() * 0.5})`;
      c.lineWidth = rng() * 3 * devicePixelRatio;
      c.beginPath();
      c.ellipse(x, y, r, r * (0.4 + rng() * 0.6), rng() * Math.PI, 0, Math.PI * 2);
      c.stroke();
    }
  } else { // silk threads
    for (let i = 0; i < 40; i++) {
      c.strokeStyle = `hsla(${hue + i * 3} 70% ${45 + rng() * 25}% / .5)`;
      c.lineWidth = (0.6 + rng() * 1.4) * devicePixelRatio;
      c.beginPath();
      let x = rng() * w, y = 0;
      c.moveTo(x, y);
      while (y < h) {
        y += h / 14; x += (rng() - 0.5) * w / 7;
        c.lineTo(x, y);
      }
      c.stroke();
    }
  }
  sp.tagEl.textContent = `specimen · ${style === 0 ? "veins" : style === 1 ? "coral" : "silk"}`;
  sp.cv.classList.remove("growing"); void sp.cv.offsetWidth; sp.cv.classList.add("growing");
}

if (specimenGrid) {
  const count = innerWidth < 640 ? 6 : 9;
  for (let i = 0; i < count; i++) {
    const cell = document.createElement("div");
    cell.className = "specimen reveal";
    cell.style.transitionDelay = `${i * 0.06}s`;
    const cv = document.createElement("canvas");
    const tag = document.createElement("span");
    tag.className = "tag"; tag.textContent = "germinating…";
    cell.append(cv, tag);
    specimenGrid.appendChild(cell);
    const sp = { cv, ctx: cv.getContext("2d"), tagEl: tag, cell };
    specimens.push(sp);
    cell.addEventListener("click", () => growSpecimen(sp));
    // pointer drag disturbs growth: re-seed slightly on drag end
    cell.addEventListener("pointerup", () => { if (Math.random() < 0.4) growSpecimen(sp); });
  }
  const growAll = () => specimens.forEach(growSpecimen);
  document.getElementById("regrowAll").addEventListener("click", growAll);
  // grow when they first scroll into view
  new IntersectionObserver((es, obs) => {
    es.forEach(e => { if (e.isIntersecting) { growAll(); obs.disconnect(); } });
  }, { threshold: 0.25 }).observe(specimenGrid);
  addEventListener("resize", () => specimens.forEach(growSpecimen));
}

/* ══════════════════════════════════════════════════
   5 · ORGAN DEMOS
   ══════════════════════════════════════════════════ */
const demos = []; // each demo registers a draw() into the master heartbeat

function canvasLocal(cv, e) {
  const r = cv.getBoundingClientRect();
  return [e.clientX - r.left, e.clientY - r.top];
}

/* 5a · fluid ripple — sinewave field warped by pointer */
(function fluidDemo() {
  const cv = document.getElementById("demoFluid");
  if (!cv) return;
  const c = cv.getContext("2d");
  let px = -999, py = -999, ripples = [];
  cv.addEventListener("pointermove", e => { [px, py] = canvasLocal(cv, e); });
  cv.addEventListener("pointerdown", e => {
    const [x, y] = canvasLocal(cv, e);
    ripples.push({ x, y, r: 0, life: 1 });
    if (ripples.length > 6) ripples.shift();
  });
  function size() { cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio; }
  size(); addEventListener("resize", size);

  function draw() {
    const w = cv.width, h = cv.height;
    c.fillStyle = "rgba(12,6,20,.35)"; c.fillRect(0, 0, w, h); // motion trails
    const gap = 16 * devicePixelRatio;
    for (let x = gap; x < w; x += gap) {
      for (let y = gap; y < h; y += gap) {
        const dx = x - px * devicePixelRatio, dy = y - py * devicePixelRatio;
        const d = Math.hypot(dx, dy);
        const push = Math.max(0, 1 - d / (170 * devicePixelRatio));
        const ox = (dx / (d + 1)) * push * 14 * devicePixelRatio;
        const oy = (dy / (d + 1)) * push * 14 * devicePixelRatio
                 + Math.sin(vitals.t * 2 + x * 0.02 / devicePixelRatio) * 2;
        const sz = (1 + push * 3) * devicePixelRatio;
        c.fillStyle = `hsla(${338 + push * 90} 80% ${40 + push * 35}% / ${0.35 + push * 0.6})`;
        c.beginPath(); c.arc(x + ox, y + oy, sz, 0, Math.PI * 2); c.fill();
      }
    }
    ripples = ripples.filter(rp => rp.life > 0);
    for (const rp of ripples) {
      rp.r += 5 * devicePixelRatio; rp.life -= 0.012;
      c.strokeStyle = `hsla(74 80% 60% / ${rp.life})`;
      c.lineWidth = 2 * devicePixelRatio * rp.life;
      c.beginPath(); c.arc(rp.x * devicePixelRatio, rp.y * devicePixelRatio, rp.r, 0, Math.PI * 2); c.stroke();
    }
  }
  demos.push(draw);
})();

/* 5b · swarm — boids fleeing the cursor */
(function swarmDemo() {
  const cv = document.getElementById("demoSwarm");
  if (!cv) return;
  const c = cv.getContext("2d");
  let px = -9999, py = -9999, boids = [];
  cv.addEventListener("pointermove", e => { [px, py] = canvasLocal(cv, e); });
  cv.addEventListener("pointerleave", () => { px = py = -9999; });
  function size() {
    cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio;
    if (!boids.length) {
      const n = REDUCED ? 30 : 80;
      boids = Array.from({ length: n }, () => ({
        x: rand(cv.width), y: rand(cv.height),
        vx: rand(1, -1), vy: rand(1, -1),
        hue: rand(60, 0),
      }));
    }
  }
  size(); addEventListener("resize", size);

  function draw() {
    const w = cv.width, h = cv.height;
    c.fillStyle = "rgba(12,6,20,.28)"; c.fillRect(0, 0, w, h);
    const mx = px * devicePixelRatio, my = py * devicePixelRatio;
    for (const b of boids) {
      const dx = b.x - mx, dy = b.y - my, d = Math.hypot(dx, dy);
      const flee = Math.max(0, 1 - d / (150 * devicePixelRatio));
      if (flee > 0) { b.vx += (dx / (d + 1)) * flee * 1.6; b.vy += (dy / (d + 1)) * flee * 1.6; }
      // gentle cohesion to centre
      b.vx += (w / 2 - b.x) * 0.0004; b.vy += (h / 2 - b.y) * 0.0004;
      b.vx *= 0.96; b.vy *= 0.96;
      const sp = Math.hypot(b.vx, b.vy), max = (2 + flee * 4) * devicePixelRatio * 0.7;
      if (sp > max) { b.vx = b.vx / sp * max; b.vy = b.vy / sp * max; }
      if (!REDUCED) { b.x += b.vx; b.y += b.vy; }
      if (b.x < 0) b.x = w; if (b.x > w) b.x = 0;
      if (b.y < 0) b.y = h; if (b.y > h) b.y = 0;
      c.fillStyle = `hsla(${338 + flee * 80} 85% ${55 + flee * 25}% / .9)`;
      c.beginPath(); c.arc(b.x, b.y, (1.4 + flee * 1.6) * devicePixelRatio, 0, Math.PI * 2); c.fill();
    }
  }
  demos.push(draw);
})();

/* 5c · kinetic type — letters scatter from cursor */
(function typeDemo() {
  const cv = document.getElementById("demoType");
  if (!cv) return;
  const c = cv.getContext("2d");
  const word = "SOMA·TYPE";
  let px = -9999, py = -9999, glyphs = [];
  cv.addEventListener("pointermove", e => { [px, py] = canvasLocal(cv, e); });
  cv.addEventListener("pointerleave", () => { px = py = -9999; });
  function size() {
    cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio;
    const fs = cv.width / (word.length + 1);
    glyphs = [...word].map((ch, i) => ({
      ch, hx: fs * (i + 0.9), hy: cv.height / 2,
      x: fs * (i + 0.9), y: cv.height / 2, vx: 0, vy: 0,
      fs,
    }));
  }
  size(); addEventListener("resize", size);

  function draw() {
    const w = cv.width, h = cv.height;
    c.clearRect(0, 0, w, h);
    const mx = px * devicePixelRatio, my = py * devicePixelRatio;
    for (const g of glyphs) {
      const dx = g.x - mx, dy = g.y - my, d = Math.hypot(dx, dy);
      const f = Math.max(0, 1 - d / (120 * devicePixelRatio));
      if (f > 0) { g.vx += (dx / (d + 1)) * f * 3; g.vy += (dy / (d + 1)) * f * 3; }
      g.vx += (g.hx - g.x) * 0.08; g.vy += (g.hy - g.y) * 0.08;
      g.vx *= 0.85; g.vy *= 0.85;
      if (!REDUCED) { g.x += g.vx; g.y += g.vy; }
      c.font = `italic ${g.fs * (1 + f * 0.25)}px Fraunces, serif`;
      c.textAlign = "center"; c.textBaseline = "middle";
      c.fillStyle = `hsla(${338 + f * 80} ${40 + f * 50}% ${70 + f * 20}% / ${0.5 + f * 0.5})`;
      c.fillText(g.ch, g.x, g.y);
    }
  }
  demos.push(draw);
})();



/* ══════════════════════════════════════════════════
   6 · CUSTOM CURSOR
   ══════════════════════════════════════════════════ */
const cursor = document.getElementById("cursor");
if (!TOUCH && cursor) {
  addEventListener("mousemove", e => {
    cursor.style.transform =
      `translate(${e.clientX}px,${e.clientY}px) scale(${1 + vitals.agitation * 0.35})`;
  }, { passive: true });
  document.querySelectorAll("a,button,input,textarea,.specimen,[data-morph]")
    .forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hot"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hot"));
    });
}

/* ══════════════════════════════════════════════════
   7 · SOUND — procedural ambient drone (WebAudio)
   ══════════════════════════════════════════════════ */
let audio = null;
function buildAudio() {
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  const master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
  // two detuned sines + slow filter LFO = organic drone
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass"; filter.frequency.value = 320; filter.connect(master);
  [55, 82.5, 110.3].forEach((f, i) => {
    const o = ac.createOscillator(); o.type = "sine"; o.frequency.value = f;
    const g = ac.createGain(); g.gain.value = 0.22 - i * 0.05;
    o.connect(g); g.connect(filter); o.start();
  });
  const lfo = ac.createOscillator(); lfo.frequency.value = 0.07;
  const lfoG = ac.createGain(); lfoG.gain.value = 140;
  lfo.connect(lfoG); lfoG.connect(filter.frequency); lfo.start();
  return { ac, master, filter };
}
const soundBtn = document.getElementById("soundToggle");
soundBtn?.addEventListener("click", () => {
  if (!audio) audio = buildAudio();
  const on = soundBtn.getAttribute("aria-pressed") !== "true";
  soundBtn.setAttribute("aria-pressed", on);
  audio.ac.resume();
  audio.master.gain.linearRampToValueAtTime(on ? 0.12 : 0, audio.ac.currentTime + 0.8);
});

/* ══════════════════════════════════════════════════
   8 · SCROLL REVEALS + FOOTER VITALS
   ══════════════════════════════════════════════════ */
document.querySelectorAll("h2, h3, .organ-lede, .micro, .contact-copy p, .specimen")
  .forEach(el => el.classList.add("reveal"));
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const footVitals = document.getElementById("footVitals");
setInterval(() => {
  if (footVitals)
    footVitals.textContent =
      `pulse ${Math.round(60 + vitals.agitation * 60)} bpm · depth ${Math.round(vitals.scrollP * 100)}%`;
}, 600);

/* ══════════════════════════════════════════════════
   9 · CONTACT — form warms as you type
   ══════════════════════════════════════════════════ */
const form = document.getElementById("signalForm");
if (form) {
  const fields = form.querySelectorAll("input,textarea");
  const echo = document.getElementById("formEcho");
  fields.forEach(f => f.addEventListener("input", () => {
    vitals.agitation = Math.min(1, vitals.agitation + 0.03); // typing excites it
    const chars = [...fields].reduce((n, x) => n + x.value.length, 0);
    if (echo) echo.textContent = chars ? `receiving… ${chars} characters of signal` : "";
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const msg = form.message.value.trim();
    if (!msg) { echo.textContent = "the organism needs words to hold onto."; return; }
    echo.textContent = "✓ signal received. it will dream about it tonight.";
    vitals.agitation = 1;
    form.reset();
  });
}

/* ══════════════════════════════════════════════════
   10 · MASTER HEARTBEAT
   ══════════════════════════════════════════════════ */
function beat() {
  vitals.t += REDUCED ? 0 : 0.016;
  vitals.speed = lerp(vitals.speed, 0, 0.08); // decay pointer speed
  drawAmbient();
  drawHero();
  demos.forEach(d => d());
  updatePulse();
  requestAnimationFrame(beat);
}
beat();

})();
