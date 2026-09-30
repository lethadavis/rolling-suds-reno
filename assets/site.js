/* ---------- SETTINGS ---------- */
// Where quote requests are sent. Paste a Formspree/Netlify/etc. URL here.
// Left empty, the form opens the visitor's email app instead.
const FORM_ENDPOINT = "";
const FALLBACK_EMAIL = "{{EMAIL}}";

// Gallery. Photos go in images/gallery/. Videos use the YouTube video ID
// (the part after "shorts/" or "youtu.be/"); set short: true for Shorts.
// cat: "before-after", "on-the-job" or "video". featured: true = big tile.
const GALLERY_CATEGORIES = { "before-after": "Before & After", "on-the-job": "On the Job", "video": "Videos" };
const GALLERY = [
  { type: "video", cat: "video", youtube: "pDbqotygNrI", featured: true, title: "6 Minutes of Pure Power Washing Satisfaction" },
  { type: "photo", cat: "before-after", src: "images/gallery/stone-building-before-after.webp", title: "Commercial Building Wash", alt: "Before and after commercial building washing: dirt and mildew removed from a stone office building" },
  { type: "photo", cat: "before-after", src: "images/gallery/house-wash-siding.webp", title: "House Washing", alt: "Before and after soft wash house washing: mildew-streaked vinyl siding cleaned" },
  { type: "video", cat: "video", youtube: "ooFJGDmO_xA", short: true, title: "You Forgot What Color Your Driveway Actually Is" },
  { type: "photo", cat: "before-after", src: "images/gallery/skylight-roof-before-after.webp", title: "Skylight & Roof Cleaning", alt: "Before and after cleaning a stained commercial skylight roof and metal awning" },
  { type: "photo", cat: "before-after", src: "images/gallery/deck-cleaning.webp", title: "Deck Cleaning", alt: "Before and after deck cleaning: weathered gray wood deck restored to rich brown" },
  { type: "photo", cat: "on-the-job", src: "images/gallery/crew-driveway-cleaning.webp", title: "Driveway Surface Cleaning", alt: "Rolling Suds truck hose reels with a technician surface cleaning a driveway" },
  { type: "photo", cat: "before-after", src: "images/gallery/tile-roof-cleaning.webp", title: "Tile Roof Cleaning", alt: "Tile roof mid-cleaning: cleaned tiles beside darkened, uncleaned tiles" },
  { type: "photo", cat: "before-after", src: "images/gallery/commercial-wall-before-after.webp", title: "Commercial Wall Cleaning", alt: "Before and after power washing a commercial building's streaked exterior wall" },
  { type: "video", cat: "video", youtube: "UMQQkp_TK3o", short: true, title: "Rolling Suds Power Washing" },
  { type: "photo", cat: "before-after", src: "images/gallery/house-wash-chimney.webp", title: "House Washing", alt: "Before and after house washing: black mold removed from a stucco chimney and vinyl siding" },
  { type: "photo", cat: "before-after", src: "images/gallery/paver-patio.webp", title: "Paver Patio Cleaning", alt: "Before and after paver patio cleaning restoring brick paver color" },
  { type: "photo", cat: "on-the-job", src: "images/gallery/truck-driveway-cleaning.webp", title: "Residential Driveway Cleaning", alt: "Rolling Suds truck parked at a home while a technician cleans the driveway" },
];

