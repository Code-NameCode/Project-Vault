/* ============================================================
   FORMA — script.js
   Modular vanilla ES6+. GSAP + ScrollTrigger + Lenis via CDN.
   Everything degrades gracefully under prefers-reduced-motion.
   ============================================================ */

"use strict";

/* ---------- Data (single source of truth) ---------- */

/* Real photography (Unsplash) with picsum fallbacks via data-fallback.
   Credits shown in the footer per the Unsplash licence note. */
const U = (id, w, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const PROJECTS = [
  { name: "Casa Ombra", year: "2024", location: "Comporta, PT", typology: "Residence",
    desc: "A low courtyard house pressed into a pine ridge, rooms ordered by the evening sun.",
    img: U("1470071459604-3b5ec3a7fe05", 1200, 900), seed: "forma-casa-ombra",
    credit: "Unsplash — fog ridge landscape" },
  { name: "Kiln Gallery", year: "2023", location: "Copenhagen, DK", typology: "Cultural",
    desc: "A brick ceramics museum whose ovens still burn beneath the new exhibition floors.",
    img: U("1557682250-33bd709cbe85", 1200, 900), seed: "forma-kiln",
    credit: "Unsplash — kiln-light gradient study" },
  { name: "Tide Bathhouse", year: "2023", location: "Vejle, DK", typology: "Public",
    desc: "Concrete steps descending into the fjord; the tide is the second architect.",
    img: U("1519681393784-d120267933ba", 1200, 900), seed: "forma-tide",
    credit: "Unsplash — night mountains over water" },
  { name: "Haus Still", year: "2022", location: "Graubünden, CH", typology: "Residence",
    desc: "Timber and larch glass at 1,400 m — a house that closes like a shutter at dusk.",
    img: U("1419242902214-272b3f66ee7a", 1200, 900), seed: "forma-haus-still",
    credit: "Unsplash — alpine star field" },
  { name: "Archive 9", year: "2021", location: "Lisbon, PT", typology: "Adaptive reuse",
    desc: "A 19th-century warehouse re-cast as a film archive; nothing new touches the old wall.",
    img: U("1550859492-d5da9d8e45f3", 1200, 900), seed: "forma-archive9",
    credit: "Unsplash — layered abstraction" },
  { name: "Fold Pavilion", year: "2020", location: "Märkische Schweiz, DE", typology: "Pavilion",
    desc: "A single folded steel plate resting in a beech wood, removed each winter.",
    img: U("1472214103241-1cee8d91a1e4", 1200, 900), seed: "forma-fold",
    credit: "Unsplash — beech wood light" },
];

const SERVICES = [
  { title: "Architecture", text: "Full design authorship from feasibility to handover — new builds, additions and the occasional ruin brought back from the edge." },
  { title: "Interiors", text: "Spatial planning, bespoke joinery and material research. We design rooms the way the building asks, not the catalogue offers." },
  { title: "Masterplanning", text: "Site strategies for towns, campuses and coastlines — slow plans that give more to the ground than they take." },
  { title: "Landscape", text: "Planting, water and path design in collaboration with local ecologists, so a garden is old the day it is planted." },
];

const TEAM = [
  { name: "Marta Reis", role: "Founding Partner", bio: "Leads the Lisbon studio; trained in Porto, obsessed with section.",
    img: U("1494790108377-be9c29b29330", 600, 800), seed: "forma-marta" },
  { name: "Jonas Bæk", role: "Partner", bio: "Runs the Copenhagen office and the material research bench.",
    img: U("1506794778202-cad84cf45f1d", 600, 800), seed: "forma-jonas" },
  { name: "Aiko Tanabe", role: "Design Director", bio: "Draws the cultural projects; keeps a kiln at the studio.",
    img: U("1488426862026-3ee34a7d66df", 600, 800), seed: "forma-aiko" },
  { name: "Tomas Vidal", role: "Technical Partner", bio: "Makes every impossible detail buildable, quietly.",
    img: U("1507003211169-0a1dd7228f2d", 600, 800), seed: "forma-tomas" },
];

const PRESS = [
  "Dezeen Awards", "Architectural Review", "Wallpaper*", "Domus",
  "Pritzker Nominee", "Mies van der Rohe Award", "A+ Awards", "Frame",
];

/* ---------- Environment / helpers ---------- */

const REDUCED =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const HAS_GSAP = typeof window.gsap !== "undefined";

function init() {
  document.documentElement.classList.remove("no-js");
  if (REDUCED || !HAS_GSAP) document.documentElement.classList.add("reduced");

  renderProjects();
  renderServices();
  renderTeam();
  renderMarquee();

  initPreloader();
  initLenis();
  initNav();
  initOverlayMenu();
  initCursor();
  initHeroIntro();
  initScrollFX();
  initCounters();
  initAccordion();
  initLightbox();
  initForm();
}

/* ---------- Renderers ---------- */

function renderProjects() {
  const host = document.getElementById("projectsList");
  if (!host) return;
  host.innerHTML = PROJECTS.map(
    (p, i) => `
    <article class="project" data-reveal>
      <div class="project__media">
        <img src="${p.img}" data-fallback="https://picsum.photos/seed/${p.seed}/1200/900"
             alt="${p.name} — ${p.typology.toLowerCase()} in ${p.location}"
             loading="lazy" decoding="async" width="1200" height="900"
             onerror="this.onerror=null;this.src=this.dataset.fallback;" />
        <div class="project__veil">
          <button class="project__veil-btn" data-project="${i}">View project</button>
        </div>
      </div>
      <div class="project__meta">
        <h3>${p.name}</h3>
        <dl>
          <dt>Year</dt><dd>${p.year}</dd>
          <dt>Location</dt><dd>${p.location}</dd>
          <dt>Typology</dt><dd>${p.typology}</dd>
        </dl>
      </div>
    </article>`
  ).join("");
}

function renderServices() {
  const host = document.getElementById("servicesAccordion");
  if (!host) return;
  host.innerHTML = SERVICES.map(
    (s, i) => `
    <div class="accordion__item${i === 0 ? " is-open" : ""}">
      <h3>
        <button class="accordion__btn" aria-expanded="${i === 0}"
                aria-controls="svc-panel-${i}" id="svc-btn-${i}">
          <span class="accordion__icon" aria-hidden="true">
            <svg viewBox="0 0 14 14" width="14" height="14">
              <line x1="7" y1="1" x2="7" y2="13"/>
              <line x1="1" y1="7" x2="13" y2="7"/>
            </svg>
          </span>
          ${s.title}
        </button>
      </h3>
      <div class="accordion__panel" id="svc-panel-${i}" role="region"
           aria-labelledby="svc-btn-${i}">
        <p class="accordion__panel-inner">${s.text}</p>
      </div>
    </div>`
  ).join("");
}

function renderTeam() {
  const host = document.getElementById("teamGrid");
  if (!host) return;
  host.innerHTML = TEAM.map(
    (m) => `
    <article class="member" data-reveal>
      <div class="member__photo">
        <img src="${m.img}" data-fallback="https://picsum.photos/seed/${m.seed}/600/800"
             alt="Portrait of ${m.name}, ${m.role} at FORMA"
             loading="lazy" decoding="async" width="600" height="800"
             onerror="this.onerror=null;this.src=this.dataset.fallback;" />
      </div>
      <h3>${m.name}</h3>
      <p class="member__role">${m.role}</p>
      <p class="member__bio">${m.bio}</p>
    </article>`
  ).join("");
}

function renderMarquee() {
  const track = document.getElementById("marqueeTrack");
  if (!track) return;
  const items = PRESS.map((p) => `<span class="marquee__item">${p}</span>`).join("");
  track.innerHTML = items + items; // duplicated for a seamless loop
}

/* ---------- Preloader ---------- */

function initPreloader() {
  const pre = document.getElementById("preloader");
  const count = document.getElementById("preloaderCount");
  const frame = document.querySelector(".mark-frame");
  const diag = document.querySelector(".mark-diag");

  if (REDUCED || !HAS_GSAP) {
    pre.remove();
    return;
  }

  const state = { n: 0 };
  const tl = gsap.timeline();
  tl.to(frame, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" })
    .to(diag, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, "<0.2")
    .to(state, {
      n: 100, duration: 1.4, ease: "power1.inOut",
      onUpdate: () => (count.textContent = String(Math.round(state.n)).padStart(2, "0")),
    }, "<")
    .to(pre, { yPercent: -100, duration: 0.9, ease: "power4.inOut" })
    .set(pre, { display: "none" })
    .add(() => heroIntro(), "-=0.55");
}

/* ---------- Smooth scroll (Lenis + ScrollTrigger) ---------- */

function initLenis() {
  if (REDUCED || typeof window.Lenis === "undefined" || !HAS_GSAP) return;

  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  gsap.registerPlugin(ScrollTrigger);

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links route through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeOverlay();
      lenis.scrollTo(target, { offset: -60 });
    });
  });
}

