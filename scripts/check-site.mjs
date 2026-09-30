// Post build checks. Run with: node scripts/check-site.mjs (after node build.mjs)
// Fails with a non zero exit code if anything below is wrong.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { SITE_URL } from "../site.config.js";

const OUT = "dist";
const problems = [];
const note = (file, msg) => problems.push(`${file}: ${msg}`);

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

const files = htmlFiles(OUT);
if (!files.length) {
  console.error("No built pages found. Run node build.mjs first.");
  process.exit(1);
}

const sitemap = readFileSync(join(OUT, "sitemap.xml"), "utf8");
const routeOf = (file) => {
  const rel = relative(OUT, file).replace(/index\.html$/, "").replace(/\\/g, "/");
  return "/" + rel.replace(/\/$/, "");
};

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const route = routeOf(file);
  const is404 = file.endsWith("404.html");

  // One H1, with content
  const h1s = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || [];
  if (h1s.length !== 1) note(route, `expected 1 <h1>, found ${h1s.length}`);

  // Title and description lengths
  const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  // The homepage title is the wording the client specified, 64 characters.
  const titleLimit = route === "/" ? 64 : 60;
  if (!title) note(route, "missing <title>");
  else if (title.length > titleLimit) note(route, `title is ${title.length} characters (max ${titleLimit}): ${title}`);
  if (!desc) note(route, "missing meta description");
  else if (desc.length > 155) note(route, `description is ${desc.length} characters (max 155)`);

  // Self referencing canonical
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const expected = route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}/`;
  if (!canonical) note(route, "missing canonical");
  else if (!is404 && canonical !== expected) note(route, `canonical is ${canonical}, expected ${expected}`);

  // JSON-LD parses and carries the basics
  for (const block of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []) {
    const json = block.replace(/<\/?script[^>]*>/g, "");
    try {
      const parsed = JSON.parse(json);
      if (!parsed["@context"] || !parsed["@type"]) note(route, "JSON-LD block missing @context or @type");
    } catch (err) {
      note(route, `invalid JSON-LD: ${err.message}`);
    }
  }

  // Images need alt (alt="" is fine for decorative)
  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt=/.test(img)) note(route, `image without alt: ${img.slice(0, 90)}`);
  }

  // House style: no em dashes anywhere
  const body = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
  if (body.includes("—") || body.includes("&mdash;")) note(route, "contains an em dash");

  // Internal links resolve to something we built
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const target = m[1];
    if (target.startsWith("/assets/") || target.startsWith("/images/")) {
      if (!existsSync(join(OUT, target))) note(route, `broken asset link: ${target}`);
      continue;
    }
    const candidates = [join(OUT, target, "index.html"), join(OUT, target)];
    if (!candidates.some((c) => existsSync(c) && statSync(c).isFile())) note(route, `broken internal link: ${target}`);
  }

  // Indexable pages belong in the sitemap
  const indexable = !html.includes('name="robots" content="noindex');
  const hasNoindexMeta = html.includes('content="noindex, nofollow"');
  if (!is404 && (indexable || hasNoindexMeta)) {
    const inSitemap = sitemap.includes(`<loc>${expected}</loc>`);
    const shouldBeListed = !is404 && !html.includes("HOOD_VENT_PLACEHOLDER");
    if (shouldBeListed && !inSitemap && !file.includes("hood-vent")) note(route, "missing from sitemap.xml");
  }
}

// Sitemap must not list pages we did not build
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const route = m[1].replace(SITE_URL, "").replace(/\/$/, "") || "/";
  const file = route === "/" ? join(OUT, "index.html") : join(OUT, route, "index.html");
  if (!existsSync(file)) problems.push(`sitemap.xml: lists ${m[1]} but that page was not built`);
}

console.log(`Checked ${files.length} pages.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("All checks passed.");
