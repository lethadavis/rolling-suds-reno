// Every route on the site. build.mjs renders whatever this returns.
import { readFileSync } from "node:fs";
import { localBusiness } from "../schema.mjs";

const read = (p) => readFileSync(p, "utf8").trimEnd();

export function buildPages() {
  const pages = [];

  pages.push({
    route: "/",
    sourceFile: "src/pages/home.html",
    title: "Pressure Washing Reno NV | Rolling Suds Commercial & Residential",
    description:
      "Commercial and residential exterior cleaning in Reno, Sparks, Carson City and Lake Tahoe. House washing, roofs, concrete and fleets. Get a free quote today.",
    body: read("src/pages/home.html"),
    needsLightbox: true,
    schema: [localBusiness()],
  });

  return pages;
}
