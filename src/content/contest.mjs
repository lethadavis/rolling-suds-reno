// The Great Driveway Makeover Contest landing page (/driveway).
// Destination for the direct mail postcard: QR code, printed URL and the
// /driveway-makeover, /spa and /makeover redirects in netlify.toml. Not in the nav or
// the sitemap, and noindex.
//
// Entries go to Netlify Forms as "driveway-contest". Netlify reads the form
// from this static HTML at deploy time, so every field the script fills in
// (UTM values, lead source, page URL, timestamp, photo1 to photo4) has to be
// present in the markup below.
//
// Wording must match the postcard. Rules text is the postcard's own.
import { existsSync } from "node:fs";
import { FLAGS, SERVICE_ZIPS, CONTEST } from "../../site.config.js";
import { resolveShot } from "../templates/image.mjs";
import { beforeAfter, pairIsComplete } from "../templates/before-after.mjs";
import { contactPref } from "../templates/contact-pref.mjs";
import { isProduction } from "../env.mjs";

const STEPS = [
  "Fill out the form below and add photos of your driveway.",
  "Qualifying homes receive a FREE, no-obligation driveway cleaning.",
  "Every free cleaning is automatically entered in the grand prize drawing.",
  "One winner gets the ultimate home spa treatment, including a free professional house wash.",
];

const PERKS = [
  "A free, no-obligation driveway wash",
  "Professional techniques and equipment, with our mobile wash truck and trained techs",
  "Eco-friendly cleaning with biodegradable products",
  "A chance to win the ultimate home makeover, free",
];

const RULES = [
  "Entry submission does not guarantee selection.",
  "Free driveway cleanings are offered at the sole discretion of Rolling Suds Reno-Tahoe. Decision factors can and will include service area, surface condition and availability.",
  "One entry per household. Homeowners only.",
  "Rolling Suds Reno-Tahoe reserves the right to change and modify these terms at any time, for any reason, and assumes no liability.",
  "No purchase necessary.",
];

// Not invented. Each one is confirmed with Francine before launch, then moved
// into RULES above.
const RULES_TODO = [
  "Contest start and end date",
  "Grand prize description and approximate value",
  "How and when the winner is selected and notified",
  "Sponsor legal name and address",
  "Eligibility (proposed: 18+, Nevada and California service area residents)",
  "Number of free driveway cleanings available",
];

const privacyLink = CONTEST.privacyUrl
  ? `<a href="${CONTEST.privacyUrl}">Privacy Policy</a>`
  : `<span class="tbd">Privacy Policy (TODO: no privacy page yet, add CONTEST.privacyUrl)</span>`;

// Hero photo: a background on the right half with its left edge faded into
// the page. Missing photo: a soft placeholder on staging, nothing in production.
export const HERO_PHOTO = "/images/contest/spa-driveway.webp";

function heroArt() {
  const webp = resolveShot("contest", "spa-driveway");
  const jpg = ["jpg", "jpeg", "png"].map((e) => `images/contest/spa-driveway.${e}`).find((f) => existsSync(f));
  const badgeSrc = resolveShot("contest", "driveway-makeover-badge");
  // The badge repeats the eyebrow text, so it is decorative.
  const badge = badgeSrc
    ? `<img class="contest-badge" src="${badgeSrc}" alt="" width="180" height="180" decoding="async" fetchpriority="high">`
    : "";
  let photo = "";
  if (webp || jpg) {
    photo = `<picture class="contest-photo">
        ${webp && webp.endsWith(".webp") ? `<source srcset="${webp}" type="image/webp">` : ""}
        <img src="/${jpg || webp.slice(1)}" alt="A driveway in a towel and cucumber slices enjoying a spa day" width="1010" height="1536" decoding="async" fetchpriority="high">
      </picture>`;
  } else if (!isProduction) {
    photo = `<div class="contest-photo contest-photo-empty" data-slot="contest/spa-driveway"><span class="shot-empty-label">Photo coming soon</span></div>`;
  }
  if (!photo && !badge) return "";
  return `<div class="contest-art">
      ${photo}
      ${badge}
    </div>`;
}

