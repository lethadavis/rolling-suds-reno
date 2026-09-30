// Every route on the site. build.mjs renders whatever this returns.
import { readFileSync } from "node:fs";
import { SERVICES } from "./services.mjs";
import { CITIES } from "./cities.mjs";
import { localBusiness, serviceSchema, faqSchema, breadcrumbSchema } from "../schema.mjs";
import { contentPage, pageHero, sections, faqBlock, linkCloud, ctaBand, sideCard } from "../templates/page.mjs";

const read = (p) => readFileSync(p, "utf8").trimEnd();
const HOME_CRUMB = { name: "Home", route: "/" };

export function buildPages({ flags }) {
  const liveServices = SERVICES.filter((s) => !s.flag || flags[s.flag]);
  const serviceBySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
  const cityLinks = CITIES.map((c) => ({ route: "/" + c.slug, label: c.label }));
  const pages = [];

  /* ---------- Homepage ---------- */
  pages.push({
    route: "/",
    sourceFile: "src/pages/home.html",
    title: "Pressure Washing Reno NV | Rolling Suds Commercial & Residential",
    description:
      "Commercial and residential exterior cleaning in Reno, Sparks, Carson City and Lake Tahoe. House washing, roofs, concrete, fleets. Get a free quote.",
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
        body: (s.offer
          ? `<div class="offer-box">
        <span class="offer-tag">${s.offer.tag}</span>
        <p>${s.offer.text}</p>
        <span class="offer-deal">${s.offer.deal}</span>
        <span class="offer-until">${s.offer.until}</span>
      </div>\n\n      `
          : "") + sections(s.sections),
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
        body: sections(c.sections),
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
  const post = {
    slug: "how-much-does-pressure-washing-cost-in-reno",
    title: "How Much Does Pressure Washing Cost in Reno? | Rolling Suds",
    label: "How much does pressure washing cost in Reno?",
    description:
      "What drives pressure washing costs in Reno and Sparks, typical industry price ranges, and how to compare quotes properly. Ask us for a free quote.",
  };
  const blogCrumbs = [HOME_CRUMB, { name: "Blog", route: "/blog" }];
  pages.push({
    route: "/blog",
    sourceFile: "src/content/pages.mjs",
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
      <article class="svc">
        <h3>${post.label}</h3>
        <p>What drives the price of a wash here, the ranges the industry generally quotes, and how to compare two estimates that are not measuring the same thing.</p>
        <a class="svc-link" href="/blog/${post.slug}/">Read about pressure washing costs &rarr;</a>
      </article>
    </div>
  </div>
</section>

${ctaBand({ heading: "Questions about your property?", text: "Send us the details and we will give you a straight answer and a free quote." })}`,
    schema: [breadcrumbSchema(blogCrumbs)],
  });

  const postCrumbs = [HOME_CRUMB, { name: "Blog", route: "/blog" }, { name: post.label, route: "/blog/" + post.slug }];
  const postFaqs = [
    {
      q: "Is pressure washing priced by the hour or by the job?",
      a: "Most exterior cleaning is quoted by the job, based on size, access, surface type and how much buildup there is. Hourly pricing is more common for unusual or open ended work.",
    },
    {
      q: "Why do two quotes for the same house differ so much?",
      a: "Usually because they cover different scopes. One may include gutter faces, window frames and the back fence line while the other covers walls only, so compare the written scope before comparing the totals.",
    },
    {
      q: "Does a bundled visit cost less than separate visits?",
      a: "Generally yes. Setting up on site is a fixed cost, so adding the driveway to a house wash usually costs less than booking the driveway on its own later.",
    },
  ];
  pages.push({
    route: "/blog/" + post.slug,
    sourceFile: "src/content/pages.mjs",
    title: post.title,
    description: post.description,
    breadcrumbs: postCrumbs,
    body: contentPage({
      hero: {
        eyebrow: "Blog",
        h1: "How much does pressure washing cost in Reno?",
        lede: "A plain explanation of what moves the price, with typical industry ranges rather than a number pulled out of the air.",
      },
      body: `<h2>Why nobody can quote your house from a phone call</h2>
      <p>Exterior cleaning is priced on what is in front of the crew. Two houses on the same street can differ by a factor of two because one is single story with clear access and the other is two story with a fenced side yard, a steep lot and ten years of buildup on the north wall.</p>
      <p>The honest answer is that a quote needs the address, the surfaces and a look at the condition. What we can do here is explain what drives the number so the quotes you collect make sense.</p>

      <h2>What actually drives the price</h2>
      <ul>
        <li><strong>Size and height.</strong> More square footage takes longer, and a second story means more setup, more reach and more care.</li>
        <li><strong>Surface type.</strong> Stucco, wood, brick and composite all take different detergents and different dwell times. Concrete is fast per square foot. Wood is slow because it cannot be rushed.</li>
        <li><strong>Condition.</strong> A house washed last year is a maintenance clean. A house that has never been washed is a restoration, and it takes more product and more passes.</li>
        <li><strong>Access.</strong> Gates, slopes, tight side yards, parked cars and roof pitch all add time.</li>
        <li><strong>Scope.</strong> Walls only, or walls plus soffits, gutter faces, window frames, entry and walkway. These are very different jobs.</li>
      </ul>

      <h2>Typical ranges you will see quoted</h2>
      <p>These are general industry ranges published across the pressure washing trade, not our prices. They are useful for sanity checking a bid, not for budgeting a specific property.</p>
      <ul>
        <li><strong>House washing:</strong> typically quoted per square foot of the home, with most single family jobs landing in the low hundreds of dollars.</li>
        <li><strong>Driveways and flatwork:</strong> typically quoted per square foot, with a minimum charge for a single driveway.</li>
        <li><strong>Roof cleaning:</strong> usually higher than a house wash for the same property because of access, safety and the low pressure method involved.</li>
        <li><strong>Commercial work:</strong> nearly always quoted per site after a walkthrough, and often lower per visit on a recurring schedule.</li>
      </ul>
      <p>Anyone quoting a firm price for your property sight unseen is guessing, and that guess usually has to be protected somewhere: with a fast pass, a weaker mix or a narrower scope than you expected.</p>

      <h2>Reno specifics that affect a quote</h2>
      <p>Our region adds a few wrinkles. Hard water means rinse water left to dry on glass or panels spots, so purified water rinsing is worth including where it matters. Wind blown dust means a house downwind of open ground gets dirty faster than one in a sheltered established neighborhood. Winter road treatment leaves a film that needs degreasing rather than a plain rinse. Wildfire ash adds an extra cleaning to some years and not others.</p>
      <p>Properties at Tahoe elevations cost more to service for a simple reason: drive time, a shorter working season and more organic growth to remove after months under snow.</p>

      <h2>How to compare two quotes fairly</h2>
      <p>Line the scopes up side by side before you look at the totals. Check whether each includes soffits and eaves, gutter exteriors, window frames and screens, the back fence line, and any concrete. Check whether the company carries its own water. Ask whether they are insured, and ask what happens if you are not satisfied.</p>
      <p>Price matters, but the cheapest bid that skips the north elevation or blasts your stucco is not the cheaper job. It is the one you pay for twice.</p>`,
      aside: {
        heading: "Want a real number?",
        text: "Send the address and what needs cleaning. We will come back the same business day with a no obligation quote.",
        links: [
          { route: "/house-washing", label: "House washing" },
          { route: "/driveway-and-concrete-cleaning", label: "Driveway and concrete cleaning" },
          { route: "/roof-cleaning", label: "Roof cleaning" },
        ],
        linksHeading: "Popular services",
      },
      faqs: postFaqs,
      cloudHeading: "Where we work",
      cloudLinks: cityLinks,
      cta: { heading: "Get your free quote", text: "No obligation, and most estimates go out the same business day." },
    }),
    schema: [faqSchema(postFaqs, "/blog/" + post.slug), breadcrumbSchema(postCrumbs)],
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
