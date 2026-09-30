// Single source of truth for the site.
// Contact values live here only. Templates use {{PHONE}}, {{EMAIL}} and friends.

export const SITE_URL = "https://rollingsudsreno.com";

// Feature flags. Hood vent cleaning is built but hidden until the service is confirmed.
export const FLAGS = {
  HOOD_VENT_ENABLED: false,
  // When true, the Why Us card reveals an empty slot for a certification
  // badge image. No certification is claimed anywhere while this is false.
  WBE_CERTIFIED: false,
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

// Local Google Business Profile rating only. The national Rolling Suds
// aggregate must never appear on this site. Leave rating or count empty and
// the rating line disappears everywhere.
// TODO: confirm the current rating and count before launch.
export const REVIEWS = {
  rating: "5.0", // verified on the Google listing, 2026-09-30
  count: "9",
  label: "Google reviews",
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
