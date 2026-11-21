/* Wouldvest — calculator, presets, share loop. Progressive enhancement:
   the HTML ships with correct default figures, so the page works with scripting off. */
(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const amountEl = $("#amount");
  const yearsEl = $("#years");
  const yearsOut = $("#yearsOut");
  const rateEl = $("#rate");
  const bigNumber = $("#bigNumber");
  const barSpent = $("#barSpent");
  const barGrowth = $("#barGrowth");
  const lineSpent = $("#lineSpent");
  const lineGrowth = $("#lineGrowth");
  const shareBtn = $("#shareBtn");
  const footerShare = $("#footerShare");
  const chips = [...document.querySelectorAll(".chip")];
  const freqEls = [...document.querySelectorAll('input[name="freq"]')];

  const MONTHS = { day: 30.4375, week: 4.348, month: 1 };
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Screen-reader live region, updated once per calculation */
  const live = document.createElement("span");
  live.setAttribute("aria-live", "polite");
  live.style.cssText =
    "position:absolute;width:1px;height:1px;overflow:clip;clip-path:inset(50%);white-space:nowrap;";
  bigNumber.removeAttribute("aria-live");
  bigNumber.after(live);

  const num = (el, fallback, min, max) => {
    const v = parseFloat(el.value);
    if (!Number.isFinite(v)) return fallback;
    return Math.min(max, Math.max(min, v));
  };

  const state = { amount: 6, freq: "day", years: 30, rate: 10 };

  const readState = () => {
    state.amount = num(amountEl, state.amount, 0.5, 100000);
    state.freq = (freqEls.find((r) => r.checked) || { value: "day" }).value;
    state.years = num(yearsEl, state.years, 1, 50);
    state.rate = num(rateEl, state.rate, 0.5, 15);
  };

  const compute = () => {
    const monthly = state.amount * MONTHS[state.freq];
    const i = state.rate / 100 / 12;
    const n = state.years * 12;
    const fv = monthly * ((Math.pow(1 + i, n) - 1) / i);
    const spent = monthly * n;
    return { fv, spent, growth: fv - spent };
  };

  /* Count-up on the big figure; transform/opacity-only page motion otherwise */
  let raf = null;
  const renderNumber = (value) => {
    if (reducedMotion) {
      bigNumber.textContent = money.format(value);
      return;
    }
    if (raf) cancelAnimationFrame(raf);
    const from = parseFloat(bigNumber.textContent.replace(/[^0-9.]/g, "")) || 0;
    const start = performance.now();
    const dur = 650;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      bigNumber.textContent = money.format(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    raf = requestAnimationFrame(tick);
  };

  const syncChips = () => {
    chips.forEach((chip) => {
      const match =
        parseFloat(chip.dataset.amount) === state.amount &&
        chip.dataset.freq === state.freq;
      chip.setAttribute("aria-pressed", String(match));
    });
  };

  const render = () => {
    const { fv, spent, growth } = compute();
    renderNumber(fv);
    const spentPct = fv > 0 ? Math.round((spent / fv) * 100) : 0;
    barSpent.style.flexGrow = String(Math.max(1, spentPct));
    barGrowth.style.flexGrow = String(Math.max(1, 100 - spentPct));
    lineSpent.innerHTML = "";
    lineSpent.append("You spent ");
    const s = document.createElement("strong");
    s.textContent = money.format(spent);
    lineSpent.append(s);
    lineGrowth.innerHTML = "";
    lineGrowth.append("Compound growth added ");
    const g = document.createElement("strong");
    g.textContent = money.format(growth);
    lineGrowth.append(g);
    live.textContent = `Invested instead: ${money.format(fv)}. You spent ${money.format(spent)}, compound growth added ${money.format(growth)}.`;
    syncChips();
  };

  const recalc = () => {
    readState();
    render();
  };

  /* ---------- Inputs ---------- */
  [amountEl, rateEl].forEach((el) => el.addEventListener("input", recalc));
  freqEls.forEach((el) => el.addEventListener("change", recalc));
  yearsEl.addEventListener("input", () => {
    yearsOut.textContent = `${yearsEl.value} yrs`;
    recalc();
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      amountEl.value = chip.dataset.amount;
      const radio = freqEls.find((r) => r.value === chip.dataset.freq);
      if (radio) radio.checked = true;
      recalc();
      amountEl.focus({ preventScroll: true });
    });
  });

  /* ---------- Share loop ---------- */
  const buildUrl = () => {
    const base = location.href.split("?")[0];
    const p = new URLSearchParams({
      a: state.amount,
      f: state.freq,
      y: state.years,
      r: state.rate,
    });
    return `${base}?${p.toString()}`;
  };

  const shareText = () => {
    const { fv } = compute();
    return `I typed a $${state.amount}-a-${state.freq} habit into Wouldvest: invested instead, it becomes about ${money.format(fv)} in ${state.years} years. Check yours:`;
  };

  let copiedTimer = null;
  const markCopied = () => {
    shareBtn.classList.add("is-copied");
    shareBtn.textContent = "Link copied";
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      shareBtn.classList.remove("is-copied");
      shareBtn.textContent = "Copy a share link";
    }, 2200);
  };

  const doShare = async () => {
    const url = buildUrl();
    const text = shareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "Wouldvest", text, url });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      markCopied();
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = `${text} ${url}`;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      markCopied();
    }
  };

  shareBtn.addEventListener("click", doShare);
  if (footerShare) {
    footerShare.addEventListener("click", (e) => {
      e.preventDefault();
      doShare();
    });
  }

  /* ---------- URL params (shared links land pre-filled) ---------- */
  const params = new URLSearchParams(location.search);
  if (params.has("a")) amountEl.value = num({ value: params.get("a") }, 6, 0.5, 100000);
  if (params.has("f") && MONTHS[params.get("f")]) {
    const radio = freqEls.find((r) => r.value === params.get("f"));
    if (radio) radio.checked = true;
  }
  if (params.has("y")) yearsEl.value = num({ value: params.get("y") }, 30, 1, 50);
  if (params.has("r")) rateEl.value = num({ value: params.get("r") }, 10, 0.5, 15);
  yearsOut.textContent = `${yearsEl.value} yrs`;

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  recalc();
})();
