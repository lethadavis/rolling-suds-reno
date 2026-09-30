# Rolling Suds of Reno-Tahoe website

Static site built by a small Node script. No framework, no dependencies.

```bash
node build.mjs                # render src/ into dist/
node scripts/check-site.mjs   # post build checks (fails on problems)
npm run serve                 # build, then serve dist/ on :8765
```

## Layout

| Path | What it holds |
| --- | --- |
| `site.config.js` | Site URL, feature flags, contact details, local review numbers, service area |
| `src/content/services.mjs` | Copy for the 13 service pages |
| `src/content/cities.mjs` | Copy for the 4 city pages |
| `src/content/pages.mjs` | Route list: homepage, services, cities, service area, blog, 404 |
| `src/partials/` | Nav, footer, mobile bar, icons, lightbox |
| `src/pages/home.html` | Homepage body |
| `src/templates/page.mjs` | Inner page body builders |
| `src/layout.mjs` | Head tags, canonical, Open Graph, page shell |
| `src/schema.mjs` | JSON-LD builders |
| `assets/` | Stylesheet and page script |

Contact values live in `site.config.js` only. Templates reference them as
tokens such as `{{PHONE}}`, `{{EMAIL}}` and `{{STREET}}`, filled at build time.

## Indexing: production vs staging

The build compares Netlify's `CONTEXT` and `URL` against `SITE_URL`.

- **Production** (`CONTEXT=production` and the deploy URL is rollingsudsreno.com):
  pages carry `robots: index, follow` and no `_headers` file is written.
- **Anything else** (netlify.app, deploy previews, branch deploys, local builds):
  every page carries `<meta name="robots" content="noindex, nofollow">` and the
  build writes `dist/_headers` with `X-Robots-Tag: noindex, nofollow`.

No action is needed at launch beyond pointing the domain at the site: once
rollingsudsreno.com is the site's primary URL, production builds become
indexable on their own.

## Feature flags

`FLAGS.HOOD_VENT_ENABLED` is `false`. While it is off, `/hood-vent-cleaning`
is still built but is left out of the sitemap, the footer and homepage links.
Set it to `true` once the service is confirmed.

## Domain redirect plan

1. Add both `rollingsudsreno.com` and `rollingsudsrenotahoe.com` as custom
   domains on the Netlify site, with rollingsudsreno.com set as primary.
2. Point the DNS for both at Netlify.
3. `netlify.toml` already contains 301 redirects that send
   `rollingsudsrenotahoe.com/*` and both `www` hosts to
   `https://rollingsudsreno.com/:splat`, preserving the path.
4. After launch, check that a few old URLs return 301 to the matching new URL.

## Checks

`scripts/check-site.mjs` verifies, for every built page: exactly one H1,
title and description lengths, a self referencing canonical, valid JSON-LD,
alt text on every image, no em dashes, no broken internal links, and presence
in `sitemap.xml`. It exits non zero if anything fails.
