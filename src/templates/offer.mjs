// Wildfire ash and soot offer, built from WILDFIRE_OFFER in site.config.js.
// Every place that shows the offer goes through here, so turning it off in
// the config removes it from the hero, the service page and the quote form.
import { WILDFIRE_OFFER as O } from "../../site.config.js";
import { isProduction } from "../env.mjs";

export const offerOn = Boolean(O.active);
export const offerCode = `wildfire${O.amountOff}`;
export const offerHref = `/?service=wildfire${offerOn ? `&offer=${offerCode}` : ""}#quote`;
const expiresLine = O.expires
  ? `through ${new Date(O.expires + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
  : "";
// Unconfirmed terms are never published: hidden in production while TODO.
const termsReady = !/^\s*TODO/i.test(O.terms || "");
const showTerms = offerOn && O.terms && (termsReady || !isProduction);

// Hero card: the amber pill takes the eyebrow slot so the card stays the same height.
export const heroEyebrow = offerOn
  ? `<span class="offer-pill">${O.text} wildfire ash and soot cleanup</span>`
  : `<span class="promo-eyebrow">Now Booking: Reno &amp; Tahoe</span>`;

export const heroTerms = showTerms
  ? `<details class="offer-terms" id="wildfire-terms">
        <summary>See terms</summary>
        <p>${O.terms}</p>
      </details>`
  : "";

// Quote form: the line shown once the offer is applied.
export const formAttr = offerOn ? ` data-offer-code="${offerCode}"` : "";
export const appliedLine = offerOn
  ? `<p class="offer-applied" id="offerApplied" role="status" hidden><svg aria-hidden="true"><use href="#i-check"/></svg>${O.text} wildfire cleanup applied</p>`
  : "";

// Service page offer box: the deal, linked to the quote form with the offer.
export function offerDeal(service) {
  if (!offerOn || service.slug !== "wildfire-ash-and-soot-cleanup") return "";
  return `<a class="offer-deal" href="${offerHref}">${O.text} wildfire ash and soot cleanup</a>${expiresLine ? `\n        <span class="offer-until">${expiresLine}</span>` : ""}`;
}
