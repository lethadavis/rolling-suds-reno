// Single source of truth for the site.
// Contact values live here only. Templates use {{PHONE}}, {{EMAIL}} and friends.

export const SITE_URL = "https://rollingsudsreno.com";

// Feature flags.
export const FLAGS = {
  // When true, the Why Us card reveals an empty slot for a certification
  // badge image. No certification is claimed anywhere while this is false.
  WBE_CERTIFIED: false,
  // Woman owned appears in the trust strip only once Francine approves it.
  WOMAN_OWNED_TRUST: false,
  // Driveway Makeover Contest landing page (/driveway). When false the
  // page stays up but shows a "contest has ended" note and the quote CTA.
  CONTEST_ACTIVE: true,
  // Small link to the contest in the footer. Off: the page is meant to be
  // reached by the postcard QR code, its printed URL and the short redirects.
  CONTEST_PROMO_LINK: false,
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

// Rolling Suds network rating, shown in the homepage trust strip and the
// reviews section heading. Corporate approved displaying the network rating.
// It is the whole Rolling Suds network, not Reno: wording must always say
// "Rolling Suds reviews", and it never goes in JSON-LD (no aggregateRating or
// Review markup for another entity's reviews). Leave rating or count empty
// and the rating disappears everywhere.
// TODO: refresh NETWORK_REVIEWS from rollingsuds.com monthly.
export const NETWORK_REVIEWS = {
  rating: 4.9,
  count: 2987,
  source: "rollingsuds.com (rollingsudspowerwashing.com)",
  approvedByCorporate: true,
  lastUpdated: "2026-10-05",
};

// ZIP codes listed under "Zip Codes Served" on the homepage, in numeric order.
// 26 added from the client's "Missing Zipcodes" list on 2026-10-08 (89431 was
// already here). The build warns about any duplicate entry.
export const SERVED_ZIPS = [
  "89402", "89403", "89406", "89408", "89410", "89413", "89423", "89424", "89428", "89429",
  "89430", "89431", "89433", "89434", "89436", "89439", "89440", "89441", "89442", "89444",
  "89448", "89449", "89451", "89460", "89501", "89502", "89503", "89506", "89507", "89508",
  "89509", "89510", "89511", "89512", "89519", "89521", "89523", "89557", "89701", "89702",
  "89703", "89704", "89705", "89706", "89711", "89712", "96142", "96143", "96145", "96150",
];

// ZIP codes the contest form accepts. Left empty, the ZIP check is skipped and
// every ZIP is accepted.
// TODO: fill from the confirmed franchise territory. The homepage "Zip Codes
// Served" list is a starting point but is itself still marked unconfirmed.
export const SERVICE_ZIPS = [];

// Driveway Makeover Contest form settings.
export const CONTEST = {
  // Stored with every entry unless the visit carries a utm_source.
  leadSource: "Direct Mail: Driveway Postcard",
  // TODO: there is no privacy policy page yet. Add its path here (for example
  // "/privacy/") and the consent line links to it.
  privacyUrl: "",
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

// Hero background photo, decorative. Files live at
// images/hero/<name>-<width>.{avif,webp,jpg}; phones use the 4:5 crop in
// mobile. Swap name for a job photo later and give it real alt text.
export const HERO_IMAGE = {
  name: "reno-skyline",
  widths: [640, 1024, 1600, 2000],
  intrinsic: { width: 2000, height: 1189 },
  focal: "55% 40%",
  mobile: { name: "reno-skyline-mobile", widths: [640, 960] },
  alt: "", // decorative regional scenery, so no alt text
};

// Wildfire ash and soot cleanup offer. The hero card pill, the service page
// offer box, the quote form's "applied" line and the offer=wildfire75 tag on
// leads all read from here. active: false removes it everywhere.
// Terms stay hidden in production while they still start with "TODO".
export const WILDFIRE_OFFER = {
  active: true,
  amountOff: 75,
  text: "$75 off",
  appliesTo: "homes and businesses",
  terms: "TODO: confirm terms with Francine and Jesse",
  expires: null,
};

export const BRAND = {
  navy: "#0f2a44",
  aqua: "#19b5d9",
  ogImage: "/images/og-default.png",
};
