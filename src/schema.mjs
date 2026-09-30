// JSON-LD builders. Every block is parsed and checked by build.mjs before it ships.
import { SITE_URL, CONTACT, AREA_SERVED } from "../site.config.js";

export const BUSINESS_ID = `${SITE_URL}/#business`;

// Sitewide business block. No aggregateRating and no Review: those wait for
// real, locally sourced reviews.
export function localBusiness() {
  const block = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": BUSINESS_ID,
    name: CONTACT.legalName,
    url: SITE_URL + "/",
    logo: SITE_URL + "/images/logo.png",
    image: SITE_URL + "/images/og-default.png",
    telephone: CONTACT.phoneHref,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.street,
      addressLocality: CONTACT.city,
      addressRegion: CONTACT.state,
      postalCode: CONTACT.zip,
      addressCountry: "US",
    },
    areaServed: AREA_SERVED.map((name) => ({ "@type": "AdministrativeArea", name })),
  };
  // openingHours is left out on purpose: the site does not publish hours.
  if (CONTACT.sameAs.length) block.sameAs = CONTACT.sameAs;
  return block;
}

export function serviceSchema({ name, description, route, serviceType }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${route}/#service`,
    name,
    description,
    serviceType: serviceType || name,
    url: `${SITE_URL}${route}/`,
    provider: { "@id": BUSINESS_ID },
    areaServed: AREA_SERVED.map((n) => ({ "@type": "AdministrativeArea", name: n })),
  };
}

// Questions and answers must match the visible FAQ text on the page.
export function faqSchema(faqs, route) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}${route}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.route === "/" ? SITE_URL + "/" : SITE_URL + c.route + "/",
    })),
  };
}
