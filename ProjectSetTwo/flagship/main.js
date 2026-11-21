/* ============================================================
   MERIDIAN GLOBAL — interactions
   ============================================================ */
(() => {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky nav state ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  /* ---------- scroll reveals ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- animated counters ---------- */
  const countersBox = document.querySelector('[data-counters]');
  if (countersBox) {
    const run = el => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1800;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (prefersReduced || !('IntersectionObserver' in window)) {
      countersBox.querySelectorAll('.stat-num').forEach(el => {
        const d = parseInt(el.dataset.decimals || '0', 10);
        el.textContent = parseFloat(el.dataset.count).toFixed(d) + (el.dataset.suffix || '');
      });
    } else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.5 });
      countersBox.querySelectorAll('.stat-num').forEach(el => io.observe(el));
    }
  }

  /* ---------- capabilities tabs ---------- */
  const tabs = [...document.querySelectorAll('.cap-tab')];
  const panels = [...document.querySelectorAll('.cap-panel')];
  const selectTab = i => {
    tabs.forEach((t, j) => {
      const active = j === i;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      panels[j].classList.toggle('is-active', active);
      panels[j].hidden = !active;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { const n = (i + 1) % tabs.length; tabs[n].focus(); selectTab(n); }
      if (e.key === 'ArrowLeft') { const n = (i - 1 + tabs.length) % tabs.length; tabs[n].focus(); selectTab(n); }
    });
  });

  /* auto-rotate capabilities until user interacts */
  let capIndex = 0, capTimer = null;
  const startCapAuto = () => {
    if (prefersReduced) return;
    capTimer = setInterval(() => { capIndex = (capIndex + 1) % tabs.length; selectTab(capIndex); }, 6000);
  };
  const stopCapAuto = () => { clearInterval(capTimer); capTimer = null; };
  startCapAuto();
  tabs.forEach(t => t.addEventListener('click', stopCapAuto));
  tabs.forEach(t => t.addEventListener('focus', stopCapAuto));

  /* ---------- testimonial carousel ---------- */
  const track = document.getElementById('quoteTrack');
  if (track) {
    const quotes = [...track.querySelectorAll('.quote')];
    const dotsBox = document.getElementById('quoteDots');
    let qi = 0, qTimer = null;

    quotes.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'quote-dot';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', `Testimonial ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); restart(); });
      dotsBox.appendChild(d);
    });
    const dots = [...dotsBox.children];

    const goTo = i => {
      qi = (i + quotes.length) % quotes.length;
      quotes.forEach((q, j) => q.classList.toggle('is-active', j === qi));
      dots.forEach((d, j) => d.classList.toggle('is-active', j === qi));
    };
    const restart = () => { clearInterval(qTimer); if (!prefersReduced) qTimer = setInterval(() => goTo(qi + 1), 8000); };

    document.getElementById('quotePrev').addEventListener('click', () => { goTo(qi - 1); restart(); });
    document.getElementById('quoteNext').addEventListener('click', () => { goTo(qi + 1); restart(); });

    // swipe
    let x0 = null;
    track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { goTo(qi + (dx < 0 ? 1 : -1)); restart(); }
      x0 = null;
    }, { passive: true });

    goTo(0);
    restart();
  }

  /* ---------- contact form ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const note = document.getElementById('formNote');
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email.includes('@') || !message) {
        note.textContent = 'Please add your name, a valid work email, and a short note on your situation.';
        return;
      }
      note.textContent = `Thank you, ${name.split(' ')[0]}. A Meridian principal engineer will reply within one business day.`;
      form.reset();
    });
  }
})();
