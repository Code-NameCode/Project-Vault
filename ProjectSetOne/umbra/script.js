/* Umbra — Red Torch Atlas: the cursor is a red torch that reveals hidden stars, plus moon phase, masthead hairline, one reveal. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- the star field: dim until lit by the torch --- */
  const sky = document.getElementById("sky");
  const stars = [];
  if (sky) {
    const COUNT = 140;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement("span");
      s.className = "star";
      const size = (Math.random() * 1.8 + 0.6).toFixed(2);
      s.style.cssText =
        "left:" + (Math.random() * 100).toFixed(2) + "%;" +
        "top:" + (Math.random() * 100).toFixed(2) + "%;" +
        "width:" + size + "px;height:" + size + "px;";
      frag.appendChild(s);
      stars.push({ el: s });
    }
    sky.appendChild(frag);
  }

  /* --- the red torch: pointer-following light pool + star reveal --- */
  const hero = document.getElementById("hero");
  const torch = document.getElementById("torch");
  if (hero && torch && stars.length && !reduced && window.matchMedia("(pointer: fine)").matches) {
    let tx = 0.5, ty = 0.45, px = -1, py = -1, raf = null;

    const paint = () => {
      raf = null;
      torch.style.setProperty("--tx", (tx * 100).toFixed(2) + "%");
      torch.style.setProperty("--ty", (ty * 100).toFixed(2) + "%");
      const rect = hero.getBoundingClientRect();
      const cx = tx * rect.width, cy = ty * rect.height;
      const R = 200;
      for (const st of stars) {
        const sr = st.el.getBoundingClientRect();
        const dx = sr.left + sr.width / 2 - cx;
        const dy = sr.top + sr.height / 2 - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        st.el.classList.toggle("lit", d < R);
        st.el.classList.toggle("warm", d < R * 0.55);
      }
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      tx = (e.clientX - rect.left) / rect.width;
      ty = (e.clientY - rect.top) / rect.height;
      if (px < 0) hero.classList.add("torch-on");
      px = tx; py = ty;
      schedule();
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      hero.classList.remove("torch-on");
      px = -1; py = -1;
      for (const st of stars) { st.el.classList.remove("lit", "warm"); }
    });

    window.addEventListener("scroll", () => { if (px >= 0) schedule(); }, { passive: true });
    schedule();
  }

  /* --- masthead hairline on scroll --- */
  const mast = document.getElementById("masthead");
  if (mast) {
    const onScroll = () => mast.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- moon phase --- */
  const phaseOrb = document.getElementById("phaseOrb");
  document.querySelectorAll(".chip[data-phase]").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip[data-phase]").forEach((c) =>
        c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      if (phaseOrb) phaseOrb.style.setProperty("--phase", chip.dataset.phase);
    });
  });

  /* --- one reveal on scroll --- */
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduced) {
    items.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
  }
})();
