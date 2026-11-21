/* ============================================================
   THE PROJECT VAULT - archive edition
   Renders plates, ledger, explorer, gallery, records, GitHub.
   ============================================================ */

const state = {
  projects: [],
  config: {},
  filters: { cat: "All", tech: "All" },
  galleryFilter: "All",
  search: "",
  sort: "date-desc",
};

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const previewUrl = (p) => encodeURI(`${p.folder}/${p.entry || "index.html"}`);
const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/* paths must survive deployment from a repo sub-directory */
function withBase(url) {
  if (state.config.previewBaseUrl) return url;
  const parts = location.pathname.split("/");
  parts.pop();
  const base = parts.join("/");
  return base ? base + "/" + url : url;
}

/* ---------- media: screenshot cover, photo plate, or type specimen ---------- */
function mediaHTML(p) {
  const src = p.cover || p.plateSrc;
  if (src) {
    return `<img src="${withBase(encodeURI(src))}" alt="${esc(p.name)} - website screenshot" loading="lazy" />`;
  }
  const pl = p.plate || {};
  return `<div class="specimen" style="background:${esc(pl.bg || "#0a0a0a")};color:${esc(pl.fg || "#ffffff")};--sp-dot:${esc(pl.dot || "#10b981")}">
    <span class="word ${esc(pl.wordStyle || "serif")}">${esc(pl.word || p.name)}${pl.sub ? `<em>${esc(pl.sub)}</em>` : ""}</span>
  </div>`;
}

/* ---------- plate (project card) ---------- */
function plateHTML(p, index, size) {
  const cls = size ? ` plate--${size}` : "";
  return `
  <article class="plate${cls} reveal">
    <button class="plate-media" data-id="${esc(p.id)}" aria-label="Open record for ${esc(p.name)}">
      ${mediaHTML(p)}
    </button>
    <div class="plate-caption">
      <div class="row1">
        <h3><button data-id="${esc(p.id)}" class="title-btn">${esc(p.name)}</button></h3>
        <span class="meta">${esc(p.category)}</span>
      </div>
      <p>${esc(p.tagline)}</p>
    </div>
  </article>`;
}

/* ---------- home ---------- */
function renderHome() {
  const ps = state.projects;
  const cats = [...new Set(ps.map((p) => p.category))];

  // the parent site appears only in Featured work - exclude it everywhere else
  const shown = ps.filter((p) => !p.private);
  const shownCats = [...new Set(shown.map((p) => p.category))];

  $("#heroStats").innerHTML = [
    ["Projects", shown.length, "plus parent site"],
    ["Categories", shownCats.length, ""],
    ["Live sites", shown.filter((p) => p.status === "Live").length, "of " + shown.length],
    ["Latest", fmtDate([...shown].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))[0].dateAdded), ""],
  ]
    .map(([l, v, sup]) => `<div><dt>${l}</dt><dd>${esc(String(v))}${sup ? `<sup>${esc(sup)}</sup>` : ""}</dd></div>`)
    .join("");

  // feature plate: the parent website, Goodstuff Designs
  const feat = ps.find((p) => p.id === "goodstuff-main") || ps.find((p) => p.private) || ps[0];
  $("#featurePlate").innerHTML = `
    <div class="rule-head">
      <h2>Featured work</h2>
      <p class="rule-note">The parent website</p>
    </div>
    <div class="feature reveal">
      <div class="feature-media" style="aspect-ratio:16/10;">${mediaHTML(feat)}</div>
      <div class="feature-info">
        <p class="plate-no">${esc(feat.name)} · ${esc(feat.type)} · ${fmtDate(feat.dateAdded)}</p>
        <h2>${esc(feat.name)}</h2>
        <p class="tag">${esc(feat.tagline)}</p>
        <p class="desc">${esc(feat.description)}</p>
        <div class="feature-meta">
          <div><b>Category</b>${esc(feat.category)}</div>
          <div><b>Stack</b>${esc((feat.technologies || []).slice(0, 3).join(" · "))}</div>
          <div><b>Location</b>Heidelberg, Gauteng · South Africa</div>
          <div><b>Status</b>${esc(feat.status)}</div>
        </div>
        <div class="feature-actions">
          <a class="btn btn-solid" href="${esc(feat.liveUrl || withBase(previewUrl(feat)))}" target="_blank" rel="noopener">Visit goodstuffdesigns.co.za ↗</a>
        </div>
      </div>
    </div>`;

  // recent accessions ledger
  const recent = [...shown].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 6);
  $("#recentLedger").innerHTML = recent.map((p) => {
    const n = ps.indexOf(p) + 1;
    return `<li><a href="#/explorer" data-goto="${esc(p.id)}">
      <span class="no">Nº ${String(n).padStart(2, "0")}</span>
      <span class="name">${esc(p.name)}</span>
      <span class="tag">${esc(p.tagline)}</span>
      <span class="cat">${esc(p.category)}</span>
      <span class="yr">${esc(fmtDate(p.dateAdded))}</span>
    </a></li>`;
  }).join("");

  // collection wall - all vault projects (parent site lives in Featured work only)
  // AURELE leads the collection
  const ordered = [...shown].sort((a, b) => (a.id === "aurele" ? -1 : b.id === "aurele" ? 1 : 0));
  const wall = ordered.map((p, i) => {
    const size = i === 0 || i % 3 === 1 ? "wide" : "";
    return plateHTML(p, i, size);
  }).join("");
  $("#featuredGrid").innerHTML = wall;

  $("#catGrid").innerHTML = shownCats.map((c) => {
    const n = shown.filter((p) => p.category === c).length;
    return `<a href="#/explorer" data-goto-cat="${esc(c)}">${esc(c)}<span class="n">${n}</span></a>`;
  }).join("");
}