// Layered ridgelines: the Sierra crest behind, Peavine's broad dome in the
// middle, low foothills in front. Faded out toward the top in CSS.
const RIDGES = `<svg class="contest-ridges" viewBox="0 0 1440 360" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path fill="#8dbdd6" fill-opacity=".08" d="M0 170 60 150 110 162 170 120 215 140 260 105 300 128 350 96 400 122 450 110 520 140 600 128 680 150 760 135 840 160 920 140 1000 155 1080 130 1150 148 1220 118 1280 136 1340 112 1400 130 1440 120V360H0Z"/>
      <path fill="#6aa9c9" fill-opacity=".11" d="M0 212C120 182 200 192 300 172S480 202 560 192 760 177 860 197 1060 172 1160 187 1360 177 1440 192V360H0Z"/>
      <path fill="#4b97bd" fill-opacity=".15" d="M0 252C100 242 180 204 300 178 380 162 460 167 540 202 620 234 700 242 820 238 960 234 1100 222 1240 230 1330 235 1400 238 1440 240V360H0Z"/>
      <path fill="#19b5d9" fill-opacity=".22" d="M0 302C140 282 260 294 400 286S660 264 800 282 1080 302 1220 288 1380 278 1440 284V360H0Z"/>
    </svg>`;

// Driveway tiles after How it works. Existing gallery files are referenced in
// place, never copied. A driveway before and after pair, once both photos are
// in images/gallery/compare, replaces the two empty slots with the
// BeforeAfter card. Missing photos show a placeholder on staging only, and the
// row disappears when fewer than 2 real photos exist.
const DRIVEWAY_TILES = [
  { src: "images/gallery/crew-driveway-cleaning.webp", label: "On the job", alt: "Technician surface cleaning a driveway beside the Rolling Suds truck" },
  { src: "images/gallery/truck-driveway-cleaning.webp", label: "On the job", alt: "Rolling Suds truck parked at a home while a technician cleans the driveway" },
];
const DRIVEWAY_PAIR = {
  id: "driveway",
  beforeName: "driveway-before",
  afterName: "driveway-after",
  beforeLabel: "Before",
  afterLabel: "After",
  caption: "Driveway cleaning",
  alts: {
    before: "Stained concrete driveway before cleaning",
    after: "The same driveway after cleaning",
  },
};

function drivewayRow() {
  const tile = (t) => `<figure class="drive-tile">
        <img src="/${t.src}" alt="${t.alt}" width="1200" height="900" loading="lazy" decoding="async">
        <span class="compare-label">${t.label}</span>
      </figure>`;
  const empty = (name, label) => `<figure class="drive-tile drive-tile-empty" data-slot="gallery/compare/${name}">
        <span class="shot-empty-label">Photo coming soon</span>
        <span class="compare-label">${label}</span>
      </figure>`;

  const real = DRIVEWAY_TILES.filter((t) => existsSync(t.src));
  const pair = pairIsComplete(DRIVEWAY_PAIR);
  const count = real.length + (pair ? 2 : 0);
  if (count < 2) return "";

  const items = real.map(tile);
  if (pair) items.push(`<div class="drive-pair">${beforeAfter(DRIVEWAY_PAIR)}</div>`);
  else if (!isProduction) items.push(empty("driveway-before", "Before"), empty("driveway-after", "After"));

  return `<section class="contest-drives" aria-labelledby="drives-heading">
  <div class="wrap">
    <h2 class="contest-h2" id="drives-heading">Driveway glow-ups</h2>
    <div class="drive-grid">
      ${items.join("\n      ")}
    </div>
  </div>
</section>`;
}

const field = ({ id, name, label, type = "text", autocomplete, inputmode, extra = "", full = false, placeholder = "" }) =>
  `<div class="field${full ? " full" : ""}">
            <label for="${id}">${label} <span aria-hidden="true">*</span></label>
            <input id="${id}" name="${name}" type="${type}" required aria-required="true" aria-describedby="${id}-err"${autocomplete ? ` autocomplete="${autocomplete}"` : ""}${inputmode ? ` inputmode="${inputmode}"` : ""}${placeholder ? ` placeholder="${placeholder}"` : ""}${extra}>
            <p class="field-err" id="${id}-err" hidden></p>
          </div>`;

