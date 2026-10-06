// Static build: renders every page through src/layout.mjs into dist/.
// Run with: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { SITE_URL, FLAGS, HERO_IMAGE } from "./site.config.js";
import { renderPage, fillTokens, canonicalFor, networkRating } from "./src/layout.mjs";
import { context, isProduction } from "./src/env.mjs";
import { buildPages, SERVICES, CITIES } from "./src/content/pages.mjs";
import { shot, resolveShot } from "./src/templates/image.mjs";
import { beforeAfter, pairIsComplete } from "./src/templates/before-after.mjs";
import { COMPARISONS, FEATURED_VIDEO } from "./src/content/gallery.mjs";
import { contactPref, contactPrefHidden } from "./src/templates/contact-pref.mjs";
import * as offer from "./src/templates/offer.mjs";

const OUT = "dist";
// Assets are cached for a week, so the query string has to change whenever
// their contents change, not merely when the date does.
const hash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8);
const buildStamp = hash("assets/site.css") + hash("assets/site.js");

/* ---------- Production detection ----------
   Netlify sets CONTEXT and URL. Production means the production context of the
   site whose primary URL is SITE_URL. Everything else (netlify.app, deploy
   previews, branch deploys, localhost) is treated as staging: those pages get
   a noindex meta tag, and dist/_headers adds X-Robots-Tag: noindex.          */
const noindex = !isProduction;

const partials = {
  icons: read("src/partials/icons.html"),
  nav: read("src/partials/nav.html"),
  footer: read("src/partials/footer.html"),
  mobileBar: read("src/partials/mobile-bar.html"),
  lightbox: read("src/partials/lightbox.html"),
};

function read(p) {
  return readFileSync(p, "utf8").trimEnd();
}