/* ---------- Gallery ---------- */
(() => {
  // Gallery lives on the homepage only.
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const filters = document.getElementById("gFilters");
  const lb = document.getElementById("lightbox");
  const lbContent = document.getElementById("lbContent");
  const lbCap = document.getElementById("lbCap");
  const escAttr = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ytThumb = item => `https://i.ytimg.com/vi/${item.youtube}/${item.short ? "oar2" : "maxresdefault"}.jpg`;
  const ytWatch = item => item.short ? `https://www.youtube.com/shorts/${item.youtube}` : `https://www.youtube.com/watch?v=${item.youtube}`;

  const tiles = GALLERY.map((item, i) => {
    const btn = document.createElement("button");
    btn.className = "g-item" + (item.featured ? " featured" : "");
    btn.dataset.cat = item.cat;

    const thumb = item.type === "video" ? ytThumb(item) : item.src;
    btn.innerHTML = `<img src="${escAttr(thumb)}" alt="${escAttr(item.alt || item.title)}" loading="lazy">
      <span class="g-tag">${GALLERY_CATEGORIES[item.cat] || ""}</span>
      ${item.type === "video" ? '<span class="g-play" aria-hidden="true"></span>' : ""}
      <span class="g-cap">${escAttr(item.title)}</span>
    <span class="sr-only">${item.type === "video" ? "play video" : "view photo"}</span>`;
    btn.addEventListener("click", () => openLb(i));
    grid.appendChild(btn);
    return btn;
  });

  // Comparison cards sit at the top of the right column, after the featured tile.
  const compareTpl = document.getElementById("galleryCompare");
  const compareCards = compareTpl ? [...compareTpl.content.children] : [];
  if (compareCards.length && tiles.length) {
    compareCards.reduce((prev, card) => { prev.after(card); return card; }, tiles[0]);
  }

  // Filter buttons (only categories that have items)
  const cats = ["all", ...Object.keys(GALLERY_CATEGORIES).filter(c => GALLERY.some(g => g.cat === c))];
  cats.forEach(c => {
    const extra = compareCards.filter(x => c === "all" || x.dataset.cat === c).length;
  const n = (c === "all" ? GALLERY.length : GALLERY.filter(g => g.cat === c).length) + extra;
    const b = document.createElement("button");
    b.className = "g-filter";
    b.innerHTML = `${c === "all" ? "All" : GALLERY_CATEGORIES[c]}<span>${n}</span>`;
    b.setAttribute("aria-pressed", c === "all");
    b.addEventListener("click", () => {
      filters.querySelectorAll(".g-filter").forEach(x => x.setAttribute("aria-pressed", x === b));
      [...tiles, ...compareCards].forEach(t => t.hidden = c !== "all" && t.dataset.cat !== c);
    });
    filters.appendChild(b);
  });

  // Pop-up viewer
  let current = -1, lastFocus = null;
  const visible = () => tiles.map((t, i) => t.hidden ? -1 : i).filter(i => i >= 0);
  function showLb(i) {
    current = i;
    const item = GALLERY[i];
    if (item.type === "video") {
      lbContent.innerHTML = `<div class="lb-video${item.short ? " short" : ""}"><iframe src="https://www.youtube-nocookie.com/embed/${escAttr(item.youtube)}?autoplay=1&rel=0&playsinline=1" title="${escAttr(item.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
      lbCap.innerHTML = `${escAttr(item.title)}<small>Video won't play? <a href="${ytWatch(item)}" target="_blank" rel="noopener">Watch on YouTube</a></small>`;
    } else {
      lbContent.innerHTML = `<img src="${escAttr(item.src)}" alt="${escAttr(item.alt || item.title)}">`;
      lbCap.textContent = item.title;
    }
    const v = visible();
    document.getElementById("lbPrev").hidden = document.getElementById("lbNext").hidden = v.length < 2;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    showLb(i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }
  function step(d) {
    const v = visible(); if (v.length < 2) return;
    showLb(v[(v.indexOf(current) + d + v.length) % v.length]);
  }
  function closeLb() {
    lb.classList.remove("open");
    lbContent.innerHTML = "";   // stops video playback
    document.body.style.overflow = "";
    lastFocus?.focus();
  }
  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb || e.target === lbContent) closeLb(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });

})();
/* ---------- Mobile menu ---------- */
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.querySelectorAll(".nav-links a").forEach(a => a.addEventListener("click", () => closeMenu()));

function closeMenu() {
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menuBtn.focus();
  }
});

// Compact the header once the page has scrolled past the first 40px.
let ticking = false;
function syncHeader() {
  nav.classList.toggle("is-compact", window.scrollY > 40);
  ticking = false;
}
addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(syncHeader); }
}, { passive: true });
syncHeader();

