// The Great Driveway Makeover Contest landing page (/driveway).
// Destination for the direct mail postcard: QR code, printed URL and the
// /driveway-makeover, /spa and /makeover redirects in netlify.toml. Not in the nav or
// the sitemap, and noindex.
//
// Entries go to Netlify Forms as "driveway-contest". Netlify reads the form
// from this static HTML at deploy time, so every field the script fills in
// (UTM values, lead source, page URL, timestamp) has to be
// present in the markup below.
//
// Wording must match the postcard. Rules text is the postcard's own.
import { existsSync } from "node:fs";
import { FLAGS, SERVICE_ZIPS, CONTEST } from "../../site.config.js";
import { resolveShot } from "../templates/image.mjs";
import { contactPref } from "../templates/contact-pref.mjs";
import { isProduction } from "../env.mjs";

const STEPS = [
  "Fill out the short form below.",
  "We schedule your free, no-obligation driveway cleaning.",
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

// Promotion details. Bracketed items ([START DATE], [VALUE] and so on) are
// still to be confirmed with Francine and Jesse.
const RULES_DETAIL = [
  "Promotion period: The promotion begins on [START DATE]. Requests for a free driveway cleaning must be submitted by 11:59 p.m. Pacific Time on November 30, 2026. We may extend the promotion. If we do, we will post the new dates on this page before November 30, 2026.",
  "Grand prize: One winner will receive a free whole-house exterior cleaning of the home at the address entered. Approximate retail value: $[VALUE]. The prize must be scheduled and completed by [June 30, 2027], weather permitting. The prize cannot be transferred, exchanged or redeemed for cash.",
  "How the winner is chosen: We will draw one winner at random from all eligible entries, using a random selection tool, within seven days after [December 15, 2026]. We will notify the winner by phone and email using the contact information on the entry form. If the winner does not respond within seven days, is not eligible, or declines the prize, we will draw an alternate winner at random. The odds of winning depend on the number of eligible entries.",
  "Sponsor: [LEGAL ENTITY NAME], doing business as Rolling Suds of Reno-Tahoe, 5635 Riggins Court, Unit 8, Reno, NV 89502. Rolling Suds of Reno-Tahoe is a locally owned franchise of Rolling Suds Power Washing.",
  "Who can enter: Open to Nevada and California residents who are 18 or older and are the legal owner of the home entered. The home must be in one of these ZIP codes: 89402, 89403, 89406, 89408, 89410, 89413, 89423, 89424, 89428, 89429, 89430, 89431, 89433, 89434, 89436, 89439, 89440, 89441, 89442, 89444, 89448, 89449, 89451, 89460, 89501, 89502, 89503, 89506, 89507, 89508, 89509, 89510, 89511, 89512, 89519, 89521, 89523, 89557, 89701, 89702, 89703, 89704, 89705, 89706, 89711, 89712, 96142, 96143, 96145, 96150. Employees of the sponsor and their immediate family and household members are not eligible. Void where prohibited.",
  "Free driveway cleanings and entries: There is no set limit on the number of free driveway cleanings. We schedule them in the order requests are received, as our crew schedule allows. Each completed free driveway cleaning earns one entry into the grand prize drawing. To be entered, the request must be submitted by November 30, 2026, and the cleaning must be completed by [December 15, 2026]. If we cannot complete a cleaning by then, we will let the homeowner know, and that request will not be entered.",
];

const privacyLink = CONTEST.privacyUrl
  ? `<a href="${CONTEST.privacyUrl}">Privacy Policy</a>`
  : `<span class="tbd">Privacy Policy (TODO: no privacy page yet, add CONTEST.privacyUrl)</span>`;

// Hero photo: a background on the right half with its left edge faded into
// the page. Missing photo: a soft placeholder on staging, nothing in production.
export const HERO_PHOTO = "/images/contest/spa-driveway.webp";

// "2026-11-30" -> "Nov 30th"; the badge shows it in capitals.
function deadlineLabel(iso) {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDate();
  const suffix = day % 100 >= 11 && day % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][day % 10] || "th";
  return `${d.toLocaleDateString("en-US", { month: "short" })} ${day}${suffix}`;
}
const DEADLINE = deadlineLabel(CONTEST.deadline);