function write(rel, contents) {
  const path = join(OUT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

// Real lastmod dates: the last commit that touched a page's source file.
function lastModified(sourceFile) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", sourceFile], { encoding: "utf8" }).trim();
    if (out) return out;
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

/* ---------- JSON-LD validation: bad JSON or missing fields fail the build ---------- */
function validateSchema(page) {
  for (const block of page.schema || []) {
    let parsed;
    try {
      parsed = JSON.parse(JSON.stringify(block));
    } catch (err) {
      throw new Error(`${page.route}: JSON-LD is not serialisable: ${err.message}`);
    }
    if (!parsed["@context"] || !parsed["@type"]) {
      throw new Error(`${page.route}: JSON-LD block is missing @context or @type`);
    }
    if (parsed["@type"] === "FAQPage" && !(parsed.mainEntity || []).length) {
      throw new Error(`${page.route}: FAQPage schema has no questions`);
    }
    if (parsed["@type"] === "BreadcrumbList" && !(parsed.itemListElement || []).length) {
      throw new Error(`${page.route}: BreadcrumbList schema has no items`);
    }
  }
}

/* ---------- Build ---------- */
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
const pages = buildPages({ flags: FLAGS });

// Footer link columns are generated so a flagged off page never gets linked.
const footerColumn = (heading, links) =>
  `      <div>\n        <h3>${heading}</h3>\n        <ul>\n` +
  links.map((l) => `          <li><a href="${l.route}/">${l.label}</a></li>`).join("\n") +
  `\n        </ul>\n      </div>`;

const liveServices = SERVICES.filter((s) => !s.flag || FLAGS[s.flag]);

// Hero background: the Reno skyline, decorative, behind a pale veil. Phones get
// a 4:5 crop around downtown so the skyline stays readable.
const heroSet = (name, widths, ext) => widths.map((w) => `/images/hero/${name}-${w}.${ext} ${w}w`).join(", ");
const PHONE = "(max-width: 640px)";
const heroSources = (name, widths, media) =>
  [["avif", "image/avif"], ["webp", "image/webp"], ["jpg", "image/jpeg"]]
    .map(([ext, type]) => `<source${media ? ` media="${media}"` : ""} srcset="${heroSet(name, widths, ext)}" sizes="100vw" type="${type}">`)
    .join("\n        ");
const heroMedia = `<div class="hero-media" aria-hidden="true">
      <picture class="hero-poster">
        ${heroSources(HERO_IMAGE.mobile.name, HERO_IMAGE.mobile.widths, PHONE)}
        ${heroSources(HERO_IMAGE.name, HERO_IMAGE.widths)}
        <img src="/images/hero/${HERO_IMAGE.name}-1600.jpg" alt="" width="${HERO_IMAGE.intrinsic.width}" height="${HERO_IMAGE.intrinsic.height}" style="object-position:${HERO_IMAGE.focal}" decoding="async" fetchpriority="low">
      </picture>
    </div>`;
// Preloaded at high priority on tablets and desktops, where it is the largest
// paint. Phones skip the preload: there the photo covers the whole viewport,
// so Chrome does not count it for LCP (the headline is), and fetching it early
// held the headline back by about 0.8s in Lighthouse mobile runs. The <img>
// itself stays low priority for the same reason; desktops get the image early
// through the preload regardless.
const heroPreload = `<link rel="preload" as="image" media="(min-width: 641px)" imagesrcset="${heroSet(HERO_IMAGE.name, HERO_IMAGE.widths, "avif")}" imagesizes="100vw" type="image/avif" fetchpriority="high">`;

// Gallery top row: the featured video beside whatever pairs have both photos.
const livePairs = COMPARISONS.filter(pairIsComplete);
const featuredCard = `<div class="g-feature" role="button" tabindex="0" data-yt="${FEATURED_VIDEO.youtubeId}" aria-label="Play video: ${FEATURED_VIDEO.title}">
        <img src="https://i.ytimg.com/vi/${FEATURED_VIDEO.youtubeId}/maxresdefault.jpg" alt="" aria-hidden="true" width="1280" height="720" loading="lazy" decoding="async">
        <span class="g-play" aria-hidden="true"></span>
        <span class="g-feature-cap">${FEATURED_VIDEO.title}</span>
      </div>`;
const galleryTop = `<div class="gallery-top${livePairs.length ? "" : " no-pairs"}">
      ${featuredCard}
      ${livePairs.length ? `<div class="gallery-pairs">\n        ${livePairs.map((p) => beforeAfter(p)).join("\n        ")}\n      </div>` : ""}
    </div>`;

const tokens = {
  HERO_PRELOAD: heroPreload,
  CONTACT_PREF_HIDDEN: contactPrefHidden,
  CONTACT_PREF_QUOTE: contactPref("q"),
  GALLERY_TOP: galleryTop,
  HERO_MEDIA: heroMedia,
  WILDFIRE_EYEBROW: offer.heroEyebrow,
  WILDFIRE_CTA_HREF: offer.offerHref,
  WILDFIRE_CTA_OFFER: offer.offerOn ? ` data-offer="${offer.offerCode}"` : "",
  WILDFIRE_TERMS: offer.heroTerms,
  WILDFIRE_FORM_ATTR: offer.formAttr,
  WILDFIRE_APPLIED: offer.appliedLine,
  TRUST_RATING: networkRating("trust"),
  TRUST_WOMAN_OWNED: FLAGS.WOMAN_OWNED_TRUST
    ? '<span class="trust-item"><svg><use href="#i-people"/></svg>Woman-Owned</span>'
    : "",
  FOOTER_SERVICES: footerColumn("Services", liveServices.map((s) => ({ route: "/" + s.slug, label: s.label }))),
  FOOTER_CITIES: footerColumn(
    "Service Area",
    CITIES.map((c) => ({ route: "/" + c.slug, label: c.label })).concat([{ route: "/service-area", label: "All areas" }, { route: "/blog", label: "Blog" }])
  ),
  // Off by default: the contest page is reached by the postcard, not the site.
  FOOTER_CONTEST_LINK:
    FLAGS.CONTEST_PROMO_LINK && FLAGS.CONTEST_ACTIVE ? '          <li><a href="/driveway/">Driveway Makeover Contest</a></li>' : "",
  // Empty slot, revealed only when a certification is actually held.
  WBE_BADGE_SLOT: FLAGS.WBE_CERTIFIED ? '<div class="cert-slot" data-slot="certification-badge"></div>' : "",
  // The crew photo slot appears only when a real file exists. No empty block.
  WHY_GRID_CLASS: resolveShot("why-us", "crew") ? "why-grid has-photo" : "why-grid",
  WHY_US_PHOTO: resolveShot("why-us", "crew")
    ? shot({ group: "why-us", name: "crew", alt: "Our crew washing a property in the Truckee Meadows", width: 900, height: 1100 })
    : "",
};

/* ---------- No widows ----------
   Joins the last two words of every paragraph, heading, list item, caption,
   quote and summary with a non-breaking space, so no line of text ends with
   one word on its own, in any browser, at any width. Inline closing tags
   (a, span, strong, em) between the words and the block end are allowed.
   Pairs longer than 26 characters are left alone so narrow screens can wrap. */
const WIDOW = /([^\s<>]+) ([^\s<>]+)((?:<\/(?:a|span|strong|em|b)>)*\s*<\/(?:p|h[1-4]|li|figcaption|blockquote|summary|legend)>)/g;
function noWidows(html) {
  return html
    .split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/)
    .map((part, i) =>
      i % 2 ? part : part.replace(WIDOW, (m, a, b, end) => (a.length + b.length > 26 ? m : `${a}&nbsp;${b}${end}`))
    )
    .join("");
}

for (const page of pages) {
  validateSchema(page);
  const html = noWidows(renderPage(page, partials, { noindex, buildStamp, tokens }));
  write(page.outputPath || (page.route === "/" ? "index.html" : `${page.route.slice(1)}/index.html`), html);
}

// Assets and images ship as-is. Contact tokens are filled in the JS and CSS too.
mkdirSync(join(OUT, "assets"), { recursive: true });
write("assets/site.css", read("assets/site.css"));
write("assets/site.js", fillTokens(read("assets/site.js")));
cpSync("images", join(OUT, "images"), { recursive: true });
if (existsSync("video")) cpSync("video", join(OUT, "video"), { recursive: true });

// robots.txt
write(
  "robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);

// sitemap.xml: indexable pages only, with real lastmod dates
const sitemapPages = pages.filter((p) => !p.excludeFromSitemap);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapPages
      .map(
        (p) =>
          `  <url>\n    <loc>${canonicalFor(p.route)}</loc>\n    <lastmod>${lastModified(p.sourceFile || "index.html")}</lastmod>\n  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`
);

// Staging only: belt and braces alongside the noindex meta tag.
if (noindex) {
  write("_headers", "/*\n  X-Robots-Tag: noindex, nofollow\n");
}

console.log(
  `Built ${pages.length} pages into ${OUT}/ (${sitemapPages.length} in sitemap). ` +
    `context=${context} production=${isProduction} noindex=${noindex}`
);
