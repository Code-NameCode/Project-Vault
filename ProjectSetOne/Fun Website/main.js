/* ═══════════════════════════════════════════════════════════
   GOODSTUFF DESIGNS — main.js
   Vanilla only. One rAF loop drives cursor, magnetic, smooth
   scroll, parallax, counters and the horizontal gallery.
   ═══════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, mi, ma) => Math.max(mi, Math.min(ma, v));

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ── 1. PRELOADER ─────────────────────────────────────── */
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loaderCount");
  const loaderBar = document.getElementById("loaderBar");
  {
    let p = 0;
    const tick = () => {
      p = Math.min(100, p + Math.random() * 16 + 6);
      loaderCount.textContent = String(Math.floor(p)).padStart(2, "0");
      loaderBar.style.width = p + "%";
      if (p < 100) setTimeout(tick, 90 + Math.random() * 90);
      else setTimeout(() => {
        loader.classList.add("is-done");
        document.body.classList.add("is-loaded");
        revealHero();
      }, 250);
    };
    if (reduced) { loader.remove(); document.body.classList.add("is-loaded"); revealHero(); }
    else setTimeout(tick, 200);
  }

  /* ── 2. SPLIT TEXT ────────────────────────────────────── */
  // Wrap each character for staggered reveals, PRESERVING child elements
  // (e.g. the lime <i class="tick">.</i> accent inside outline lines).
  document.querySelectorAll("[data-split] .line").forEach(line => {
    const frag = document.createDocumentFragment();
    for (const node of [...line.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) { frag.appendChild(node); continue; }
      for (const ch of node.textContent) {
        const s = document.createElement("span");
        if (ch === " ") { s.className = "char char--space"; }
        else { s.className = "char"; s.textContent = ch; }
        frag.appendChild(s);
      }
    }
    line.textContent = "";
    line.appendChild(frag);
  });

  function revealHero() {
    document.querySelectorAll(".hero [data-split] .line, .contact__mega").forEach((line, li) => {
      line.querySelectorAll(".char").forEach((ch, i) => {
        ch.style.transition = `transform 0.8s cubic-bezier(0.16,1,0.3,1) ${(li * 0.12 + i * 0.028).toFixed(3)}s`;
        ch.style.transform = "translateY(0) rotate(0)";
      });
    });
    document.querySelectorAll(".hero .reveal-line__inner").forEach((el, i) => {
      el.style.transition = `transform 1s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.15}s`;
      el.style.transform = "translateY(0)";
    });
  }

  /* ── 3. SCROLL-TRIGGERED REVEALS ──────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in-view");
      // stagger chars for section titles
      if (e.target.hasAttribute("data-split")) {
        e.target.querySelectorAll(".char").forEach((ch, i) => {
          ch.style.transition = `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${(i * 0.022).toFixed(3)}s`;
          ch.style.transform = "translateY(0) rotate(0)";
        });
      }
      io.unobserve(e.target);
    });
  }, { threshold: 0.18 });
  document.querySelectorAll("[data-split], .reveal-line, .acc__item, .card, .stat, .cmp").forEach(el => io.observe(el));

  /* manifesto: per-word fade in (set up below, after io2) */

  /* ── 4. SMOOTH SCROLL (lerped transform wrapper) ──────── */
  const smooth = document.getElementById("smooth");
  let targetY = window.scrollY, currentY = targetY;
  let refreshHeight = () => {};
  if (!reduced && !isTouch) {
    refreshHeight = () => { document.body.style.height = smooth.getBoundingClientRect().height + "px"; };
    refreshHeight();
    window.addEventListener("resize", refreshHeight);
    document.body.classList.add("is-smooth");
    smooth.style.position = "fixed";
    smooth.style.top = "0";
    smooth.style.left = "0";
    smooth.style.width = "100%";
    window.addEventListener("scroll", () => { targetY = window.scrollY; }, { passive: true });
  } else {
    targetY = currentY = window.scrollY;
  }

  /* ── 5. CUSTOM CURSOR + MAGNETIC ──────────────────────── */
  const cursor = document.querySelector(".cursor");
  const curDot = cursor.querySelector(".cursor__dot");
  const curRing = cursor.querySelector(".cursor__ring");
  const curLabel = cursor.querySelector(".cursor__label");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  let magnetEl = null, magnetOff = { x: 0, y: 0 };

  if (!isTouch && !reduced) {
    document.body.classList.add("has-cursor");
    window.addEventListener("mousemove", e => {
      mx = e.clientX; my = e.clientY;
      const t = e.target;
      const link = t.closest("a, button, summary, .cmp__handle");
      const view = t.closest(".card");
      cursor.classList.toggle("is-view", !!view && !link);
      cursor.classList.toggle("is-link", !!link);
      curLabel.textContent = view && !link ? "VIEW" : "";
    }, { passive: true });
    document.querySelectorAll("[data-magnetic]").forEach(el => {
      el.addEventListener("mouseenter", () => (magnetEl = el));
      el.addEventListener("mouseleave", () => { el.style.transform = ""; magnetEl = null; });
    });
  }

  /* ── 6. PARALLAX ──────────────────────────────────────── */
  const parallaxEls = [...document.querySelectorAll("[data-parallax]")].map(el => ({
    el, speed: parseFloat(el.dataset.parallax) || 0.15,
  }));
  const pImgEls = [...document.querySelectorAll("[data-parallax-img] img")];

  /* ── 7. HORIZONTAL GALLERY ────────────────────────────── */
  const hgal = document.querySelector(".hgal");
  const hgalTrack = document.getElementById("hgalTrack");
  const hgalPin = document.querySelector(".hgal__pin");
  const hgalBar = document.getElementById("hgalBar");
  const hgalCap = document.getElementById("hgalCap");
  const hgalPinned = !reduced && !isTouch;
  if (hgalPinned) {
    // fixed 320vh of scroll room feels right for a ~3.5-viewport-wide track
    hgal.style.height = "320vh";
  } else {
    // native fallback: swipeable strip instead of scroll-driven pinning
    hgal.classList.add("is-native");
  }
  refreshHeight();
  const caps = [...hgalTrack.querySelectorAll("[data-cap]")];

  /* manifesto: per-word fade in */
  const manifesto = document.getElementById("manifesto");
  const io2 = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".w").forEach((w, i) => {
        setTimeout(() => (w.style.opacity = "1"), i * 55);
      });
      io2.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  if (manifesto) {
    const html = manifesto.innerHTML;
    // split into words, keeping <em> wrappers
    manifesto.innerHTML = html.replace(/(<em>|<\/em>|\s)/g, "\n").split("\n").filter(Boolean)
      .map(w => w === "<em>" || w === "</em>" ? w : `<span class="w">${w}</span>`).join(" ");
    io.observe(manifesto);
    io2.observe(manifesto);
  }

  /* ── 8. COUNTERS ──────────────────────────────────────── */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const pre = el.dataset.prefix || "";
      const suf = el.dataset.suffix || "";
      const dec = end % 1 ? 1 : 0;
      const t0 = performance.now(), dur = reduced ? 1 : 1600;
      const step = now => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (end * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(el => countIO.observe(el));

  /* ── 9. MENU ──────────────────────────────────────────── */
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menuBtn");
  const setMenu = open => {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (open) menu.querySelector("a").focus();
  };
  menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* ── 10. CASE OVERLAY ─────────────────────────────────── */
  const CASES = {
    web: {
      img: "assets/work-web.jpg", kicker: "01 / WEB DESIGN", title: "Meridian Brew",
      lead: "A specialty roastery needed a store that felt like their cupping room — warm, precise, obsessive. We rebuilt everything around the story of each batch, then tuned the checkout until it disappeared.",
      scope: "Brand refresh · E-commerce build · Photography direction · SEO",
      stack: "Custom WordPress theme · Headless checkout · CDN edge",
      out: "Conversion up 3.1× in the first quarter; average load under one second on 4G.",
    },
    ai: {
      img: "assets/work-ai.jpg", kicker: "02 / AI", title: "Atlas AI",
      lead: "A hardware distributor's sales team was drowning in a 40,000-line catalogue. We trained an assistant on their data that answers spec questions, drafts quotes and flags cross-sell opportunities in seconds.",
      scope: "Discovery · Data pipeline · Assistant build · Team onboarding",
      stack: "RAG over product catalogue · Vector search · WhatsApp + web interface",
      out: "Quote turnaround dropped from hours to minutes; support tickets down 38%.",
    },
    brand: {
      img: "assets/work-brand.jpg", kicker: "03 / BRAND & MARKETING", title: "Kinetic Rebrand",
      lead: "A logistics disruptor with start-up energy and enterprise clients. We rebuilt the identity around motion, then ran the campaign engine — content, socials, ads — as one continuous system.",
      scope: "Identity system · Campaign concept · Content engine · Paid social",
      stack: "Design system · Motion toolkit · Monthly content pipeline",
      out: "Campaign reach 4.7× previous year; inbound enquiries doubled within two months.",
    },
    host: {
      img: "assets/work-host.jpg", kicker: "04 / HOSTING & IT", title: "Vaultwall",
      lead: "Sixty businesses, one promise: nothing falls over and nobody waits. Managed hosting, hardened email, monitored backups and support that answers before the kettle boils.",
      scope: "Infrastructure · Migration · Monitoring · 24/7 support",
      stack: "Hardened VPS fleet · Automated backups · Proactive monitoring",
      out: "99.98% measured uptime across the fleet; average support reply under two hours.",
    },
  };
  const caseEl = document.getElementById("case");
  const caseImg = document.getElementById("caseImg");
  const openCase = key => {
    const c = CASES[key]; if (!c) return;
    caseImg.src = c.img;
    caseImg.alt = c.title + " case study visual";
    document.getElementById("caseKicker").textContent = c.kicker;
    document.getElementById("caseTitle").textContent = c.title;
    document.getElementById("caseLead").textContent = c.lead;
    document.getElementById("caseScope").textContent = c.scope;
    document.getElementById("caseStack").textContent = c.stack;
    document.getElementById("caseOut").textContent = c.out;
    caseEl.classList.add("is-open");
    caseEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("case-open");
    caseEl.querySelector(".case__close").focus();
  };
  const closeCase = () => {
    caseEl.classList.remove("is-open");
    caseEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("case-open");
  };
  document.querySelectorAll(".card").forEach(card =>
    card.addEventListener("click", () => openCase(card.dataset.case)));
  caseEl.querySelectorAll("[data-case-close]").forEach(el => el.addEventListener("click", closeCase));
  window.addEventListener("keydown", e => { if (e.key === "Escape") closeCase(); });

  /* ── 11. DRAG COMPARISON ──────────────────────────────── */
  const cmp = document.getElementById("cmp");
  const cmpAfter = document.getElementById("cmpAfter");
  const cmpHandle = document.getElementById("cmpHandle");
  let cmpVal = 50, cmpDragging = false;
  const setCmp = v => {
    cmpVal = clamp(v, 2, 98);
    cmpAfter.style.clipPath = `inset(0 0 0 ${cmpVal}%)`;
    cmpHandle.style.left = cmpVal + "%";
    cmpHandle.setAttribute("aria-valuenow", Math.round(cmpVal));
  };
  setCmp(50);
  const cmpFromEvent = e => {
    const r = cmp.getBoundingClientRect();
    setCmp(((e.clientX - r.left) / r.width) * 100);
  };
  cmpHandle.addEventListener("pointerdown", e => {
    cmpDragging = true; cmpHandle.setPointerCapture(e.pointerId); e.preventDefault();
  });
  window.addEventListener("pointermove", e => { if (cmpDragging) cmpFromEvent(e); });
  window.addEventListener("pointerup", () => (cmpDragging = false));
  cmpHandle.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { setCmp(cmpVal - 4); e.preventDefault(); }
    if (e.key === "ArrowRight") { setCmp(cmpVal + 4); e.preventDefault(); }
  });

  /* ── 12. NAV SOLIDIFY ─────────────────────────────────── */
  const nav = document.getElementById("nav");

  /* ── 13. HERO PARTICLE FIELD ──────────────────────────── */
  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, nodes = [], pulses = [], dpr = 1;
  const hero = document.querySelector(".hero");

  function buildField() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const density = Math.min(90, Math.floor((W * H) / 16000));
    nodes = Array.from({ length: density }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 0.6,
      lime: Math.random() < 0.18,
    }));
    // circuit pulses travelling between node pairs
    pulses = Array.from({ length: 5 }, () => spawnPulse());
  }
  function spawnPulse() {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    let best = null, bd = 1e9;
    for (const n of nodes) {
      const d = (n.x - a.x) ** 2 + (n.y - a.y) ** 2;
      if (d > 9000 && d < bd && d < 150000) { bd = d; best = n; }
    }
    return { a, b: best || a, t: 0, sp: 0.006 + Math.random() * 0.008 };
  }
  buildField();
  if (!reduced) window.addEventListener("resize", buildField);

  let heroVisible = true;
  new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting), { threshold: 0 }).observe(hero);
  // hero-local mouse position
  let fmx = -9999, fmy = -9999;
  window.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect();
    fmx = e.clientX - r.left; fmy = e.clientY - r.top;
  }, { passive: true });

  function drawField() {
    ctx.clearRect(0, 0, W, H);
    const LINK = 130;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!reduced) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        // mouse repulsion — the field flinches away, then heals
        const dx = n.x - fmx, dy = n.y - fmy, d2 = dx * dx + dy * dy;
        if (d2 < 16000 && d2 > 1) {
          const f = (1 - d2 / 16000) * 0.6;
          n.x += (dx / Math.sqrt(d2)) * f * 4;
          n.y += (dy / Math.sqrt(d2)) * f * 4;
        }
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, 7);
      ctx.fillStyle = n.lime ? "rgba(190,242,100,0.9)" : "rgba(16,185,129,0.55)";
      ctx.fill();
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dx = n.x - m.x, dy = n.y - m.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(16,185,129,${(1 - Math.sqrt(d2) / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // glow around cursor
      const dxm = n.x - fmx, dym = n.y - fmy, dm = Math.sqrt(dxm * dxm + dym * dym);
      if (dm < 170) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.4, 0, 7);
        ctx.fillStyle = `rgba(190,242,100,${(1 - dm / 170) * 0.5})`;
        ctx.fill();
      }
    }
    // travelling pulses along random node-to-node lines
    if (!reduced) {
      for (const p of pulses) {
        p.t += p.sp;
        if (p.t >= 1) Object.assign(p, spawnPulse(), { t: 0 });
        const x = lerp(p.a.x, p.b.x, p.t), y = lerp(p.a.y, p.b.y, p.t);
        ctx.beginPath();
        ctx.moveTo(p.a.x, p.a.y); ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(190,242,100,0.35)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, 7);
        ctx.fillStyle = "rgba(190,242,100,1)"; ctx.fill();
      }
    }
  }

  /* ── 14. MASTER rAF LOOP ──────────────────────────────── */
  function frame() {
    // smooth scroll wrapper
    if (document.body.classList.contains("is-smooth")) {
      currentY = lerp(currentY, targetY, 0.085);
      if (Math.abs(currentY - targetY) < 0.05) currentY = targetY;
      smooth.style.transform = `translate3d(0, ${-currentY.toFixed(2)}px, 0)`;
    } else {
      currentY = window.scrollY;
    }

    // cursor
    if (document.body.classList.contains("has-cursor")) {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      curDot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
      curRing.style.transform = `translate(${rx - 22}px, ${ry - 22}px)`;
      if (magnetEl && !reduced) {
        const r = magnetEl.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        magnetEl.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
      }
    }

    // parallax
    if (!reduced) {
      for (const p of parallaxEls) {
        const r = p.el.getBoundingClientRect();
        const mid = r.top + r.height / 2 - innerHeight / 2;
        p.el.style.transform = `translate3d(0, ${(mid * p.speed).toFixed(1)}px, 0)`;
      }
      for (const img of pImgEls) {
        const r = img.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const prog = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        img.style.transform = `scale(1.1) translate3d(0, ${(prog * -34).toFixed(1)}px, 0)`;
      }
    }

    // horizontal gallery — JS-pinned (sticky is dead inside the fixed wrapper)
    if (hgalPinned) {
      const r = hgal.getBoundingClientRect();
      const total = hgal.offsetHeight - innerHeight;
      const prog = clamp(-r.top / Math.max(total, 1), 0, 1);
      const maxX = hgalTrack.scrollWidth - innerWidth;
      hgalPin.style.transform = `translate3d(0, ${clamp(-r.top, 0, Math.max(total, 0)).toFixed(1)}px, 0)`;
      hgalTrack.style.transform = `translate3d(${(-prog * maxX).toFixed(1)}px, 0, 0)`;
      hgalBar.style.width = (prog * 100).toFixed(1) + "%";
      const active = caps.find((c, i) => {
        const start = (i + 1) / (caps.length + 1.4);
        return prog >= start - 0.1;
      });
      if (active) hgalCap.textContent = active.dataset.cap;
    }

    // nav state
    nav.classList.toggle("is-solid", currentY > 40);

    // particle field
    if (heroVisible && !reduced) drawField();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  drawField(); // paint once even with reduced motion
})();
