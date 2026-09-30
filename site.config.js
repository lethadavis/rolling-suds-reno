// Single source of truth for the site.
// Contact values live here only. Templates use {{PHONE}}, {{EMAIL}} and friends.

export const SITE_URL = "https://rollingsudsreno.com";

// Feature flags. Hood vent cleaning is built but hidden until the service is confirmed.
export const FLAGS = {
  HOOD_VENT_ENABLED: false,
};

export const CONTACT = {
  name: "Rolling Suds of Reno",
  legalName: "Rolling Suds of Reno-Tahoe",
  phone: "775.342.7287",
  phoneHref: "+17753427287",
  email: "EMAIL@rollingsuds.com", // TODO: real address, still a placeholder
  street: "5635 Riggins Court, Unit 8",
  city: "Reno",
  state: "NV",
  zip: "89502",
  mapSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=5635+Riggins+Court+Unit+8+Reno+NV+89502",
  mapEmbedUrl:
    "https://www.google.com/maps?q=5635+Riggins+Court+Unit+8,+Reno,+NV+89502&z=9&output=embed",
  reviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJYV1x5w9wnCoR5FHwIPjkhG8",
  corporateUrl: "https://www.rollingsuds.com/",
  // Public profiles are not linked from the site yet, so schema carries no sameAs.
  // TODO: confirm the Instagram and YouTube URLs, then link them in the footer and add here.
  sameAs: [],
};

// Which rating the site shows.
// "national" is the Rolling Suds brand aggregate published by corporate.
// "local" is this franchise's own Google Business Profile rating.
export const REVIEWS = {
  display: "national",
  national: { rating: "4.9", count: "2,987", label: "Reviews" },
  local: { rating: "5.0", count: "9", label: "Google reviews" }, // verified 2026-09-30
};

// Counties and areas the crews cover, used by LocalBusiness schema and the service area page.
export const AREA_SERVED = [
  "Washoe County, NV",
  "Douglas County, NV",
  "Carson City, NV",
  "Lyon County, NV",
  "Storey County, NV",
  "Churchill County, NV",
  "Lake Tahoe, CA",
];

export const BRAND = {
  navy: "#0f2a44",
  aqua: "#19b5d9",
  ogImage: "/images/og-default.png",
};
