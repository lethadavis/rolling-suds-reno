// Body builders for inner pages. They reuse the homepage design system classes.
import { esc } from "../layout.mjs";

const para = (p) => `<p>${p}</p>`;

export function pageHero({ eyebrow, h1, lede, ctaLabel = "Get a Free Quote" }) {
  return `<section class="page-hero">
  <div class="wrap">
    <span class="pill">${esc(eyebrow)}</span>
    <h1>${esc(h1)}</h1>
    <p>${lede}</p>
    <div class="hero-ctas">
      <a class="btn btn-green btn-lg" href="/#quote">${esc(ctaLabel)} &rarr;</a>
      <a class="btn btn-outline btn-lg" href="tel:{{PHONE_HREF}}"><svg><use href="#i-phone"/></svg>Call {{PHONE}}</a>
    </div>
  </div>
</section>`;
}

export function sections(list) {
  return list
    .map((s) => {
      const bits = [`<h2>${esc(s.h2)}</h2>`];
      for (const block of s.blocks) {
        if (typeof block === "string") bits.push(para(block));
        else if (block.h3) bits.push(`<h3>${esc(block.h3)}</h3>`);
        else if (block.list) bits.push(`<ul>${block.list.map((li) => `<li>${li}</li>`).join("")}</ul>`);
      }
      return bits.join("\n      ");
    })
    .join("\n\n      ");
}

export function sideCard({ heading, text, links, linksHeading }) {
  return `<aside class="side-card">
        <h2>${esc(heading)}</h2>
        <p>${esc(text)}</p>
        <a class="btn btn-green" href="/#quote">Request a free quote</a>
        <a class="btn btn-ghost" href="tel:{{PHONE_HREF}}">Call {{PHONE}}</a>
        ${links?.length ? `<h3 style="margin:22px 0 10px;font-size:15px;letter-spacing:1px;text-transform:uppercase;color:var(--gray)">${esc(linksHeading || "Related services")}</h3>
        <ul class="side-list">${links.map((l) => `<li><a href="${l.route}/">${esc(l.label)}</a></li>`).join("")}</ul>` : ""}
      </aside>`;
}

export function faqBlock(faqs) {
  if (!faqs?.length) return "";
  return `<section class="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Questions we hear a lot</h2>
        ${faqs
          .map(
            (f) => `<details>
          <summary>${esc(f.q)}</summary>
          <p>${esc(f.a)}</p>
        </details>`
          )
          .join("\n        ")}
      </section>`;
}

export function linkCloud(heading, links) {
  if (!links?.length) return "";
  return `<h2>${esc(heading)}</h2>
      <div class="link-cloud">${links.map((l) => `<a href="${l.route}/">${esc(l.label)}</a>`).join("")}</div>`;
}

export function ctaBand({ heading, text }) {
  return `<section class="cta">
  <div class="wrap">
    <h2>${esc(heading)}</h2>
    <p>${esc(text)}</p>
    <div class="hero-ctas">
      <a class="btn btn-green btn-lg" href="/#quote">Get a Free Quote &rarr;</a>
      <a class="btn btn-outline btn-lg" href="tel:{{PHONE_HREF}}"><svg><use href="#i-phone"/></svg>Call {{PHONE}}</a>
      <a class="btn btn-outline btn-lg" href="sms:{{PHONE_HREF}}"><svg><use href="#i-chat"/></svg>Text Us</a>
    </div>
  </div>
</section>`;
}

// Standard inner page: hero, two column body, FAQ, related links, closing CTA.
export function contentPage({ hero, body, aside, faqs, cloudHeading, cloudLinks, cta }) {
  return `${pageHero(hero)}

<section class="page-body">
  <div class="wrap">
    <div class="two-col">
      <div class="prose">
      ${body}

      ${faqBlock(faqs)}

      ${cloudLinks?.length ? linkCloud(cloudHeading, cloudLinks) : ""}
      </div>
      ${sideCard(aside)}
    </div>
  </div>
</section>

${ctaBand(cta)}`;
}