// Contest badge, drawn in code. Colors match the original badge artwork.
// Decorative: the same offer is in the hero copy.
const BADGE = (() => {
  const navy = "#000e32", aqua = "#00b9d1", green = "#75bd43", fold = "#5aa032";
  const arc = (id, r, top) => top
    ? `<path id="${id}" d="M ${100 - r},100 A ${r},${r} 0 0,1 ${100 + r},100" fill="none"/>`
    : `<path id="${id}" d="M ${100 - r},100 A ${r},${r} 0 0,0 ${100 + r},100" fill="none"/>`;
  const ringText = (id, text) => `<text class="badge-arc"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${text}</textPath></text>`;
  return `<svg class="contest-badge" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>${arc("badgeTop", 79, true)}${arc("badgeBottom", 90, false)}</defs>
      <circle cx="100" cy="100" r="98" fill="${aqua}"/>
      <circle cx="100" cy="100" r="71" fill="${navy}" stroke="#fff" stroke-width="3"/>
      <circle cx="100" cy="100" r="66" fill="none" stroke="${green}" stroke-width="1.6" stroke-dasharray="1.5 4.5" stroke-linecap="round"/>
      ${ringText("badgeTop", "ROLLING SUDS")}
      ${ringText("badgeBottom", "RENO-TAHOE")}
      <text class="badge-free" x="100" y="91.6" text-anchor="middle">FREE</text>
      <text class="badge-sub" x="100" y="103.6" text-anchor="middle">Driveway</text>
      <text class="badge-sub" x="100" y="117.9" text-anchor="middle">Cleaning</text>
      <path d="M 8,128 L 24,124 L 24,150 L 8,146 Z M 192,128 L 176,124 L 176,150 L 192,146 Z" fill="${fold}"/>
      <rect x="22" y="124" width="156" height="26" rx="2" fill="${green}"/>
      <text class="badge-ribbon" x="100" y="141.5" text-anchor="middle">+ WIN A HOUSE WASH</text>
    </svg>`;
})();