function entryForm() {
  const zips = SERVICE_ZIPS.length ? ` data-zips="${SERVICE_ZIPS.join(" ")}"` : "";
  return `<form id="contestForm" name="driveway-contest" method="POST" action="/driveway/?entered=1" enctype="multipart/form-data" data-netlify="true" netlify-honeypot="bot-field" data-lead-source="${CONTEST.leadSource}"${zips} novalidate>
        <input type="hidden" name="form-name" value="driveway-contest">
        <input type="hidden" name="lead_source" value="${CONTEST.leadSource}">
        <input type="hidden" name="utm_source" value="direct">
        <input type="hidden" name="utm_medium" value="">
        <input type="hidden" name="utm_campaign" value="">
        <input type="hidden" name="page_url" value="">
        <input type="hidden" name="submitted_at" value="">
        <p class="hp" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>

        <div class="form-grid">
          ${field({ id: "c-name", name: "name", label: "Full name", autocomplete: "name", full: true })}
          ${field({ id: "c-email", name: "email", label: "Email", type: "email", autocomplete: "email", inputmode: "email" })}
          ${field({ id: "c-phone", name: "phone", label: "Mobile phone", type: "tel", autocomplete: "tel", inputmode: "tel", placeholder: "(775) 555-0123" })}
          ${field({ id: "c-street", name: "street", label: "Street address", autocomplete: "address-line1", full: true })}
          ${field({ id: "c-city", name: "city", label: "City", autocomplete: "address-level2" })}
          ${field({ id: "c-zip", name: "zip", label: "ZIP", autocomplete: "postal-code", inputmode: "numeric", extra: ' maxlength="10"' })}

          <div class="field full">
            <div class="check-row">
              <input id="c-owner" name="homeowner" type="checkbox" value="yes" required aria-required="true" aria-describedby="c-owner-err">
              <label for="c-owner">I own this home <span aria-hidden="true">*</span></label>
            </div>
            <p class="field-err" id="c-owner-err" hidden></p>
          </div>

          <fieldset class="field full photo-field" aria-describedby="photos-hint photos-err">
            <legend>Add 1 to 4 photos of your driveway (the messier the better) <span aria-hidden="true">*</span></legend>
            <div class="photo-picker" hidden>
              <input id="c-photo-pick" class="photo-pick sr-only" type="file" accept="image/*" multiple aria-describedby="photos-hint photos-err">
              <label class="photo-add" for="c-photo-pick"><svg aria-hidden="true"><use href="#i-camera"/></svg><span class="photo-add-text">Add photos</span></label>
              <ul class="photo-thumbs" aria-label="Photos added"></ul>
            </div>
            <div class="photo-fallback">
              ${[1, 2, 3, 4].map((n) => `<label>Photo ${n}${n === 1 ? " (required)" : ""} <input type="file" name="photo${n}" accept="image/*"${n === 1 ? " required" : ""}></label>`).join("\n              ")}
            </div>
            <p class="hint" id="photos-hint">Take them with your phone camera or choose from your photos. Up to 10 MB each.</p>
            <p class="field-err" id="photos-err" hidden></p>
          </fieldset>

          <div class="field full">
            <label for="c-notes">Anything we should know?</label>
            <textarea id="c-notes" name="notes" rows="3"></textarea>
          </div>
        </div>

        ${contactPref("c", { single: true })}

        <button class="btn btn-green btn-lg" type="submit">Enter the Makeover Contest</button>
        <p class="form-msg" id="contestMsg" role="alert"></p>
        <p class="consent">By submitting, you agree to be contacted by Rolling Suds Reno-Tahoe about this contest by phone, text or email. Message and data rates may apply. Reply STOP to opt out. ${privacyLink} &middot; <a href="#rules" class="js-rules">Official Rules</a></p>
      </form>
      <div class="contest-success" id="contestSuccess" tabindex="-1" hidden>
        <span class="success-icon" aria-hidden="true"><svg><use href="#i-check"/></svg></span>
        <h2>You&rsquo;re entered!</h2>
        <p>We&rsquo;ll review your photos and be in touch within 2 business days.</p>
        <p class="form-foot">Questions in the meantime? Call <a href="tel:{{PHONE_HREF}}">{{PHONE}}</a></p>
      </div>`;
}