/* ---------- Quote form ---------- */
(() => {
  const form = document.getElementById("quoteForm");
  if (!form) return;
  const msg = document.getElementById("formMsg");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = new FormData(form);
    if (!FORM_ENDPOINT) {
      const body = [...data.entries()].map(([k, v]) => `${k}: ${v}`).join("\n");
      location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent("Free Quote Request")}&body=${encodeURIComponent(body)}`;
      return;
    }
    msg.style.display = "block";
    msg.textContent = "Sending…";
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      form.reset();
      msg.textContent = "Thanks! We got your request and will be in touch the same business day.";
    } catch {
      msg.textContent = "Something went wrong. Please call us at {{PHONE}}.";
    }
  });

})();
const yearEl = document.getElementById("yr");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Free quote modal ---------- */
(() => {
  const modal = document.getElementById("quoteModal");
  if (!modal) return;
  const supportsDialog = typeof modal.showModal === "function";
  let lastFocus = null;

  function openQuote(prefill = {}) {
    lastFocus = document.activeElement;
    for (const [id, value] of Object.entries(prefill)) {
      const el = document.getElementById(id);
      if (el && value) el.value = value;
    }
    // <dialog> gives us the focus trap and Escape for free.
    if (supportsDialog) modal.showModal();
    else modal.setAttribute("open", "");
    const firstEmpty = [...modal.querySelectorAll("input, select, textarea")].find(el => !el.value);
    (firstEmpty || modal.querySelector("input, select")).focus();
  }
  function closeQuote() {
    if (supportsDialog) modal.close();
    else modal.removeAttribute("open");
    lastFocus?.focus();
  }
  window.openQuote = openQuote;

  document.getElementById("quoteModalClose")?.addEventListener("click", closeQuote);
  modal.addEventListener("close", () => lastFocus?.focus());
  // Clicking the backdrop closes it
  modal.addEventListener("click", e => { if (e.target === modal) closeQuote(); });
  if (!supportsDialog) {
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.hasAttribute("open")) closeQuote(); });
  }

  // Any Free Quote link opens the modal. Without scripting they still land on
  // the hero quote bar, which posts on its own.
  document.addEventListener("click", e => {
    const link = e.target.closest('a.js-quote, a[href="#quote"], a[href="/#quote"], a[href="#quote-form"]');
    if (!link) return;
    e.preventDefault();
    openQuote(link.dataset.service ? { "f-svc": link.dataset.service } : {});
  });

  // The slim hero bar carries its three answers into the full form.
  const bar = document.getElementById("quoteBar");
  bar?.addEventListener("submit", e => {
    e.preventDefault();
    if (!bar.reportValidity()) return;
    openQuote({
      "f-svc": document.getElementById("qb-svc").value,
      "f-addr": document.getElementById("qb-zip").value,
      "f-phone": document.getElementById("qb-phone").value,
    });
  });
})();

/* ---------- Reviews carousel ---------- */
(() => {
  const track = document.getElementById("revTrack");
  if (!track) return;
  const dotsEl = document.getElementById("revDots");
  const cards = [...track.children];
  const stepW = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const perView = () => Math.max(1, Math.round((track.clientWidth + 22) / stepW()));
  const pages = () => Math.max(1, cards.length - perView() + 1);
  const page = () => Math.round(track.scrollLeft / stepW());
  const go = i => { const n = pages(); track.scrollTo({ left: ((i % n) + n) % n * stepW() }); };
  function renderDots() {
    const n = pages(), cur = Math.min(page(), n - 1);
    dotsEl.innerHTML = Array.from({ length: n }, (_, i) => `<button aria-label="Show review ${i + 1}" aria-current="${i === cur}"></button>`).join("");
    [...dotsEl.children].forEach((b, i) => b.onclick = () => go(i));
  }
  document.getElementById("revPrev").onclick = () => go(page() - 1);
  document.getElementById("revNext").onclick = () => go(page() + 1);
  let t; track.addEventListener("scroll", () => { clearTimeout(t); t = setTimeout(renderDots, 80); });
  window.addEventListener("resize", renderDots);
  renderDots();
  // Gentle auto-advance; pauses on hover, focus or touch, and for reduced-motion users
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let paused = false;
    const car = track.closest(".rev-carousel");
    ["mouseenter", "focusin", "touchstart"].forEach(e => car.addEventListener(e, () => paused = true, { passive: true }));
    ["mouseleave", "focusout"].forEach(e => car.addEventListener(e, () => paused = false));
    setInterval(() => { if (!paused && !document.hidden) go(page() + 1); }, 6000);
  }
})();
