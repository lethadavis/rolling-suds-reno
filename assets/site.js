/* ---------- Analytics ----------
   No analytics product is installed yet. Events are pushed to dataLayer so a
   GA4 or GTM tag can pick them up the day one is added. */
function track(event, detail = {}) {
  (window.dataLayer = window.dataLayer || []).push({ event, ...detail });
}

/* ---------- Preferred method of contact ----------
   Shared by every lead form. Keeps the hidden preferred_contact field in step
   with the ticked boxes ("phone, email"), shows the text consent line while
   Text is ticked, and requires at least one choice. */
function contactPref(form) {
  const group = form.querySelector("[data-contact-group]");
  if (!group) return null;
  const boxes = [...group.querySelectorAll('input[type="checkbox"]')];
  const consent = group.querySelector(".sms-consent");
  const err = group.querySelector(".field-err");
  const hidden = form.querySelector('input[name="preferred_contact"]');
  const value = () => boxes.filter((b) => b.checked).map((b) => b.value).join(", ");
  const setError = (text) => {
    err.textContent = text;
    err.hidden = !text;
    group.classList.toggle("is-invalid", Boolean(text));
    boxes.forEach((b) => b.setAttribute("aria-invalid", text ? "true" : "false"));
  };
  const sync = () => {
    consent.hidden = !boxes.some((b) => b.value === "text" && b.checked);
    hidden.value = value();
    if (hidden.value) setError("");
  };
  boxes.forEach((b) => b.addEventListener("change", sync));
  sync();
  return {
    value,
    focus: () => boxes[0].focus(),
    reset: () => { boxes.forEach((b) => { b.checked = false; }); sync(); },
    validate() {
      sync();
      if (hidden.value) return true;
      setError("Please choose at least one way for us to contact you.");
      return false;
    },
  };
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
  const feature = document.querySelector(".g-feature");
  const pairs = [...document.querySelectorAll(".g-compare")];
  const escAttr = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ytThumb = (item) => `https://i.ytimg.com/vi/${item.youtube}/${item.short ? "oar2" : "maxresdefault"}.jpg`;
  const ytWatch = (item) => (item.short ? `https://www.youtube.com/shorts/${item.youtube}` : `https://www.youtube.com/watch?v=${item.youtube}`);

  // The featured video is rendered server side, so it is not a thumbnail.
  const items = GALLERY.filter((g) => !g.featured);

  const tiles = items.map((item, i) => {
    const btn = document.createElement("button");
    btn.className = "g-item";
    btn.dataset.cat = item.cat;
    const thumb = item.type === "video" ? ytThumb(item) : item.src;
    btn.innerHTML = `<img src="${escAttr(thumb)}" alt="${escAttr(item.alt || item.title)}" width="800" height="600" loading="lazy" decoding="async">
      <span class="g-tag">${GALLERY_CATEGORIES[item.cat] || ""}</span>
      ${item.type === "video" ? '<span class="g-play" aria-hidden="true"></span>' : ""}
      <span class="g-cap">${escAttr(item.title)}</span>
      <span class="sr-only">${item.type === "video" ? "play video" : "view photo"}</span>`;
    btn.addEventListener("click", () => openLb(i));
    grid.appendChild(btn);
    return btn;
  });

  /* ---- Only ever show complete rows, with the rest behind View more ---- */
  const moreBtn = document.getElementById("galleryMore");
  let expanded = false;
  const columnCount = () => getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;

  function matchesFilter(el, cat) {
    return cat === "all" || el.dataset.cat === cat;
  }

  function layout(cat) {
    const matching = tiles.filter((t) => matchesFilter(t, cat));
    tiles.forEach((t) => { t.hidden = true; });
    const cols = columnCount();
    const full = Math.floor(matching.length / cols) * cols;
    const shown = expanded || full === 0 ? matching.length : full;
    matching.slice(0, shown).forEach((t) => { t.hidden = false; });
    const hiddenCount = matching.length - shown;
    if (moreBtn) {
      moreBtn.hidden = hiddenCount === 0 && !expanded;
      moreBtn.textContent = expanded ? "Show fewer" : `View ${hiddenCount} more`;
    }
    pairs.forEach((p) => { p.hidden = !matchesFilter(p, cat); });
    const top = document.querySelector(".gallery-top");
    if (top) top.hidden = cat !== "all" && cat !== "before-after" && cat !== "video";
  }

  let activeCat = "all";
  moreBtn?.addEventListener("click", () => {
    expanded = !expanded;
    layout(activeCat);
  });
  addEventListener("resize", () => layout(activeCat));

  /* ---- Filters ---- */
  const cats = ["all", ...Object.keys(GALLERY_CATEGORIES).filter((c) => items.some((g) => g.cat === c) || pairs.some((p) => p.dataset.cat === c))];
  cats.forEach((c) => {
    const extra = pairs.filter((p) => c === "all" || p.dataset.cat === c).length + (c === "all" || c === "video" ? 1 : 0);
    const n = (c === "all" ? items.length : items.filter((g) => g.cat === c).length) + extra;
    const b = document.createElement("button");
    b.className = "g-filter";
    b.innerHTML = `${c === "all" ? "All" : GALLERY_CATEGORIES[c]}<span>${n}</span>`;
    b.setAttribute("aria-pressed", c === "all");
    b.addEventListener("click", () => {
      filters.querySelectorAll(".g-filter").forEach((x) => x.setAttribute("aria-pressed", x === b));
      activeCat = c;
      expanded = false;
      layout(c);
    });
    filters.appendChild(b);
  });
  layout("all");

  /* ---- Lightbox, built on the native dialog ---- */
  let current = -1;
  let lastFocus = null;
  const supportsDialog = typeof lb.showModal === "function";
  const visible = () => tiles.map((t, i) => (t.hidden ? -1 : i)).filter((i) => i >= 0);

  function lockScroll() {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = gap > 0 ? gap + "px" : "";
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
  }

  function showLb(i) {
    current = i;
    const item = items[i];
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

  function openDialog() {
    lockScroll();
    if (supportsDialog) lb.showModal();
    else lb.setAttribute("open", "");
    requestAnimationFrame(() => document.getElementById("lbClose").focus());
  }

  function openLb(i) {
    lastFocus = document.activeElement;
    showLb(i);
    openDialog();
  }

  // The featured card plays in the lightbox rather than inside the card.
  function openFeatured() {
    lastFocus = document.activeElement;
    current = -1;
    const id = feature.dataset.yt;
    const title = feature.querySelector(".g-feature-cap")?.textContent || "";
    lbContent.innerHTML = `<div class="lb-video"><iframe src="https://www.youtube-nocookie.com/embed/${escAttr(id)}?autoplay=1&rel=0&playsinline=1" title="${escAttr(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    lbCap.innerHTML = `${escAttr(title)}<small>Video won't play? <a href="https://www.youtube.com/watch?v=${escAttr(id)}" target="_blank" rel="noopener">Watch on YouTube</a></small>`;
    document.getElementById("lbPrev").hidden = document.getElementById("lbNext").hidden = true;
    openDialog();
  }

  if (feature) {
    feature.addEventListener("click", openFeatured);
    feature.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFeatured();
      }
    });
  }

  function closeLb() {
    if (supportsDialog) lb.close();
    else lb.removeAttribute("open");
    lbContent.innerHTML = ""; // stops playback
    unlockScroll();
    lastFocus?.focus();
  }
  function step(d) {
    const v = visible();
    if (v.length < 2 || current < 0) return;
    showLb(v[(v.indexOf(current) + d + v.length) % v.length]);
  }

  document.getElementById("lbClose").addEventListener("click", closeLb);
  document.getElementById("lbPrev").addEventListener("click", () => step(-1));
  document.getElementById("lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("cancel", (e) => { e.preventDefault(); closeLb(); });
  // Whatever closes the dialog, the player stops and the page unlocks.
  lb.addEventListener("close", () => {
    lbContent.innerHTML = "";
    unlockScroll();
    lastFocus?.focus();
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target === lbContent) closeLb(); });
  document.addEventListener("keydown", (e) => {
    const open = supportsDialog ? lb.open : lb.hasAttribute("open");
    if (!open) return;
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
    if (e.key === "Escape" && !supportsDialog) closeLb();
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
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
  const pref = contactPref(form);
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (pref && !pref.validate()) { pref.focus(); return; }
    // preferred_contact is the form's first field, so it leads the email body.
    const data = new FormData(form);
    if (!FORM_ENDPOINT) {
      const body = [...data.entries()].map(([k, v]) => `${k}: ${v}`).join("\n");
      location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent("Free Quote Request")}&body=${encodeURIComponent(body)}`;
      return;
    }
    track("quote_submit", { preferred_contact: pref ? pref.value() : "", offer: form.offer?.value || "" });
    msg.style.display = "block";
    msg.textContent = "Sending…";
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      form.reset();
      pref?.reset();
      const applied = document.getElementById("offerApplied");
      if (applied) applied.hidden = true;
      // TODO: Jesse to confirm the same business day promise.
      msg.textContent = "Thanks, we have your details. We will get back to you the same business day.";
      track("quote_success");
    } catch {
      msg.textContent = "Something went wrong. Please call us at {{PHONE}}.";
    }
  });

})();
const yearEl = document.getElementById("yr");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Quote buttons: scroll to the hero form and focus it ---------- */
(() => {
  const form = document.getElementById("quoteForm");
  const hero = document.getElementById("quote");
  const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Wildfire offer: only a code the form was built with (data-offer-code)
  // is accepted. It rides along as the hidden "offer" field.
  function applyOffer(code) {
    if (!form || !form.offer) return;
    const ok = Boolean(code) && form.dataset.offerCode === code;
    form.offer.value = ok ? code : "";
    const line = document.getElementById("offerApplied");
    if (line) line.hidden = !ok;
    if (ok) track("quote_offer_applied", { offer: code });
  }
  // Switching away from the wildfire service drops the offer.
  document.getElementById("f-svc")?.addEventListener("change", (e) => {
    if (form.offer?.value && !/wildfire/i.test(e.target.value)) applyOffer(null);
  });

  function focusForm(service, offer) {
    if (!form || !hero) return false;
    if (service) {
      const select = document.getElementById("f-svc");
      const option = [...select.options].find((o) => o.text === service);
      if (option) select.value = option.value;
    }
    applyOffer(offer);
    hero.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    // Focus after the scroll settles, without yanking the page back.
    setTimeout(() => document.getElementById("f-name")?.focus({ preventScroll: true }), smooth ? 500 : 0);
    track("quote_focus", { service: service || "none", offer: offer || "" });
    return true;
  }

  // On the homepage these scroll to the form. Elsewhere the href carries the
  // visitor to /#quote and the hash handler below picks it up on arrival.
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a.js-quote, a[href="#quote"], a[href="/#quote"]');
    if (!link || !form) return;
    e.preventDefault();
    // Keep ?service and ?offer in the address bar, as on a direct visit.
    if (link.dataset.offer) history.replaceState(null, "", link.getAttribute("href"));
    focusForm(link.dataset.service, link.dataset.offer);
  });

  // Runs after load, once the browser has restored any form values from a
  // reload, so a restored selection cannot undo the link's preselect.
  const params = new URLSearchParams(location.search);
  const arrive = () => {
    if (params.get("service") === "wildfire") setTimeout(() => focusForm("Wildfire Ash & Soot Cleanup", params.get("offer")), 50);
    else if (location.hash === "#quote") setTimeout(() => focusForm(), 50);
  };
  if (document.readyState === "complete") arrive();
  else addEventListener("load", arrive, { once: true });
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

/* ---------- Driveway Makeover Contest form ----------
   Posts to Netlify Forms ("driveway-contest"), photos included. Netlify caps a
   submission at 8 MB in total and one file per field, so photos are scaled
   down in the browser and sent as photo1 to photo4. */
(() => {
  const form = document.getElementById("contestForm");
  const page = document.querySelector(".contest-page");
  if (!page) return;
  track("contest_view", { contest_active: Boolean(form) });

  // Official Rules links open the accordion as well as jumping to it.
  const rules = document.getElementById("rules");
  const openRules = () => { if (rules) rules.open = true; };
  document.querySelectorAll('a[href="#rules"]').forEach((a) => a.addEventListener("click", openRules));
  if (location.hash === "#rules") openRules();

  if (!form) return;
  const loadedAt = Date.now();
  const MAX_PHOTOS = 4;
  const MAX_BYTES = 10 * 1024 * 1024;
  const SEND_BUDGET = 7.5 * 1024 * 1024; // under Netlify's 8 MB request cap
  const msg = document.getElementById("contestMsg");
  const success = document.getElementById("contestSuccess");
  const submitBtn = form.querySelector('button[type="submit"]');
  const zips = (form.dataset.zips || "").split(/\s+/).filter(Boolean);
  const pref = contactPref(form);

  /* ---- Tracking fields ---- */
  const params = new URLSearchParams(location.search);
  const utm = (k) => (params.get(k) || "").trim().slice(0, 100);
  form.utm_source.value = utm("utm_source") || "direct";
  form.utm_medium.value = utm("utm_medium");
  form.utm_campaign.value = utm("utm_campaign");
  form.lead_source.value = utm("utm_source") || form.dataset.leadSource;
  form.page_url.value = location.href;

  let started = false;
  form.addEventListener("focusin", () => {
    if (started) return;
    started = true;
    track("contest_form_start");
  });

  // Hero button: scroll to the form and put the cursor in the first field.
  document.querySelectorAll("a.js-enter").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("enter").scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      setTimeout(() => document.getElementById("c-name").focus({ preventScroll: true }), smooth ? 500 : 0);
    })
  );

  /* ---- Photos: one picker, thumbnails, remove buttons ---- */
  const picker = form.querySelector(".photo-picker");
  const pick = document.getElementById("c-photo-pick");
  const thumbs = form.querySelector(".photo-thumbs");
  const addText = form.querySelector(".photo-add-text");
  const fallback = form.querySelector(".photo-fallback");
  const photosErr = document.getElementById("photos-err");
  const photos = []; // { file, url, ready: Promise<File> }

  picker.hidden = false;
  fallback.hidden = true;
  fallback.querySelectorAll("input").forEach((i) => { i.required = false; i.disabled = true; });

  async function shrink(file, maxEdge, quality) {
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
      bmp.close?.();
      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
      if (!blob || blob.size >= file.size) return file;
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
    } catch {
      return file; // a format this browser cannot draw: send it as is
    }
  }

  function renderPhotos() {
    thumbs.innerHTML = "";
    photos.forEach((p, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<img src="${p.url}" alt="Driveway photo ${i + 1}"><button type="button" class="photo-remove" aria-label="Remove photo ${i + 1}"><span aria-hidden="true">&times;</span></button>`;
      li.querySelector("button").addEventListener("click", () => {
        URL.revokeObjectURL(p.url);
        photos.splice(i, 1);
        renderPhotos();
        pick.focus();
      });
      thumbs.appendChild(li);
    });
    picker.classList.toggle("is-full", photos.length >= MAX_PHOTOS);
    addText.textContent = photos.length ? `Add another photo (${photos.length} of ${MAX_PHOTOS})` : "Add photos";
  }

  pick.addEventListener("change", () => {
    const notes = [];
    for (const file of pick.files) {
      if (photos.length >= MAX_PHOTOS) { notes.push(`You can add up to ${MAX_PHOTOS} photos.`); break; }
      if (!file.type.startsWith("image/")) { notes.push(`${file.name} is not a photo.`); continue; }
      if (file.size > MAX_BYTES) { notes.push(`${file.name} is over 10 MB. Try a smaller photo.`); continue; }
      photos.push({ file, url: URL.createObjectURL(file), ready: shrink(file, 2000, 0.82) });
      track("contest_photo_added", { photo_count: photos.length });
    }
    pick.value = "";
    renderPhotos();
    setError(pick, photosErr, notes.join(" "));
  });

  /* ---- Validation ---- */
  function setError(input, errEl, text) {
    errEl.innerHTML = text || "";
    errEl.hidden = !text;
    if (input === pick) form.querySelector(".photo-add").classList.toggle("is-invalid", Boolean(text));
    else input.setAttribute("aria-invalid", text ? "true" : "false");
  }
  const errFor = (input) => document.getElementById(input.id + "-err");
  const digits = (v) => v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");

  function checkField(input) {
    const v = input.type === "checkbox" ? input.checked : input.value.trim();
    let text = "";
    if (!v) {
      text = {
        "c-name": "Please enter your full name.",
        "c-email": "Please enter your email address.",
        "c-phone": "Please enter your mobile number.",
        "c-street": "Please enter the street address.",
        "c-city": "Please enter the city.",
        "c-zip": "Please enter the ZIP code.",
        "c-owner": "The contest is open to homeowners only. Please confirm you own this home.",
      }[input.id];
    } else if (input.id === "c-email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      text = "Please check the email address. It should look like name@example.com.";
    } else if (input.id === "c-phone" && digits(v).length !== 10) {
      text = "Please enter a 10 digit phone number, area code first.";
    } else if (input.id === "c-zip") {
      const zip = v.slice(0, 5);
      if (!/^\d{5}(-\d{4})?$/.test(v)) text = "Please enter a 5 digit ZIP code.";
      else if (zips.length && !zips.includes(zip))
        text = `That ZIP is outside our service area right now. Call us and we'll see what we can do: <a href="tel:{{PHONE_HREF}}">{{PHONE}}</a>`;
    }
    setError(input, errFor(input), text);
    return !text;
  }

  const fields = ["c-name", "c-email", "c-phone", "c-street", "c-city", "c-zip", "c-owner"].map((id) => document.getElementById(id));
  fields.forEach((input) => {
    input.addEventListener(input.type === "checkbox" ? "change" : "blur", () => {
      if (input.type === "checkbox" || input.value.trim() || input.getAttribute("aria-invalid") === "true") checkField(input);
    });
  });

  function checkPhotos() {
    const ok = photos.length > 0;
    setError(pick, photosErr, ok ? "" : "Please add at least 1 photo of your driveway.");
    return ok;
  }

  /* ---- Submit ---- */
  const showSuccess = () => {
    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ block: "center" });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.style.display = "none";
    const results = fields.map(checkField);
    const photosOk = checkPhotos();
    const contactOk = pref.validate();
    if (results.includes(false) || !photosOk || !contactOk) {
      const first = fields.find((f, i) => !results[i]);
      if (first) first.focus();
      else if (!photosOk) pick.focus();
      else pref.focus();
      return;
    }

    // Bots: a filled honeypot or a form completed in under 3 seconds gets the
    // success screen but nothing is sent.
    if (form["bot-field"].value || Date.now() - loadedAt < 3000) {
      showSuccess();
      return;
    }

    track("contest_submit", { photo_count: photos.length, lead_source: form.lead_source.value, preferred_contact: pref.value() });
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending your entry…";

    try {
      let files = await Promise.all(photos.map((p) => p.ready));
      if (files.reduce((n, f) => n + f.size, 0) > SEND_BUDGET) {
        files = await Promise.all(photos.map((p) => shrink(p.file, 1400, 0.72)));
      }
      if (files.reduce((n, f) => n + f.size, 0) > SEND_BUDGET) {
        throw new Error("too-large");
      }

      form.submitted_at.value = new Date().toISOString();
      const data = new FormData(form);
      for (let n = 1; n <= MAX_PHOTOS; n++) data.delete("photo" + n);
      files.forEach((f, i) => data.append("photo" + (i + 1), f, f.name));

      const res = await fetch("/", { method: "POST", body: data });
      if (!res.ok) throw new Error("http " + res.status);
      track("contest_success", { photo_count: files.length, lead_source: form.lead_source.value });
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      showSuccess();
    } catch (err) {
      msg.innerHTML =
        err.message === "too-large"
          ? "Those photos are too large to send together. Please remove one and try again."
          : 'Something went wrong sending your entry. Please try again, or call us at <a href="tel:{{PHONE_HREF}}">{{PHONE}}</a>.';
      msg.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "Enter the Makeover Contest";
    }
  });
})();
