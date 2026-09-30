// Static build: renders every page through src/layout.mjs into dist/.
// Run with: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { SITE_URL, FLAGS, HERO_IMAGE, REVIEWS } from "./site.config.js";
import { renderPage, fillTokens, canonicalFor } from "./src/layout.mjs";
import { buildPages, SERVICES, CITIES } from "./src/content/pages.mjs";
import { shot } from "./src/templates/image.mjs";
import { beforeAfter } from "./src/templates/before-after.mjs";

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
const context = process.env.CONTEXT || "local";
const deployUrl = process.env.URL || "";
const isProduction = context === "production" && deployUrl.includes(new URL(SITE_URL).host);
const noindex = !isProduction;

const partials = {
  icons: read("src/partials/icons.html"),
  nav: read("src/partials/nav.html"),
  footer: read("src/partials/footer.html"),
  mobileBar: read("src/partials/mobile-bar.html"),
  lightbox: read("src/partials/lightbox.html"),
  quoteModal: read("src/partials/quote-modal.html"),
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

// Before and after pairs at the top of the gallery's right column.
// TODO: confirm both captions.
const comparisons = [
  beforeAfter({
    beforeName: "building-before",
    afterName: "building-after",
    caption: "Commercial Building Wash",
    alts: {
      before: "Commercial building wall with dark streaks below the light fixture before washing",
      after: "The same building wall after washing, with the staining removed",
    },
  }),
  beforeAfter({
    beforeName: "garage-during",
    afterName: "garage-after",
    // The left photo is mid wash, so it is labelled DURING until a true
    // before photo exists. Switch to "Before" here if one is supplied.
    beforeLabel: "During",
    caption: "Garage Door Wash",
    alts: {
      before: "Garage door partway through a wash, with cleaned and uncleaned panels side by side",
      after: "The same garage door after washing, clean across every panel",
    },
  }),
].join("\n        ");

// Hero photo: srcset at both widths, explicit box, no preload so the
// headline stays the lead paint.
const heroSets = (ext) => HERO_IMAGE.widths.map((w) => `/images/hero/${HERO_IMAGE.name}-${w}.${ext} ${w}w`).join(", ");
const heroSizes = "(max-width: 900px) 100vw, 50vw";
const heroImage = `<picture>
      <source srcset="${heroSets("avif")}" sizes="${heroSizes}" type="image/avif">
      <source srcset="${heroSets("webp")}" sizes="${heroSizes}" type="image/webp">
      <img src="/images/hero/${HERO_IMAGE.name}-${HERO_IMAGE.widths[0]}.jpg" srcset="${heroSets("jpg")}" sizes="${heroSizes}" alt="${HERO_IMAGE.alt}"${HERO_IMAGE.alt ? "" : ' aria-hidden="true"'} width="${HERO_IMAGE.intrinsic.width}" height="${HERO_IMAGE.intrinsic.height}" style="object-position:${HERO_IMAGE.focal}" decoding="async" fetchpriority="low">
    </picture>`;

const tokens = {
  GALLERY_COMPARE: comparisons,
  HERO_IMAGE: heroImage,
  TRUST_RATING:
    REVIEWS.rating && REVIEWS.count
      ? `<span class="trust-item"><span class="g-stars" role="img" aria-label="Google rating, ${REVIEWS.rating} stars"></span>${REVIEWS.rating} from ${REVIEWS.count} ${REVIEWS.label}</span>`
      : "",
  TRUST_WOMAN_OWNED: FLAGS.WOMAN_OWNED_TRUST
    ? '<span class="trust-item"><svg><use href="#i-people"/></svg>Woman-Owned</span>'
    : "",
  FOOTER_SERVICES: footerColumn("Services", liveServices.map((s) => ({ route: "/" + s.slug, label: s.label }))),
  FOOTER_CITIES: footerColumn(
    "Service Area",
    CITIES.map((c) => ({ route: "/" + c.slug, label: c.label })).concat([{ route: "/service-area", label: "All areas" }, { route: "/blog", label: "Blog" }])
  ),
  // Empty slot, revealed only when a certification is actually held.
  WBE_BADGE_SLOT: FLAGS.WBE_CERTIFIED ? '<div class="cert-slot" data-slot="certification-badge"></div>' : "",
  WHY_US_SHOT: shot({
    group: "why-us",
    name: "crew",
    alt: "Our crew and truck on a job in the Truckee Meadows",
    width: 1600,
    height: 700,
  }),
  HOOD_VENT_LINK: FLAGS.HOOD_VENT_ENABLED
    ? '<a class="svc-link" href="/hood-vent-cleaning/">See hood vent cleaning &rarr;</a>'
    : '<a class="svc-link" href="/#quote">Ask about hood vent cleaning &rarr;</a>',
};

for (const page of pages) {
  validateSchema(page);
  const html = renderPage(page, partials, { noindex, buildStamp, tokens });
  write(page.outputPath || (page.route === "/" ? "index.html" : `${page.route.slice(1)}/index.html`), html);
}

// Assets and images ship as-is. Contact tokens are filled in the JS and CSS too.
mkdirSync(join(OUT, "assets"), { recursive: true });
write("assets/site.css", read("assets/site.css"));
write("assets/site.js", fillTokens(read("assets/site.js")));
cpSync("images", join(OUT, "images"), { recursive: true });

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
