// Before and after pairs shown at the top of the gallery.
// Add a pair here and it renders automatically. A pair whose images are not
// both present is skipped entirely, so the public site never shows a gap.
export const COMPARISONS = [
  {
    id: "commercial-building",
    beforeName: "building-before",
    afterName: "building-after",
    beforeLabel: "Before",
    afterLabel: "After",
    // TODO: confirm both captions.
    caption: "Commercial Building Wash",
    alts: {
      before: "Commercial building wall with dark staining below the light fixture before washing",
      after: "The same building wall after washing, with the staining removed",
    },
    // Portrait photos in a 3:2 frame: hold the top of the wall in view.
    objectPosition: { before: "50% 30%", after: "50% 30%" },
  },
  {
    id: "garage-door",
    beforeName: "garage-during",
    afterName: "garage-after",
    // The left photo is mid wash, so it stays DURING until a true before exists.
    beforeLabel: "During",
    afterLabel: "After",
    caption: "Oxidation Treatment and Rejuvenation (Coordinated Repaint)",
    alts: {
      before: "Garage door partway through oxidation treatment, with treated and untreated panels side by side",
      after: "Garage door after oxidation treatment and rejuvenation, ready for a coordinated repaint",
    },
    // Keep the door panels and handles centred in the 3:2 crop.
    objectPosition: { before: "50% 55%", after: "50% 58%" },
  },
];

// The featured video that heads the gallery.
export const FEATURED_VIDEO = {
  youtubeId: "pDbqotygNrI",
  title: "6 Minutes of Pure Power Washing Satisfaction",
};
