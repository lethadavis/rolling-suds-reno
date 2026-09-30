// Page shell: head tags, nav, body, footer. Every page is rendered through here.
import { SITE_URL, CONTACT, BRAND } from "../site.config.js";

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Contact values live in site.config.js. Templates reference them as tokens.
export function fillTokens(html) {
  const map = {
    PHONE: CONTACT.phone,
    PHONE_HREF: CONTACT.phoneHref,
    EMAIL: CONTACT.email,
    STREET: CONTACT.street,
    CITY_STATE_ZIP: `${CONTACT.city}, ${CONTACT.state} ${CONTACT.zip}`,
    MAP_SEARCH_URL: CONTACT.mapSearchUrl.replace(/&/g, "&amp;"),
    MAP_EMBED_URL: CONTACT.mapEmbedUrl.replace(/&/g, "&amp;"),
    REVIEW_URL: CONTACT.reviewUrl,
    CORPORATE_URL: CONTACT.corporateUrl,
  };
  return html.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => (key in map ? map[key] : m));
}

export const canonicalFor = (route) => (route === "/" ? SITE_URL + "/" : SITE_URL + route + "/");

// Visible breadcrumbs, matched by BreadcrumbList schema in schema.mjs.
function breadcrumbHtml(trail) {
  if (!trail?.length) return "";
  const items = trail
    .map((c, i) =>
      i === trail.length - 1
        ? `<span aria-current="page">${esc(c.name)}</span>`
        : `<a href="${esc(c.route)}">${esc(c.name)}</a>`
    )
    .join('<span class="crumb-sep" aria-hidden="true">/</span>');
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><div class="wrap">${items}</div></nav>`;
}

export function renderPage(page, parts, opts) {
  const { noindex, buildStamp } = opts;
  const canonical = canonicalFor(page.route);
  const ogImage = SITE_URL + (page.ogImage || BRAND.ogImage);
  const schema = (page.schema || []).map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`).join("\n");

  return fillTokens(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(CONTACT.name)}">
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="theme-color" content="#0a2233">
<link rel="stylesheet" href="/assets/site.css?v=${buildStamp}">
${page.preloadHero ? `<link rel="preload" as="image" href="${page.preloadHero}" fetchpriority="high">` : ""}
<script src="/assets/site.js?v=${buildStamp}" defer></script>
${schema}
</head>
<body${page.bodyClass ? ` class="${page.bodyClass}"` : ""}>

${parts.icons}
${parts.nav}
${breadcrumbHtml(page.breadcrumbs)}
${page.body}
${parts.footer}
${parts.mobileBar}
${page.needsLightbox ? parts.lightbox : ""}
</body>
</html>
`);
}
