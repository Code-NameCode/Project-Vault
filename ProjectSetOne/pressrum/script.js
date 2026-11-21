/* Pressrum — Lenis smooth scroll, one GSAP SplitText opening sequence,
   contact-sheet picking, brief form printing a job ticket. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) document.documentElement.classList.add("no-motion");

/* ---------- mobile hamburger menu (defined early so the anchor handler can use it) ---------- */
const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("mobileMenu");
const masthead = document.querySelector(".masthead");

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  if (lenis) open ? lenis.stop() : lenis.start();
}

/* measure the real masthead height so the panel always sits flush beneath it */
function syncMenuTop() {
  document.documentElement.style.setProperty(
    "--menu-top",
    masthead.offsetHeight + "px"
  );
}
syncMenuTop();
window.addEventListener("resize", syncMenuTop);

menuToggle.addEventListener("click", () =>
  setMenu(!document.body.classList.contains("menu-open"))
);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

/* ---------- Lenis smooth scroll ---------- */
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({ duration: 1.05, wheelMultiplier: 0.95 });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  // anchor links through Lenis. if the menu is open, close it FIRST so
  // Lenis is running again before the scroll is requested.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const fromMenu = document.body.classList.contains("menu-open");
      if (fromMenu) setMenu(false);
      if (fromMenu) {
        // let the restart take effect, then scroll
        requestAnimationFrame(() => lenis.scrollTo(target, { offset: -70 }));
      } else {
        lenis.scrollTo(target, { offset: -70 });
      }
    });
  });
}

/* ---------- one opening sequence: SplitText line masks + clip-path unveil ---------- */
if (!reduceMotion && window.gsap && window.SplitText) {
  gsap.registerPlugin(SplitText);

  const split = new SplitText(".hero-headline", {
    type: "lines",
    linesClass: "split-line",
  });
  split.lines.forEach((line) => {
    const parent = document.createElement("span");
    parent.className = "split-line-parent";
    line.parentNode.insertBefore(parent, line);
    parent.appendChild(line);
  });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(split.lines, { yPercent: 110, duration: 1, stagger: 0.12 }, 0.15)
    .from(".hero-sub, .hero-meta", { opacity: 0, y: 18, duration: 0.8, stagger: 0.1 }, 0.7)
    .fromTo(
      ".hero-photo",
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "power4.inOut" },
      0.35
    )
    .from(".hero-photo .caption", { opacity: 0, duration: 0.6 }, 1.3);
}

/* ---------- restrained scroll reveals ---------- */
if (!reduceMotion && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        entry.target.style.opacity = "1";
        entry.target.style.transform = "none";
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
  );
  document
    .querySelectorAll(".section-title, .row, .step, .frame, .portrait, .ticket")
    .forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
}



/* ---------- contact sheet: grease-pencil pick, dim the rest ---------- */
const sheet = document.getElementById("sheet");
document.querySelectorAll(".frame").forEach((frame) => {
  frame.addEventListener("mouseenter", () => {
    sheet.classList.add("has-pick");
    frame.classList.add("picked");
  });
  frame.addEventListener("mouseleave", () => {
    sheet.classList.remove("has-pick");
    frame.classList.remove("picked");
  });
  frame.addEventListener("focus", () => {
    sheet.classList.add("has-pick");
    frame.classList.add("picked");
  });
  frame.addEventListener("blur", () => {
    sheet.classList.remove("has-pick");
    frame.classList.remove("picked");
  });
});

/* ---------- segmented square buttons ---------- */
document.querySelectorAll(".segments").forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg");
    if (!btn) return;
    group.querySelectorAll(".seg").forEach((s) => s.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
  });
});

/* ---------- brief form: print a clean job ticket ---------- */
const form = document.getElementById("briefForm");
const ticket = document.getElementById("ticket");
const errorEl = document.getElementById("formError");

const pickedSeg = (labelId) => {
  const group = document.querySelector(`[aria-labelledby="${labelId}"]`);
  const on = group && group.querySelector('.seg[aria-pressed="true"]');
  return on ? on.dataset.seg : "";
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const org = form.org.value.trim();
  const words = form.words.value.trim();
  const scope = pickedSeg("scopeLabel");
  const timing = pickedSeg("timeLabel");

  const missing = [];
  if (!name) missing.push(form.name);
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) missing.push(form.email);
  if (!org) missing.push(form.org);
  if (!words) missing.push(form.words);
  if (!scope || !timing) missing.push(null);

  missing.forEach((el) => el && (el.style.borderBottomColor = "var(--orange)"));
  if (missing.length) {
    errorEl.hidden = false;
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  document.getElementById("ticketNo").textContent =
    "№ " + String(Math.floor(1000 + Math.random() * 9000));
  document.getElementById("ticketTitle").textContent = org;
  document.getElementById("ticketDate").textContent = dateStr;

  document.getElementById("ticketBody").innerHTML = [
    ["From", name],
    ["Reply to", email],
    ["Scope", scope],
    ["Timing", timing],
    ["The problem", words],
    ["Answer by", new Date(now.getTime() + 2 * 864e5).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short",
    })],
  ]
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join("");

  ticket.hidden = false;

  if (!reduceMotion && lenis) {
    lenis.scrollTo(ticket, { offset: -90 });
  } else {
    ticket.scrollIntoView({ behavior: "auto", block: "center" });
  }
  form.reset();
  document
    .querySelectorAll('.seg[aria-pressed="true"]')
    .forEach((s) => s.setAttribute("aria-pressed", "false"));
});

/* clear orange error underline on input */
form.querySelectorAll("input, textarea").forEach((el) => {
  el.addEventListener("input", () => (el.style.borderBottomColor = ""));
});