/* ---------- explorer ---------- */
function buildFilters() {
  const cats = ["All", ...new Set(state.projects.filter((p) => !p.private).map((p) => p.category))];
  const techs = ["All", ...new Set(state.projects.filter((p) => !p.private).flatMap((p) => p.technologies || []))];
  const mk = (list, active) =>
    list.map((v) => `<button class="fbtn${v === active ? " active" : ""}" data-val="${esc(v)}">${esc(v)}</button>`).join("");
  $("#catFilters").innerHTML = `<span class="filter-label">Category</span>` + mk(cats, state.filters.cat);
  $("#techFilters").innerHTML = `<span class="filter-label">Technology</span>` + mk(techs, state.filters.tech);
}

function filtered() {
  const q = state.search.toLowerCase().trim();
  const list = state.projects.filter((p) => !p.private).filter((p) => {
    const matchQ = !q || [p.name, p.tagline, p.description, p.category, p.type, ...(p.technologies || [])]
      .join(" ").toLowerCase().includes(q);
    const matchC = state.filters.cat === "All" || p.category === state.filters.cat;
    const matchT = state.filters.tech === "All" || (p.technologies || []).includes(state.filters.tech);
    return matchQ && matchC && matchT;
  });
  const s = state.sort;
  list.sort((a, b) =>
    s === "date-desc" ? b.dateAdded.localeCompare(a.dateAdded)
    : s === "date-asc" ? a.dateAdded.localeCompare(b.dateAdded)
    : s === "name-asc" ? a.name.localeCompare(b.name)
    : s === "name-desc" ? b.name.localeCompare(a.name)
    : a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return list;
}

function renderExplorer() {
  buildFilters();
  const list = filtered();
  $("#countLine").textContent = `${list.length} of ${state.projects.filter((p) => !p.private).length} records shown`;
  $("#explorerGrid").innerHTML = list.map((p) => plateHTML(p, 0, "")).join("");
  $("#noResults").style.display = list.length ? "none" : "block";
}

function initExplorer() {
  $("#searchInput").addEventListener("input", (e) => { state.search = e.target.value; renderExplorer(); });
  $("#sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; renderExplorer(); });
  $("#catFilters").addEventListener("click", (e) => {
    const b = e.target.closest(".fbtn"); if (!b) return;
    state.filters.cat = b.dataset.val; renderExplorer();
  });
  $("#techFilters").addEventListener("click", (e) => {
    const b = e.target.closest(".fbtn"); if (!b) return;
    state.filters.tech = b.dataset.val; renderExplorer();
  });
}

/* ---------- gallery ---------- */
const GALLERY_TYPES = {
  All: () => true,
  "Business & Luxury": (p) => p.category === "Business Websites",
  "Agency & Studio": (p) => ["Portfolios", "Landing Pages"].includes(p.category),
  "SaaS & Dashboards": (p) => ["SaaS & Web Applications", "Dashboards"].includes(p.category),
  "Tools & Calculators": (p) => p.category === "Developer Tools",
  Experiments: (p) => p.type === "Experiment" || p.category === "Experiments & Side Projects",
};

function renderGallery() {
  const list = state.projects.filter((p) => !p.private).filter(GALLERY_TYPES[state.galleryFilter] || (() => true));
  $("#galleryFilters").innerHTML =
    `<span class="filter-label">Type</span>` +
    Object.keys(GALLERY_TYPES).map((t) =>
      `<button class="fbtn${t === state.galleryFilter ? " active" : ""}" data-val="${esc(t)}">${esc(t)}</button>`).join("");
  $("#galleryGrid").innerHTML = list
    .map((p, i) => plateHTML(p, i, p.featured ? (i % 2 ? "tall" : "wide") : ""))
    .join("") || '<p class="empty">Nothing in this group yet.</p>';
}

/* ---------- record modal ---------- */
function openModal(id) {
  const p = state.projects.find((x) => x.id === id);
  if (!p) return;
  const n = state.projects.indexOf(p) + 1;
  const rows = [
    ["Record", `Nº ${String(n).padStart(2, "0")} / ${state.projects.length}`],
    ["Category", esc(p.category)],
    ["Type", esc(p.type)],
    ["Status", esc(p.status)],
    ["Accessioned", esc(fmtDate(p.dateAdded))],
  ].map(([l, v]) => `<div><b>${l}</b><span>${v}</span></div>`).join("");
  const stack = (p.technologies || []).map((t) => `<span>${esc(t)}</span>`).join("");
  // real files get working links; folder summaries ("assets/ (9 images)") stay plain text
  const files = (p.files || [])
    .map((f) => {
      if (/ \(.*\)$/.test(f)) return `<span>${esc(f)}</span>`;
      const href = withBase(encodeURI(`${p.folder}/${f}`));
      return `<span><a href="${href}" target="_blank" rel="noopener">${esc(f)} ↗</a></span>`;
    })
    .join("");

  $("#modalCard").innerHTML = `
    <button class="modal-close" id="modalClose">Close ✕</button>
    <div class="modal-media">${mediaHTML(p)}</div>
    <div class="modal-body">
      <p class="record-kicker">Project record · ${esc(p.category)}</p>
      <h2 id="modalTitle">${esc(p.name)}</h2>
      <p class="modal-tagline">${esc(p.tagline)}</p>
      <p class="modal-desc">${esc(p.description)}</p>
      <div class="record-table">
        ${rows}
        <div><b>Stack</b><span class="chips">${stack}</span></div>
        ${p.private ? "" : `<div><b>Contents</b><span class="chips">${files}</span></div>
        <div><b>Location</b><span class="chips"><span>${esc(p.folder)}/</span></span></div>`}
      </div>
      <div class="modal-actions">
        ${p.private
          ? `<a class="btn btn-solid" href="${esc(p.liveUrl || withBase(previewUrl(p)))}" target="_blank" rel="noopener">Visit the website ↗</a>`
          : `<a class="btn btn-solid" href="${withBase(previewUrl(p))}" target="_blank" rel="noopener">View live website ↗</a>
             ${p.github ? `<a class="btn btn-line" href="${esc(p.github)}" target="_blank" rel="noopener">GitHub repository ↗</a>` : ""}
             <button class="btn btn-line" id="previewToggle">Load preview</button>`}
      </div>
      <div id="previewHost"></div>
    </div>`;
  $("#modal").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#modalClose").addEventListener("click", closeModal);

  const pt = $("#previewToggle");
  if (!pt) return;
  pt.addEventListener("click", (e) => {
    $("#previewHost").innerHTML = `
      <div class="pv-bar">
        <span class="pv-label">Preview</span>
        <div class="pv-toggle" role="group" aria-label="Preview device size">
          <button class="pv-btn active" data-dev="desktop" aria-pressed="true">Desktop</button>
          <button class="pv-btn" data-dev="mobile" aria-pressed="false">Mobile</button>
        </div>
      </div>
      <div class="modal-preview pv-desktop">
        <iframe src="${withBase(previewUrl(p))}" loading="lazy" title="Live preview of ${esc(p.name)}"></iframe>
      </div>
      <p class="preview-note">Served live from the repository. If blank, use “View live website”.</p>`;
    e.target.remove();

    const host = $("#previewHost");
    host.querySelectorAll(".pv-btn").forEach((b) =>
      b.addEventListener("click", () => {
        host.querySelectorAll(".pv-btn").forEach((x) => {
          const on = x === b;
          x.classList.toggle("active", on);
          x.setAttribute("aria-pressed", String(on));
        });
        const frame = host.querySelector(".modal-preview");
        frame.classList.toggle("pv-mobile", b.dataset.dev === "mobile");
        frame.classList.toggle("pv-desktop", b.dataset.dev === "desktop");
      }));
  });
}

function closeModal() {
  $("#modal").classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------- github ---------- */
const GH_CACHE_KEY = "vault_github_cache_v3";
const GH_TTL = 30 * 60 * 1000;

async function fetchRepos() {
  const username = state.config.githubUsername;
  const pinned = state.config.githubRepos || [];
  if (!username && !pinned.length) return null;
  try {
    const cached = JSON.parse(localStorage.getItem(GH_CACHE_KEY) || "null");
    if (cached && Date.now() - cached.t < GH_TTL) return cached.repos;
    let repos = [];
    if (pinned.length) {
      const results = await Promise.allSettled(
        pinned.map((full) => fetch(`https://api.github.com/repos/${full}`).then((r) => (r.ok ? r.json() : null)))
      );
      repos = results.map((r) => r.value).filter(Boolean);
    } else {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=8`);
      if (!res.ok) throw new Error(res.status === 403 ? "rate-limited" : "http " + res.status);
      repos = await res.json();
    }
    if (repos.length) {
      localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ t: Date.now(), repos }));
      return repos;
    }
    return cached ? cached.repos : null;
  } catch (err) {
    const cached = JSON.parse(localStorage.getItem(GH_CACHE_KEY) || "null");
    return cached ? cached.repos : { error: String(err.message || err) };
  }
}

const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c",
  Python: "#3572A5", Shell: "#89e051",
};

function repoRow(r) {
  return `<div class="repo">
    <h3><a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)} ↗</a></h3>
    <span class="rdesc">${esc(r.description || "No description.")}</span>
    ${r.language ? `<span class="rlang" style="--rl:${LANG_COLORS[r.language] || "#C33A1E"}">${esc(r.language)}</span>` : '<span class="rlang">-</span>'}
    <span class="rmeta">★ ${r.stargazers_count} · ⑂ ${r.forks_count}</span>
    <span class="rmeta">${new Date(r.updated_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
  </div>`;
}

async function renderGithub() {
  const data = await fetchRepos();
  const targets = [$("#githubHome"), $("#githubFull")].filter(Boolean);
  targets.forEach((el) => {
    if (!data) {
      el.innerHTML = `<p class="notice">GitHub integration is ready but no account is connected yet. Set
        <code>config.githubUsername</code> (or list repos in <code>config.githubRepos</code>) in
        <code>data/projects.json</code> and repository records will appear here.</p>`;
    } else if (data.error) {
      el.innerHTML = `<p class="notice">GitHub API unavailable (${esc(data.error)}). Cached data expired - try again shortly, or browse the repositories directly on GitHub.</p>`;
    } else {
      el.innerHTML = `<div class="repo-list">${data.slice(0, 8).map(repoRow).join("")}</div>`;
    }
  });
}

/* ---------- router ---------- */
const VIEWS = ["home", "explorer", "gallery", "github"];

function route() {
  const view = (location.hash.match(/^#\/([a-z]+)/) || [])[1] || "home";
  VIEWS.forEach((v) => {
    const el = $("#view-" + v);
    if (el) el.style.display = v === view ? "" : "none";
  });
  document.querySelectorAll("[data-view]").forEach((a) =>
    a.classList.toggle("active", a.dataset.view === view));
  $("#navLinks").classList.remove("open");
  $("#navToggle").setAttribute("aria-expanded", "false");
  if (view !== "home") window.scrollTo(0, 0);
  observeReveals();
}

/* ---------- reveal (with stagger + 2.5s failsafe) ---------- */
let io;
function observeReveals() {
  if (io) io.disconnect();
  io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }),
    { threshold: 0.06 }
  );
  const hidden = document.querySelectorAll(".reveal:not(.in)");
  hidden.forEach((el, i) => {
    el.style.setProperty("--gs-delay", Math.min(i * 60, 420) + "ms");
    io.observe(el);
  });
  // failsafe: nothing stays hidden
  setTimeout(() => document.body.classList.add("loaded"), 2500);
}

/* ---------- nav elevation on scroll ---------- */
const masthead = document.querySelector(".masthead");
window.addEventListener("scroll", () => {
  if (masthead) masthead.classList.toggle("scrolled", window.scrollY > 12);
}, { passive: true });

/* ============================================================
   Wiring - routers and nav listeners attach immediately, so the
   menu works even if data loading fails.
   ============================================================ */

function onRouteChange() {
  const cat = sessionStorage.getItem("vaultCat");
  if (cat) { state.filters.cat = cat; state.filters.tech = "All"; sessionStorage.removeItem("vaultCat"); renderExplorer(); }
  route();
  const focusId = sessionStorage.getItem("vaultFocus");
  if (focusId) { sessionStorage.removeItem("vaultFocus"); openModal(focusId); }
}

// one delegated listener for everything clickable
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-id]");
  if (t) { openModal(t.dataset.id); return; }
  const goto = e.target.closest("[data-goto]");
  if (goto) { sessionStorage.setItem("vaultFocus", goto.dataset.goto); return; }
  const cat = e.target.closest("[data-goto-cat]");
  if (cat) {
    state.filters.cat = cat.dataset.gotoCat; state.filters.tech = "All";
    sessionStorage.setItem("vaultCat", cat.dataset.gotoCat);
    if (location.hash !== "#/explorer") location.hash = "#/explorer";
    else { renderExplorer(); }
    return;
  }
  const gb = e.target.closest("#galleryFilters .fbtn");
  if (gb) { state.galleryFilter = gb.dataset.val; renderGallery(); observeReveals(); }
});

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// mobile menu toggle
$("#navToggle").addEventListener("click", () => {
  const open = $("#navLinks").classList.toggle("open");
  $("#navToggle").setAttribute("aria-expanded", String(open));
});

window.addEventListener("hashchange", onRouteChange);
route(); // show the right view immediately, before data arrives

/* ---------- data loading ---------- */
async function boot() {
  try {
    const res = await fetch("data/projects.json?v=" + Date.now(), { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    state.projects = data.projects;
    state.config = data.config || {};

    renderHome();
    renderExplorer();
    renderGallery();
    initExplorer();
    renderGithub();
    observeReveals();
  } catch (err) {
    const targets = [$("#githubHome"), $("#featuredGrid"), $("#explorerGrid"), $("#galleryGrid")].filter(Boolean);
    targets.forEach((el) => {
      el.innerHTML = '<p class="notice">Could not load <code>data/projects.json</code> (' +
        esc(String(err.message || err)) + "). If you opened this file directly from disk, serve the folder " +
        "with a local server (e.g. <code>npx serve</code>) or visit the GitHub Pages URL.</p>";
    });
  }
}

boot();
