// Single source of truth for the site.
// Contact values live here only. Templates use {{PHONE}}, {{EMAIL}} and friends.

export const SITE_URL = "https://rollingsudsreno.com";

// Feature flags. Hood vent cleaning is built but hidden until the service is confirmed.
export const FLAGS = {
  HOOD_VENT_ENABLED: false,
  // When true, the Why Us card reveals an empty slot for a certification
  // badge image. No certification is claimed anywhere while this is false.
  WBE_CERTIFIED: false,
  // Woman owned appears in the trust strip only once Francine approves it.
  WOMAN_OWNED_TRUST: false,
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

// Hero photo. Files live at images/hero/<name>-<width>.{avif,webp,jpg}.
// Swap name for a job photo later and give it real alt text.
export const HERO_IMAGE = {
  name: "reno-skyline",
  widths: [1600, 2000],
  intrinsic: { width: 2000, height: 1189 },
  focal: "55% 40%",
  alt: "", // decorative regional scenery, so no alt text
};

// Hero video. Self hosted wins when both files exist, otherwise the YouTube
// id is used, otherwise the hero shows the poster on its own.
// Corporate has approved use of this clip on this site.
// TODO: replace with a self hosted file at video/hero.mp4 and video/hero.webm
// and the mode switches over on its own.
// TODO: place a poster frame from 3:49 at images/hero/hero-poster.jpg.
export const HERO_VIDEO = {
  mp4: "/video/hero.mp4",
  webm: "/video/hero.webm",
  poster: "hero-poster", // images/hero/hero-poster.*, falls back to the skyline set
  youtubeId: "pDbqotygNrI",
  start: 229, // 3:49
  end: 265, // 4:25
};

export const BRAND = {
  navy: "#0f2a44",
  aqua: "#19b5d9",
  ogImage: "/images/og-default.png",
};
