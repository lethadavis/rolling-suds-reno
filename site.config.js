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

// Local Google Business Profile rating only. The national Rolling Suds
// aggregate must never appear on this site. Leave rating or count empty and
// the rating line disappears everywhere.
// TODO: confirm the current rating and count before launch.
export const REVIEWS = {
  rating: "5.0", // verified on the Google listing, 2026-09-30
  count: "9",
  label: "Google reviews",
};

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
