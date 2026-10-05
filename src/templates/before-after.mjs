// Before and after comparison card. Two halves in one rounded card, each with
// a real text label pill, and a caption underneath.
// A pair with a missing image renders nothing at all: the public site never
// shows a placeholder block.
import { existsSync } from "node:fs";
import { esc } from "../layout.mjs";

const EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"];
const GROUP = "images/gallery/compare";

export function pairSources(name) {
  const found = {};
  for (const ext of EXTENSIONS) {
    const rel = `${GROUP}/${name}.${ext}`;
    if (existsSync(rel)) found[ext] = "/" + rel;
  }
  return found;
}

export const pairIsComplete = (pair) =>
  Object.keys(pairSources(pair.beforeName)).length > 0 && Object.keys(pairSources(pair.afterName)).length > 0;

function half({ name, label, alt, objectPosition, width, height }) {
  const src = pairSources(name);
  const fallback = src.jpg || src.jpeg || src.png || src.webp;
  const sources = [
    src.avif ? `<source srcset="${src.avif}" type="image/avif">` : "",
    src.webp ? `<source srcset="${src.webp}" type="image/webp">` : "",
  ].join("");

  return `<div class="compare-half">
            <picture>${sources}<img src="${fallback}" alt="${esc(alt)}" width="${width}" height="${height}" style="object-position:${esc(objectPosition)}" loading="lazy" decoding="async"></picture>
            <span class="compare-label">${esc(label)}</span>
          </div>`;
}

export function beforeAfter(pair, { width = 600, height = 400 } = {}) {
  if (!pair.alts?.before || !pair.alts?.after) throw new Error(`Pair ${pair.id} is missing alt text`);
  if (!pairIsComplete(pair)) return "";
  return `<figure class="g-compare" data-cat="before-after">
          <div class="compare-pair">
            ${half({ name: pair.beforeName, label: pair.beforeLabel, alt: pair.alts.before, objectPosition: pair.objectPosition?.before || "50% 50%", width, height })}
            ${half({ name: pair.afterName, label: pair.afterLabel, alt: pair.alts.after, objectPosition: pair.objectPosition?.after || "50% 50%", width, height })}
          </div>
          <figcaption>${esc(pair.caption)}</figcaption>
        </figure>`;
}