/* ---------- Sticky nav ---------- */

function initNav() {
  const nav = document.getElementById("nav");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 240);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Overlay menu ---------- */

let overlayOpen = false;

function initOverlayMenu() {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("overlayMenu");

  toggle.addEventListener("click", () => {
    overlayOpen = !overlayOpen;
    toggle.setAttribute("aria-expanded", String(overlayOpen));
    toggle.setAttribute("aria-label", overlayOpen ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", overlayOpen);
    menu.setAttribute("aria-hidden", String(!overlayOpen));
    document.body.style.overflow = overlayOpen ? "hidden" : "";
  });

  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", closeOverlay)
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
  });
}

function closeOverlay() {
  if (!overlayOpen) return;
  overlayOpen = false;
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("overlayMenu");
  toggle.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  menu.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* ---------- Custom cursor ---------- */

function initCursor() {
  if (REDUCED || window.matchMedia("(pointer: coarse)").matches) return;
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
  }, { passive: true });

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    const half = ring.offsetWidth / 2;
    ring.style.transform = `translate(${rx - half}px, ${ry - half}px)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll("a, button, .project__media").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
    el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
  });
}

/* ---------- Hero intro + parallax ---------- */

function heroIntro() {
  if (REDUCED || !HAS_GSAP) return;
  gsap.to(".mask-line > span", {
    y: 0, duration: 1.1, ease: "power4.out", stagger: 0.12,
  });
}

function initHeroIntro() {
  if (REDUCED || !HAS_GSAP) return;
  gsap.set(".mask-line > span", { yPercent: 110 });
}

function initScrollFX() {
  if (REDUCED || !HAS_GSAP) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero parallax
  gsap.to(".hero__media", {
    yPercent: 14, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  // Generic reveals
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  ScrollTrigger.refresh();
}

/* ---------- Stat counters ---------- */

function initCounters() {
  const nums = document.querySelectorAll(".stat__num");
  if (!nums.length) return;

  if (REDUCED || !HAS_GSAP) {
    nums.forEach((n) => (n.textContent = n.dataset.count));
    return;
  }

  nums.forEach((n) => {
    const target = parseInt(n.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: "power2.out",
      scrollTrigger: { trigger: n, start: "top 90%" },
      onUpdate: () => (n.textContent = Math.round(obj.v)),
    });
  });
}

/* ---------- Services accordion ---------- */

function initAccordion() {
  document.querySelectorAll(".accordion__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".accordion__item");
      const panel = item.querySelector(".accordion__panel");
      const isOpen = item.classList.contains("is-open");

      // close others (one-at-a-time accordion)
      document.querySelectorAll(".accordion__item.is-open").forEach((other) => {
        if (other === item) return;
        other.classList.remove("is-open");
        other.querySelector(".accordion__btn").setAttribute("aria-expanded", "false");
        const p = other.querySelector(".accordion__panel");
        if (REDUCED) { p.style.height = "0px"; return; }
        gsap.to(p, { height: 0, duration: 0.45, ease: "power2.inOut" });
      });

      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));

      if (REDUCED) {
        panel.style.height = isOpen ? "0px" : "auto";
        return;
      }
      gsap.to(panel, {
        height: isOpen ? 0 : "auto",
        duration: 0.55, ease: "power2.inOut",
      });
    });
  });
  // open first panel's height after paint
  const first = document.querySelector(".accordion__item.is-open .accordion__panel");
  if (first) requestAnimationFrame(() => (first.style.height = "auto"));
}

/* ---------- Lightbox ---------- */

function initLightbox() {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const title = document.getElementById("lightboxTitle");
  const meta = document.getElementById("lightboxMeta");
  const desc = document.getElementById("lightboxDesc");
  const closeBtn = document.getElementById("lightboxClose");
  let lastFocus = null;

  function open(i) {
    const p = PROJECTS[i];
    img.src = p.img.replace(/w=1200&h=900/, "w=1600&h=1000");
    img.alt = `${p.name} — ${p.typology.toLowerCase()} in ${p.location}`;
    title.textContent = p.name;
    meta.textContent = `${p.year} · ${p.location} · ${p.typology}`;
    desc.textContent = p.desc;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-project]");
    if (btn) open(parseInt(btn.dataset.project, 10));
  });
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lb.hidden) close();
  });

  // minimal focus trap
  lb.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = lb.querySelectorAll("button");
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });
}

/* ---------- Contact form (front-end validation only) ---------- */

function initForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const fields = [
    { input: form.querySelector("#fName"), error: document.getElementById("errName"),
      valid: (v) => v.trim().length > 1 },
    { input: form.querySelector("#fEmail"), error: document.getElementById("errEmail"),
      valid: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) },
    { input: form.querySelector("#fMsg"), error: document.getElementById("errMsg"),
      valid: (v) => v.trim().length > 9 },
  ];

  function check(f) {
    const ok = f.valid(f.input.value);
    f.input.closest(".field").classList.toggle("is-invalid", !ok);
    f.error.hidden = ok;
    f.input.setAttribute("aria-invalid", String(!ok));
    return ok;
  }

  fields.forEach((f) => {
    f.input.addEventListener("blur", () => check(f));
    f.input.addEventListener("input", () => {
      if (f.input.closest(".field").classList.contains("is-invalid")) check(f);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = fields.map(check).every(Boolean);
    const success = document.getElementById("formSuccess");
    if (!ok) {
      fields.find((f) => !f.valid(f.input.value)).input.focus();
      success.hidden = true;
      return;
    }
    form.reset();
    success.hidden = false;
  });
}

/* ---------- Boot ---------- */

document.addEventListener("DOMContentLoaded", init);
