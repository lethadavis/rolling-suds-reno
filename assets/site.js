/* ---------- Analytics ----------
   No analytics product is installed yet. Events are pushed to dataLayer so a
   GA4 or GTM tag can pick them up the day one is added. */
function track(event, detail = {}) {
  (window.dataLayer = window.dataLayer || []).push({ event, ...detail });
}

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
    track("quote_submit");
    msg.style.display = "block";
    msg.textContent = "Sending…";
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      form.reset();
      msg.textContent = "";
      msg.style.display = "none";
      // Swap the card over to the success state.
      document.getElementById("quoteModal")?.classList.add("is-sent");
      track("quote_success");
    } catch {
      msg.textContent = "Something went wrong. Please call us at {{PHONE}}.";
    }
  });

})();
const yearEl = document.getElementById("yr");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Hero background video ---------- */
(() => {
  const media = document.querySelector(".hero-media");
  if (!media || media.dataset.heroMode === "poster") return;
  const toggle = media.querySelector(".hero-media-toggle");

  // Checked when we are about to load, not at parse time: Chrome often reports
  // a slower effectiveType for the first moments of a page load.
  function shouldSkip() {
    const conn = navigator.connection || {};
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced-motion";
    if (conn.saveData === true) return "save-data";
    if (["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return "slow-connection";
    return null;
  }

  let api = null;
  let userPaused = false;
  let onScreen = true;
  const setPlaying = (on) => media.classList.toggle("is-playing", on);

  function loadFile() {
    const video = media.querySelector(".hero-video");
    for (const [type, key] of [["video/webm", "srcWebm"], ["video/mp4", "srcMp4"]]) {
      const src = video.dataset[key];
      if (!src) continue;
      const source = document.createElement("source");
      source.src = src;
      source.type = type;
      video.appendChild(source);
    }
    video.load();
    video.addEventListener("playing", () => setPlaying(true), { once: true });
    video.play().catch(() => {});
    api = { play: () => video.play().catch(() => {}), pause: () => video.pause() };
  }

  function loadYouTube() {
    const host = media.querySelector(".hero-yt");
    const id = host.dataset.yt;
    const from = Number(host.dataset.start) || 0;
    const to = Number(host.dataset.end) || 0;
    const mount = document.createElement("div");
    host.appendChild(mount);

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      const player = new YT.Player(mount, {
        host: "https://www.youtube-nocookie.com",
        videoId: id,
        playerVars: { autoplay: 1, mute: 1, controls: 0, playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1, fs: 0, start: from },
        events: {
          onReady: (e) => { e.target.mute(); e.target.seekTo(from, true); e.target.playVideo(); },
          onStateChange: (e) => { if (e.data === YT.PlayerState.PLAYING) setPlaying(true); },
        },
      });
      api = { play: () => player.playVideo(), pause: () => player.pauseVideo() };
      // The poster stays until playback is confirmed, whichever signal arrives first.
      const confirm = setInterval(() => {
        const state = player.getPlayerState ? player.getPlayerState() : null;
        if (state === 1) { setPlaying(true); clearInterval(confirm); }
        // Autoplay can be refused on the first gesture-less load; nudge it once.
        if (state === 5 || state === -1) player.playVideo();
      }, 300);
      setTimeout(() => clearInterval(confirm), 15000);

      // Loop the approved segment only, dipping to the poster so the jump back
      // is hidden and no end screen or related videos can appear.
      // Some embeds report a frozen currentTime, so wall clock time is used as
      // the fallback once playback has started.
      if (to > from) {
        let anchorTime = from;
        let anchorAt = performance.now();
        let lastReported = from;
        let dipping = false;

        const resetAnchor = (seconds) => { anchorTime = seconds; anchorAt = performance.now(); };

        setInterval(() => {
          if (userPaused || !onScreen || dipping) return;
          // Only stand down when the player is genuinely paused or ended.
          const state = player.getPlayerState ? player.getPlayerState() : 1;
          if (state === 2 || state === 0) return;

          const reported = player.getCurrentTime ? player.getCurrentTime() : 0;
          if (reported > lastReported + 0.05) {
            lastReported = reported;
            resetAnchor(reported);
          }
          const elapsed = (performance.now() - anchorAt) / 1000;
          const position = anchorTime + elapsed;

          if (position >= to - 0.35 || position < from - 1) {
            dipping = true;
            media.classList.add("is-dipping");
            setTimeout(() => {
              player.seekTo(from, true);
              player.playVideo();
              lastReported = from;
              resetAnchor(from);
              media.classList.remove("is-dipping");
              dipping = false;
            }, 300);
          }
        }, 250);
      }
    };
  }

  const begin = () => {
    // Reduced motion, Save-Data or a slow connection: the poster is the whole hero.
    const skip = shouldSkip();
    if (skip) {
      media.dataset.heroSkipped = skip;
      return;
    }
    if (toggle) toggle.hidden = false;
    media.dataset.heroMode === "youtube" ? loadYouTube() : loadFile();
  };
  const kick = () => ("requestIdleCallback" in window ? requestIdleCallback(begin, { timeout: 2500 }) : setTimeout(begin, 300));
  if (document.readyState === "complete") kick();
  else addEventListener("load", kick, { once: true });

  if (toggle) {
    toggle.addEventListener("click", () => {
      userPaused = !userPaused;
      toggle.dataset.state = userPaused ? "paused" : "playing";
      toggle.setAttribute("aria-label", userPaused ? "Play the background video" : "Pause the background video");
      if (!api) return;
      userPaused ? api.pause() : api.play();
    });
  }

  // Stop burning CPU when the tab is hidden or the hero is scrolled away.
  document.addEventListener("visibilitychange", () => {
    if (!api) return;
    if (document.hidden) api.pause();
    else if (!userPaused && onScreen) api.play();
  });
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (!api) return;
    if (onScreen && !userPaused) api.play();
    else api.pause();
  }, { threshold: 0.15 }).observe(media);
})();

