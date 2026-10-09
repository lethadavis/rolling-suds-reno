// Image slots. Every slot names the photo it wants, its size and its alt text.
// Until the file exists, the slot renders a neutral branded placeholder at the
// same aspect ratio, so nothing shifts when the real photo lands.
import { existsSync } from "node:fs";
import { esc } from "../layout.mjs";

// Slots live under images/<group>/<name>.<ext>. First match wins.
const EXTENSIONS = ["webp", "jpg", "jpeg", "png"];

export function resolveShot(group, name) {
  for (const ext of EXTENSIONS) {
    const rel = `images/${group}/${name}.${ext}`;
    if (existsSync(rel)) return "/" + rel;
  }
  return null;
}

export function shot({ group, name, alt, width = 1200, height = 800, lazy = true, caption, className = "" }) {
  if (!alt) throw new Error(`Image slot ${group}/${name} is missing alt text`);
  const src = resolveShot(group, name);
  const figcaption = caption ? `<figcaption>${esc(caption)}</figcaption>` : "";

  if (!src) {
    // No photo yet. Decorative placeholder, so no alt text claims a photo that
    // does not exist. The wanted shot is listed in IMAGES_NEEDED.md.
    return `<figure class="shot shot-empty${className ? " " + className : ""}" style="aspect-ratio:${width}/${height}" data-slot="${esc(group)}/${esc(name)}">
        <span class="shot-empty-label">Photo coming soon</span>
      </figure>`;
  }

  return `<figure class="shot${className ? " " + className : ""}">
        <img src="${src}" alt="${esc(alt)}" width="${width}" height="${height}" loading="${lazy ? "lazy" : "eager"}" decoding="async">
        ${figcaption}
      </figure>`;
}