function heroArt() {
  const webp = resolveShot("contest", "spa-driveway");
  const jpg = ["jpg", "jpeg", "png"].map((e) => `images/contest/spa-driveway.${e}`).find((f) => existsSync(f));
  const badge = BADGE;
  let photo = "";
  if (webp || jpg) {
    photo = `<picture class="contest-photo">
        ${webp && webp.endsWith(".webp") ? `<source srcset="${webp}" type="image/webp">` : ""}
        <img src="/${jpg || webp.slice(1)}" alt="A driveway in a towel and cucumber slices enjoying a spa day" width="1376" height="768" decoding="async" fetchpriority="high">
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

// Driveway glow-ups row: six real Rolling Suds before and after jobs first,
// then the driveway Short from the homepage gallery, then the two on the job
// shots. Every tile opens in one dialog on this page (see site.js). The
// before and after images carry their own BEFORE / AFTER labels, so they get
// no pill. On phones the row shows four tiles and a "see more" button.
const DRIVEWAY_BEFORE_AFTER = [
  { name: "two-car-driveway", alt: "Before and after: a two-car garage driveway washed from grey and blotchy to clean, bright concrete" },
  { name: "two-story-driveway", alt: "Before and after: rust and dirt streaks cleaned off the driveway of a two-story home" },
  { name: "carport-driveway", alt: "Before and after: a stained concrete driveway and carport washed clean" },
  { name: "front-walkway", alt: "Before and after: orange rust stains removed from a front walkway" },
  { name: "leafy-driveway", alt: "Before and after: a debris-covered concrete driveway cleared and washed bright" },
  { name: "driveway-apron", alt: "Before and after: dark stains cleaned from a driveway apron by the street" },
];
const DRIVEWAY_VIDEO = { youtubeId: "ooFJGDmO_xA", title: "You Forgot What Color Your Driveway Actually Is" };
const DRIVEWAY_TILES = [
  { src: "images/gallery/crew-driveway-cleaning.webp", label: "On the job", alt: "Technician surface cleaning a driveway beside the Rolling Suds truck" },
  { src: "images/gallery/truck-driveway-cleaning.webp", label: "On the job", alt: "Rolling Suds truck parked at a home while a technician cleans the driveway" },
];
const PHONE_SHOWN = 4;

function drivewayRow() {
  const photo = ({ full, thumb, alt, label }) => `<button type="button" class="drive-tile drive-photo" data-full="/${full}" data-alt="${alt}" aria-label="View larger photo: ${alt}">
        <img src="/${thumb}" alt="" width="760" height="760" loading="lazy" decoding="async">
        ${label ? `<span class="compare-label">${label}</span>` : ""}
      </button>`;
  const v = DRIVEWAY_VIDEO;
  const video = `<button type="button" class="drive-tile drive-video" data-yt="${v.youtubeId}" aria-label="Play video: ${v.title}">
        <img src="https://i.ytimg.com/vi/${v.youtubeId}/oar2.jpg" alt="" width="1080" height="1920" loading="lazy" decoding="async">
        <span class="compare-label">Video</span>
        <span class="g-play" aria-hidden="true"></span>
      </button>`;
  const dialog = `<dialog class="drive-dialog" id="driveVideo" aria-label="Driveway photo or video">
    <button type="button" class="drive-dialog-close" aria-label="Close">&times;</button>
    <div class="drive-dialog-frame"></div>
    <a class="drive-dialog-yt" href="https://www.youtube.com/shorts/${v.youtubeId}" target="_blank" rel="noopener">Watch on YouTube</a>
  </dialog>`;

  const dir = "images/gallery/driveways";
  const items = [
    ...DRIVEWAY_BEFORE_AFTER.filter((b) => existsSync(`${dir}/${b.name}-760.webp`)).map((b) =>
      photo({ full: `${dir}/${b.name}.webp`, thumb: `${dir}/${b.name}-760.webp`, alt: b.alt })
    ),
    video,
    ...DRIVEWAY_TILES.filter((t) => existsSync(t.src)).map((t) => photo({ full: t.src, thumb: t.src, alt: t.alt, label: t.label })),
  ];
  if (items.length < 2) return "";
  const more = items.length > PHONE_SHOWN;

  return `<section class="contest-drives" aria-labelledby="drives-heading">
  <div class="wrap">
    <h2 class="contest-h2" id="drives-heading">Driveway glow-ups</h2>
    <div class="drive-grid${more ? " is-collapsible" : ""}" id="driveGrid">
      ${items.join("\n      ")}
    </div>
    ${more ? `<button type="button" class="btn btn-light drive-more" aria-controls="driveGrid" aria-expanded="false">See all ${items.length} driveways</button>` : ""}
  </div>
  ${dialog}
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

          <div class="field full">
            <label for="c-notes">Anything we should know?</label>
            <textarea id="c-notes" name="notes" rows="3"></textarea>
          </div>
        </div>

        ${contactPref("c", { single: true })}

        <button class="btn btn-green btn-lg" type="submit">Book My Free Cleaning</button>
        <p class="form-msg" id="contestMsg" role="alert"></p>
        <p class="consent">By submitting, you agree to be contacted by Rolling Suds Reno-Tahoe about your free cleaning and the giveaway by phone, text or email. Message and data rates may apply. Reply STOP to opt out. ${privacyLink} &middot; <a href="#rules" class="js-rules">Official Rules</a></p>
      </form>
      <div class="contest-success" id="contestSuccess" tabindex="-1" hidden>
        <span class="success-icon" aria-hidden="true"><svg><use href="#i-check"/></svg></span>
        <h2>You&rsquo;re on the list!</h2>
        <p>We&rsquo;ll be in touch within 2 business days to schedule your free driveway cleaning. Once your cleaning is done, you&rsquo;re automatically entered to win a free whole-house exterior pressure washing.</p>
        <p class="form-foot">Questions in the meantime? Call <a href="tel:{{PHONE_HREF}}">{{PHONE}}</a></p>
      </div>`;
}

function rules() {
  return `<section class="contest-rules" id="official-rules" aria-labelledby="rules-heading">
  <div class="wrap">
    <details id="rules" class="rules-box">
      <summary><h2 id="rules-heading">Official Rules</h2></summary>
      <ul>
        ${RULES.map((r) => `<li>${r}</li>`).join("\n        ")}
        ${RULES_DETAIL.map((r) => `<li>${r}</li>`).join("\n        ")}
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
      ${
        active
          ? `<span class="pill">Free Driveway Cleaning, Reno&#8209;Tahoe</span>
      <h1>Give your driveway a spa day on us. <span class="h1-sub">Get a free, no-obligation driveway cleaning and you&rsquo;re automatically entered to win a whole&#8209;house exterior pressure washing.</span></h1>
      <a class="btn btn-green btn-lg js-enter" href="#enter">Book Your Free Cleaning Now</a>
      <p class="hero-deadline">Offer ends ${DEADLINE}</p>
      <p class="hero-fine">No purchase necessary. Reno-Tahoe service area. See <a href="#official-rules" class="js-rules">official rules</a>.</p>`
          : `<span class="pill">The Great Driveway Makeover Contest, Reno-Tahoe</span>
      <h1>Your Driveway Called&hellip; <span>and it wants a free spa day!</span></h1>
      <p class="contest-lede">This contest has ended. Thank you for entering!</p>
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

<section class="contest-perks" aria-labelledby="perks-heading">
  <div class="wrap">
    <h2 class="contest-h2" id="perks-heading">What you get</h2>
    <ul class="perk-grid">
      ${PERKS.map((p) => `<li class="perk"><span class="perk-icon" aria-hidden="true"><svg><use href="#i-check"/></svg></span><p>${p}</p></li>`).join("\n      ")}
    </ul>
  </div>
</section>

${drivewayRow()}

<section class="contest-steps bg-off" aria-labelledby="how-heading">
  <div class="wrap">
    <h2 class="contest-h2" id="how-heading">How it works</h2>
    <ol class="contest-howto">
      ${STEPS.map((s, i) => `<li><span class="contest-num" aria-hidden="true">${i + 1}</span><p>${s}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>

<section class="contest-form-section bg-off" id="enter" aria-labelledby="enter-heading">
  <div class="wrap">
    <div class="quote-card contest-card">
      <h2 id="enter-heading">Book your free driveway cleaning</h2>
      <p>Takes a minute. We&rsquo;ll reach out to schedule.</p>
      ${entryForm()}
    </div>
  </div>
</section>

${rules()}

${trustRow}

${softCta}`;
}
