// Before and after comparison card. Two halves in one rounded card, each with
// a real text label pill, and a caption underneath.
// Labels are markup, never baked into the photo.
import { existsSync } from "node:fs";
import { esc } from "../layout.mjs";

const EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"];
const GROUP = "gallery/compare";

function sources(name) {
  const found = {};
  for (const ext of EXTENSIONS) {
    const rel = `images/${GROUP}/${name}.${ext}`;
    if (existsSync(rel)) found[ext] = "/" + rel;
  }
  return found;
}

function half({ name, label, alt, width, height }) {
  const src = sources(name);
  const fallback = src.jpg || src.jpeg || src.png || src.webp;
  const labelHtml = `<span class="compare-label">${esc(label)}</span>`;

  if (!fallback) {
    // No photo yet, so the frame holds its shape and claims nothing.
    return `<div class="compare-half compare-half-empty">
            <span class="shot-empty-label">Photo coming soon</span>
            ${labelHtml}
          </div>`;
  }

  const srcset = [
    src.avif ? `<source srcset="${src.avif}" type="image/avif">` : "",
    src.webp ? `<source srcset="${src.webp}" type="image/webp">` : "",
  ].join("");

  return `<div class="compare-half">
            <picture>${srcset}<img src="${fallback}" alt="${esc(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"></picture>
            ${labelHtml}
          </div>`;
}

export function beforeAfter({
  beforeName,
  afterName,
  beforeLabel = "Before",
  afterLabel = "After",
  caption,
  alts,
  category = "before-after",
  width = 600,
  height = 800,
}) {
  if (!alts?.before || !alts?.after) throw new Error(`Comparison ${beforeName} is missing alt text`);
  return `<figure class="g-item g-compare" data-cat="${esc(category)}">
          <div class="compare-pair">
            ${half({ name: beforeName, label: beforeLabel, alt: alts.before, width, height })}
            ${half({ name: afterName, label: afterLabel, alt: alts.after, width, height })}
          </div>
          <figcaption>${esc(caption)}</figcaption>
        </figure>`;
}