function rules() {
  return `<section class="contest-rules" aria-labelledby="rules-heading">
  <div class="wrap">
    <details id="rules" class="rules-box">
      <summary><h2 id="rules-heading">Official Rules</h2></summary>
      <ul>
        ${RULES.map((r) => `<li>${r}</li>`).join("\n        ")}
        ${RULES_TODO.map((r) => `<li><span class="tbd">TODO: ${r}</span></li>`).join("\n        ")}
      </ul>
    </details>
  </div>
</section>`;
}

const trustRow = `<div class="trust-slim" aria-label="About Rolling Suds Reno-Tahoe">
  <div class="wrap trust-slim-row">
    <span class="trust-item"><svg aria-hidden="true"><use href="#i-shield"/></svg>Fully Insured</span>
    <span class="trust-item"><svg aria-hidden="true"><use href="#i-house"/></svg>Locally Owned &amp; Operated</span>
    <span class="trust-item"><svg aria-hidden="true"><use href="#i-leaf"/></svg>Eco-friendly cleaning</span>
  </div>
</div>`;

const softCta = `<section class="contest-more bg-off">
  <div class="wrap contest-more-inner">
    <h2>Looking for more than a driveway cleaning?</h2>
    <div class="hero-ctas">
      <a class="btn btn-green btn-lg" href="/#quote">Get a Free Quote</a>
      <a class="btn btn-light btn-lg" href="tel:{{PHONE_HREF}}"><svg aria-hidden="true"><use href="#i-phone"/></svg>Call {{PHONE}}</a>
    </div>
  </div>
</section>`;

export function contestBody() {
  const active = FLAGS.CONTEST_ACTIVE;
  const hero = `<section class="contest-hero">
  ${RIDGES}
  <div class="wrap contest-hero-grid">
    <div class="contest-copy">
      <span class="pill">The Great Driveway Makeover Contest, Reno-Tahoe</span>
      <h1>Your Driveway Called&hellip; <span>and it wants a free spa day!</span></h1>
      ${
        active
          ? `<p class="contest-lede">We&rsquo;re giving the area&rsquo;s hardest-working driveways a power washing spa treatment, and one lucky home wins a free whole-house wash.</p>
      <a class="btn btn-green btn-lg js-enter" href="#enter">Enter Your Home</a>`
          : `<p class="contest-lede">This contest has ended. Thank you for entering!</p>
      <a class="btn btn-green btn-lg" href="/#quote">Get a Free Quote</a>`
      }
    </div>
  </div>
  ${heroArt()}
</section>`;

  if (!active) {
    return `${hero}

<section class="contest-form-section bg-off" id="enter">
  <div class="wrap">
    <div class="quote-card contest-card contest-ended">
      <h2>This contest has ended. Thank you for entering!</h2>
      <p>Still want a cleaner driveway? We&rsquo;re happy to quote it.</p>
      <div class="hero-ctas">
        <a class="btn btn-green btn-lg" href="/#quote">Get a Free Quote</a>
        <a class="btn btn-light btn-lg" href="tel:{{PHONE_HREF}}"><svg aria-hidden="true"><use href="#i-phone"/></svg>Call {{PHONE}}</a>
      </div>
    </div>
  </div>
</section>

${rules()}

${trustRow}`;
  }

  return `${hero}

<section class="contest-steps bg-off" aria-labelledby="how-heading">
  <div class="wrap">
    <h2 class="contest-h2" id="how-heading">How it works</h2>
    <ol class="contest-howto">
      ${STEPS.map((s, i) => `<li><span class="contest-num" aria-hidden="true">${i + 1}</span><p>${s}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>

${drivewayRow()}

<section class="contest-perks" aria-labelledby="perks-heading">
  <div class="wrap">
    <h2 class="contest-h2" id="perks-heading">What you get</h2>
    <ul class="perk-grid">
      ${PERKS.map((p) => `<li class="perk"><span class="perk-icon" aria-hidden="true"><svg><use href="#i-check"/></svg></span><p>${p}</p></li>`).join("\n      ")}
    </ul>
  </div>
</section>

<section class="contest-form-section bg-off" id="enter" aria-labelledby="enter-heading">
  <div class="wrap">
    <div class="quote-card contest-card">
      <h2 id="enter-heading">See if your home qualifies</h2>
      ${entryForm()}
    </div>
  </div>
</section>

${rules()}

${trustRow}

${softCta}`;
}
