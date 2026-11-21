/* The Honest Hour — live calculator. All math runs locally. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    salary: $("salary"), hours: $("hours"),
    commuteH: $("commuteH"), commuteC: $("commuteC"),
    nominal: $("nominal"), real: $("real"), note: $("realNote"),
    copy: $("copyBtn"),
  };

  const money = (n, dp) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

  const num = (el, fallback) => {
    const v = parseFloat(el.value);
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = null;
  function countUp(node, target, dp) {
    if (reduced) { node.textContent = money(target, dp); return; }
    if (raf) cancelAnimationFrame(raf);
    const from = parseFloat(node.dataset.v || "0");
    const t0 = performance.now();
    const dur = 500;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      node.textContent = money(v, dp);
      if (p < 1) raf = requestAnimationFrame(step);
      else node.dataset.v = String(target);
    };
    raf = requestAnimationFrame(step);
  }

  function compute() {
    const salary = num(els.salary, 0);
    const hours = Math.max(1, num(els.hours, 40));
    const cHours = num(els.commuteH, 0);
    const cCost = num(els.commuteC, 0);
    // Effective tax rate: a flat illustrative 22%, adjustable in future; kept explicit here.
    const TAX = 0.22;
    const weeks = 52;

    const nominal = salary / (weeks * 40);
    const takeHome = salary * (1 - TAX) - cCost * weeks;
    const lifeHours = (hours + cHours) * weeks;
    const real = lifeHours > 0 ? takeHome / lifeHours : 0;

    els.nominal.innerHTML = money(nominal, 2) + '<span style="font-size:.6em">/hr</span>';
    countUp(els.real, real, 2);
    els.note.textContent =
      "after a 22% effective tax rate, over every hour the job takes from your week";
  }

  ["salary", "hours", "commuteH", "commuteC"].forEach((id) => {
    els[id].addEventListener("input", compute);
  });

  els.copy.addEventListener("click", async () => {
    const text =
      "My salary says $" +
      parseFloat(els.salary.value || 0).toLocaleString("en-US") +
      " a year. My real hourly wage is " +
      els.real.textContent +
      ". Find yours: The Honest Hour";
    try {
      await navigator.clipboard.writeText(text);
      const old = els.copy.textContent;
      els.copy.textContent = "Copied";
      setTimeout(() => { els.copy.textContent = old; }, 1800);
    } catch {
      els.copy.textContent = "Copy failed — select manually";
    }
  });

  compute();
})();
