// Every route on the site. build.mjs renders whatever this returns.
import { readFileSync } from "node:fs";
import { SERVICES } from "./services.mjs";
import { CITIES } from "./cities.mjs";
import { POSTS } from "./blog.mjs";
import { localBusiness, serviceSchema, faqSchema, breadcrumbSchema, BUSINESS_ID } from "../schema.mjs";
import { SITE_URL } from "../../site.config.js";
import { contentPage, pageHero, sections, faqBlock, linkCloud, ctaBand, sideCard } from "../templates/page.mjs";
import { shot, resolveShot } from "../templates/image.mjs";
import { contestBody } from "./contest.mjs";

const read = (p) => readFileSync(p, "utf8").trimEnd();
const HOME_CRUMB = { name: "Home", route: "/" };

// Put the photo after the opening section rather than above it.
function withShot(figure, body) {
  const marker = body.indexOf("<h2>", body.indexOf("<h2>") + 1);
  return marker === -1 ? body + "\n\n      " + figure : body.slice(0, marker) + figure + "\n\n      " + body.slice(marker);
}

export function buildPages({ flags }) {
  const liveServices = SERVICES.filter((s) => !s.flag || flags[s.flag]);
  const serviceBySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
  const cityLinks = CITIES.map((c) => ({ route: "/" + c.slug, label: c.label }));
  const pages = [];

  /* ---------- Homepage ---------- */
  pages.push({
    route: "/",
    sourceFile: "src/pages/home.html",
    title: "Pressure Washing in Reno NV | Rolling Suds Reno-Tahoe",
    description:
      "Commercial and residential pressure washing in Reno, Sparks, Carson City and Lake Tahoe: houses, roofs, concrete, fleets. Get a free quote today.",
    body: read("src/pages/home.html"),
    needsLightbox: true,
    schema: [localBusiness()],
  });

  /* ---------- Service pages ---------- */
  for (const s of SERVICES) {
    const hidden = Boolean(s.flag && !flags[s.flag]);
    const related = (s.related || [])
      .map((slug) => serviceBySlug[slug])
      .filter((r) => r && (!r.flag || flags[r.flag]))
      .map((r) => ({ route: "/" + r.slug, label: r.label }));

    pages.push({
      route: "/" + s.slug,
      sourceFile: "src/content/services.mjs",
      title: s.title,
      description: s.description,
      excludeFromSitemap: hidden,
      hidden,
      breadcrumbs: [HOME_CRUMB, { name: s.label, route: "/" + s.slug }],
      body: contentPage({
        hero: { eyebrow: s.eyebrow, h1: s.h1, lede: s.lede },
        body: withShot(
          shot({ group: "services", name: s.slug, alt: s.shotAlt, width: 1200, height: 800 }),
          (s.offer
          ? `<div class="offer-box">
        <span class="offer-tag">${s.offer.tag}</span>
        <p>${s.offer.text}</p>
        <span class="offer-deal">${s.offer.deal}</span>
        <span class="offer-until">${s.offer.until}</span>
      </div>\n\n      `
          : "") + sections(s.sections)
        ),
        aside: {
          heading: "Free quote, same business day",
          text: "Tell us about the property and we will come back to you with a no obligation estimate.",
          links: related,
          linksHeading: "Related services",
        },
        faqs: s.faqs,
        cloudHeading: "Where we work",
        cloudLinks: cityLinks,
        cta: {
          heading: "Ready for a cleaner property?",
          text: "Free quotes, flexible scheduling and a 100% satisfaction guarantee.",
        },
      }),
      schema: [
        serviceSchema({ name: s.label, description: s.description, route: "/" + s.slug, serviceType: s.keyword }),
        faqSchema(s.faqs, "/" + s.slug),
        breadcrumbSchema([HOME_CRUMB, { name: s.label, route: "/" + s.slug }]),
      ],
    });
  }

  /* ---------- City pages ---------- */
  for (const c of CITIES) {
    const crumbs = [HOME_CRUMB, { name: "Service Area", route: "/service-area" }, { name: c.label, route: "/" + c.slug }];
    const serviceLinks = (c.services || [])
      .map((slug) => serviceBySlug[slug])
      .filter((s) => s && (!s.flag || flags[s.flag]))
      .map((s) => ({ route: "/" + s.slug, label: s.label }));

    pages.push({
      route: "/" + c.slug,
      sourceFile: "src/content/cities.mjs",
      title: c.title,
      description: c.description,
      breadcrumbs: crumbs,
      body: contentPage({
        hero: { eyebrow: c.eyebrow, h1: c.h1, lede: c.lede },
        body: withShot(shot({ group: "cities", name: c.slug, alt: c.shotAlt, width: 1200, height: 800 }), sections(c.sections)),
        aside: {
          heading: `Quotes for ${c.label} properties`,
          text: "Send us the address and what needs cleaning. We will reply the same business day.",
          links: serviceLinks,
          linksHeading: "Popular services here",
        },
        faqs: c.faqs,
        cloudHeading: "Other areas we serve",
        cloudLinks: cityLinks.filter((l) => l.route !== "/" + c.slug).concat([{ route: "/service-area", label: "Full service area" }]),
        cta: {
          heading: `Book a wash in ${c.label}`,
          text: "Free quotes, flexible scheduling and a 100% satisfaction guarantee.",
        },
      }),
      schema: [faqSchema(c.faqs, "/" + c.slug), breadcrumbSchema(crumbs)],
    });
  }

  /* ---------- Service area overview ---------- */
  const areaCrumbs = [HOME_CRUMB, { name: "Service Area", route: "/service-area" }];
  pages.push({
    route: "/service-area",
    sourceFile: "src/content/pages.mjs",
    title: "Service Area | Pressure Washing in Reno, Sparks & Tahoe",
    description:
      "Where Rolling Suds of Reno-Tahoe works: Reno, Sparks, Carson City, Lake Tahoe and the counties around them. Find your area and request a free quote.",
    breadcrumbs: areaCrumbs,
    body: contentPage({
      hero: {
        eyebrow: "Service Area",
        h1: "Where we work across northern Nevada and Tahoe",
        lede:
          "Our crews run from our shop in south Reno out through the Truckee Meadows, south to Carson City and the Douglas County valleys, east along the industrial corridor and up into the Tahoe basin.",
      },
      body: `<h2>Cities and towns</h2>
      <p>Pick the area closest to you for local detail on the neighborhoods, building types and services we are asked for most.</p>
      <ul>${CITIES.map((c) => `<li><a href="/${c.slug}/">Pressure washing in ${c.label}</a>: ${c.lede}</li>`).join("")}</ul>

      <h2>Counties we cover</h2>
      <p>We serve Washoe County, Carson City, Douglas County, Lyon County, Storey County and Churchill County, plus the California shore of Lake Tahoe. If you are on the edge of that map, call and ask. Travel time is the only real limit.</p>

      <h2>Communities inside the service area</h2>
      <p>Alongside the main cities we regularly work in Spanish Springs, Sun Valley, Verdi, Washoe Valley, Incline Village, Crystal Bay, Fernley, Dayton, Minden, Gardnerville and the Tahoe Reno Industrial Center.</p>

      <h2>What we bring to every job</h2>
      <p>Each truck carries its own water supply, multiple wash units and a full set of detergents, so we are not dependent on site water or power. That matters for properties with the spigot shut off in winter, for industrial yards without a hose bib, and for lake properties where the supply is seasonal.</p>`,
      aside: {
        heading: "Not sure if you are in range?",
        text: "Send the address with your quote request and we will confirm scheduling for your area.",
        links: CITIES.map((c) => ({ route: "/" + c.slug, label: c.label })),
        linksHeading: "City pages",
      },
      faqs: [
        {
          q: "How far do you travel from Reno?",
          a: "We work throughout the Truckee Meadows, south to Carson City and the Douglas County valleys, east to Fernley and the industrial corridor, and up into the Tahoe basin on both the Nevada and California sides.",
        },
        {
          q: "Do you charge a travel fee for outlying areas?",
          a: "Travel is factored into the quote rather than billed separately, so the price you approve is the price for the job.",
        },
        {
          q: "Can you serve seasonal properties at the lake?",
          a: "Yes, once roads and driveways are clear. Tahoe work runs roughly late spring through fall.",
        },
      ],
      cloudHeading: "Browse services",
      cloudLinks: liveServices.map((s) => ({ route: "/" + s.slug, label: s.label })),
      cta: { heading: "Tell us where the property is", text: "Free quotes, flexible scheduling and a 100% satisfaction guarantee." },
    }),
    schema: [breadcrumbSchema(areaCrumbs)],
  });

  /* ---------- Blog ---------- */
  const blogCrumbs = [HOME_CRUMB, { name: "Blog", route: "/blog" }];
  pages.push({
    route: "/blog",
    sourceFile: "src/content/blog.mjs",
    title: "Blog | Pressure Washing Advice for Reno & Tahoe",
    description:
      "Practical exterior cleaning advice for northern Nevada property owners, from our crews in Reno. Read the latest and request a free quote.",
    breadcrumbs: blogCrumbs,
    body: `${pageHero({
      eyebrow: "Blog",
      h1: "Exterior cleaning advice for northern Nevada",
      lede: "Notes from our crews on what the high desert and the Tahoe basin do to buildings, and what actually helps.",
    })}

<section class="page-body">
  <div class="wrap">
    <div class="svc-grid">
      ${POSTS.map(
        (post) => `<article class="svc">
        <h3>${post.h1}</h3>
        <p>${post.lede}</p>
        <a class="svc-link" href="/blog/${post.slug}/">Read ${post.eyebrow.toLowerCase()} guide &rarr;</a>
      </article>`
      ).join("\n      ")}
    </div>
  </div>
</section>

${ctaBand({ heading: "Questions about your property?", text: "Send us the details and we will give you a straight answer and a free quote." })}`,
    schema: [breadcrumbSchema(blogCrumbs)],
  });

  POSTS.forEach((post, i) => {
    const route = "/blog/" + post.slug;
    const crumbs = [HOME_CRUMB, { name: "Blog", route: "/blog" }, { name: post.h1, route }];
    const prev = POSTS[i - 1];
    const next = POSTS[i + 1];
    const relatedLinks = post.related
      .map((slug) => serviceBySlug[slug])
      .filter((s) => s && (!s.flag || flags[s.flag]))
      .map((s) => ({ route: "/" + s.slug, label: s.label }));
    const cityPage = CITIES.find((c) => c.slug === post.city);

    const nav = prev || next
      ? `<nav class="post-nav" aria-label="More posts">
        ${prev ? `<a href="/blog/${prev.slug}/"><span>Previous</span>${prev.h1}</a>` : "<span></span>"}
        ${next ? `<a href="/blog/${next.slug}/"><span>Next</span>${next.h1}</a>` : "<span></span>"}
      </nav>`
      : "";

    pages.push({
      route,
      sourceFile: "src/content/blog.mjs",
      title: post.title,
      description: post.description,
      breadcrumbs: crumbs,
      body: contentPage({
        hero: { eyebrow: post.eyebrow, h1: post.h1, lede: post.lede },
        body:
          shot({ group: "blog", name: post.slug, alt: post.shotAlt, width: 1200, height: 675, lazy: false }) +
          "\n\n      " +
          sections(post.sections) +
          "\n\n      " +
          nav,
        aside: {
          heading: "Want this handled for you?",
          text: "Send the address and what needs cleaning. We will reply the same business day with a free quote.",
          links: relatedLinks.concat(cityPage ? [{ route: "/" + cityPage.slug, label: `Pressure washing in ${cityPage.label}` }] : []),
          linksHeading: "Related pages",
        },
        faqs: post.faqs,
        cloudHeading: "More from the blog",
        cloudLinks: POSTS.filter((o) => o.slug !== post.slug).map((o) => ({ route: "/blog/" + o.slug, label: o.h1 })),
        cta: { heading: "Get your free quote", text: "No obligation, and most estimates go out the same business day." },
      }),
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${SITE_URL}${route}/#post`,
          headline: post.h1,
          description: post.description,
          url: `${SITE_URL}${route}/`,
          datePublished: post.published,
          dateModified: post.published,
          image: SITE_URL + (resolveShot("blog", post.slug) || "/images/og-default.png"),
          author: { "@id": BUSINESS_ID },
          publisher: { "@id": BUSINESS_ID },
          mainEntityOfPage: `${SITE_URL}${route}/`,
        },
        faqSchema(post.faqs, route),
        breadcrumbSchema(crumbs),
      ],
    });
  });

  /* ---------- Driveway Makeover Contest (postcard landing page) ---------- */
  // noindex, follow on every deploy, kept out of the sitemap and the nav, and
  // no schema: no LocalBusiness changes and no review markup on this page.
  pages.push({
    route: "/driveway-makeover",
    sourceFile: "src/content/contest.mjs",
    title: "Great Driveway Makeover Contest | Rolling Suds Reno-Tahoe",
    description:
      "Enter your home for a free driveway cleaning and a chance to win a free house wash from Rolling Suds Reno-Tahoe.",
    robots: "noindex, follow",
    excludeFromSitemap: true,
    bodyClass: "contest-page",
    ogImage: resolveShot("contest", "og-contest") || undefined,
    body: contestBody(),
    schema: [],
  });

  /* ---------- 404 ---------- */
  pages.push({
    route: "/404",
    sourceFile: "src/content/pages.mjs",
    outputPath: "404.html",
    excludeFromSitemap: true,
    title: "Page Not Found | Rolling Suds of Reno-Tahoe",
    description: "That page does not exist. Browse our pressure washing services or request a free quote for your Reno area property.",
    body: `<section class="error-page">
  <div class="wrap">
    <h1>That page has been washed away</h1>
    <p>The link you followed does not exist any more. Here is where to go next.</p>
    <div class="hero-ctas" style="justify-content:center">
      <a class="btn btn-green btn-lg" href="/#quote">Request a free quote &rarr;</a>
      <a class="btn btn-ghost btn-lg" href="/service-area/">See our service area</a>
    </div>
    ${linkCloud("Popular services", liveServices.map((s) => ({ route: "/" + s.slug, label: s.label })))}
  </div>
</section>`,
    schema: [],
  });

  return pages;
}

export { SERVICES, CITIES };