/* ---------- Free quote modal ---------- */
(() => {
  const modal = document.getElementById("quoteModal");
  if (!modal) return;
  const supportsDialog = typeof modal.showModal === "function";
  let lastFocus = null;

  function lockScroll() {
    // Reserve the scrollbar width so locking does not shift the layout.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = gap > 0 ? gap + "px" : "";
    document.body.classList.add("quote-open");
  }
  function unlockScroll() {
    document.body.classList.remove("quote-open");
    document.body.style.paddingRight = "";
  }

  function openQuote(prefill = {}) {
    if (modal.open) return;
    lastFocus = document.activeElement;
    for (const [id, value] of Object.entries(prefill)) {
      const el = document.getElementById(id);
      if (el && value) el.value = value;
    }
    // <dialog> gives us the focus trap and Escape for free.
    if (supportsDialog) modal.showModal();
    else modal.setAttribute("open", "");
    lockScroll();
    const firstEmpty = [...modal.querySelectorAll("input, select, textarea")].find(el => !el.value);
    (firstEmpty || modal.querySelector("input, select")).focus();
    track("quote_open", { source: prefill.source || "button" });
  }
  function closeQuote() {
    if (supportsDialog) modal.close();
    else modal.removeAttribute("open");
    unlockScroll();
    lastFocus?.focus();
    if (location.hash === "#quote") history.replaceState(null, "", location.pathname);
  }
  window.openQuote = openQuote;

  document.getElementById("quoteModalClose")?.addEventListener("click", closeQuote);
  modal.addEventListener("close", () => { unlockScroll(); lastFocus?.focus(); });
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

  // A #quote link or a shared URL opens the card straight away.
  const openFromHash = () => { if (location.hash === "#quote") openQuote({ source: "hash" }); };
  addEventListener("hashchange", openFromHash);
  openFromHash();
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
