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

## Hero video

`HERO_VIDEO` in `site.config.js` picks the mode automatically:

1. **Self hosted** when both `video/hero.mp4` and `video/hero.webm` exist.
2. **YouTube** when `youtubeId` is set (currently the corporate clip, approved
   for use here, looping 229s to 265s inside a muted, unclickable player).
3. **Poster only** when neither is available.

The poster always paints first and the video fades in over it once playing.
Reduced motion, Save-Data and slow connections stay on the poster.

To switch to self hosted, trim and compress the clip, then drop both files in
`video/`:

```bash
# MP4 (H.264), 1080p max, no audio, fast start
ffmpeg -ss 229 -to 265 -i source.mp4 -an -vf "scale=-2:1080" \
  -c:v libx264 -crf 26 -preset slow -movflags +faststart video/hero.mp4

# WebM (VP9), same trim, no audio
ffmpeg -ss 229 -to 265 -i source.mp4 -an -vf "scale=-2:1080" \
  -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 video/hero.webm
```

Aim for 6 to 15 seconds and 2 to 4 MB. Check the result with
`ls -lh video/` before committing.

## Driveway Makeover Contest (/driveway-makeover)

Postcard landing page, built from `src/content/contest.mjs`. It is noindex,
left out of the sitemap and the nav, and reached through the QR code, the
printed URL and the `/driveway`, `/spa` and `/makeover` redirects.

- Entries go to **Netlify Forms** under the form name `driveway-contest`
  (Netlify > Forms). Form detection must be switched on for the site, and the
  notification email for the inbox is set there too.
- Each entry carries `lead_source` ("Direct Mail: Driveway Postcard", or the
  utm_source when the link has one), the three UTM fields, the page URL and a
  timestamp.
- Photos arrive as `photo1` to `photo4`, already scaled down in the browser so
  the whole entry stays under Netlify's 8 MB limit. Open a submission in the
  Netlify app to view or download them; the links also appear in notification
  emails and CSV exports.
- `FLAGS.CONTEST_ACTIVE` false swaps the form for a "contest has ended" note.
  `FLAGS.CONTEST_PROMO_LINK` adds a footer link. `SERVICE_ZIPS` turns on the
  ZIP check once it has entries.

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
