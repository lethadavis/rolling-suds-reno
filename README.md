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

## Hero image

The homepage hero is a static, decorative photo of the Reno skyline under a
pale veil. `HERO_IMAGE` in `site.config.js` lists the sizes: 640, 1024, 1600
and 2000 wide, plus a 4:5 phone crop at 640 and 960, each as AVIF, WebP and
JPG in `images/hero/`. Tablets and desktops preload it at high priority. Phones
do not: there the headline is the largest paint, and an early image fetch
slowed it down.

## Where leads go

Both forms send to two places at once, and either one landing counts as a
success, so a problem at one destination never shows the visitor an error.

- **Netlify Forms** is the full record and the notification email. The homepage
  form is `site-quote`, the contest form is `driveway-contest`. Form detection
  has to be on for the site (Netlify > Forms), and the notification address is
  set there.
- **HubSpot** gets the contact, through `/api/lead`.

### Why there is a function

HubSpot's form submission API accepts a submission for a form built in the new
editor, answers 200, and then discards it: no contact is created and nothing
appears in the form's submissions. Tested three times against the live form in
November 2026, with the same payload succeeding through HubSpot's own embed.

So leads go to the CRM API instead, which needs a private app token. A token
cannot ship in a static site, so `netlify/functions/lead.mjs` holds it:

- The browser posts our own field names to `/api/lead`. It never names a
  HubSpot property, so a crafted request cannot write to one.
- `src/lib/hubspot-map.mjs` turns those into contact properties. It is the one
  place the mapping lives, and it is server side only.
- The contact is matched on email address, so a repeat enquiry updates the
  contact already there rather than making a second one.
- A filled honeypot gets a cheerful answer and sends nothing.
- Email addresses and phone numbers are stripped out of anything logged.

**Setup:** in Netlify, Site configuration > Environment variables, add
`HUBSPOT_TOKEN`. Create it in HubSpot under Settings > Integrations > Private
apps, with the `crm.objects.contacts.write` scope. Without it the function
answers 500 and logs that it is unset, and Netlify Forms still holds the lead.

### Fields

`HUBSPOT.fieldMap` in `site.config.js` follows the published HubSpot form, so
the names look unusual on purpose: `mobilephone` rather than `phone`,
`service_street_address` rather than `address`, `service_zip` rather than
`zip`. Service Selected accepts its own options only, so a quote form choice
with no matching option, such as "Multiple Services", is written into the
notes instead. The offer tag and the UTM tags finish the notes.

Two things in HubSpot are worth fixing, and both have a TODO at the line that
works around them: the Lead Source option "Driveway / Websit" is missing its
final "e", and the form's Email contact checkbox points at `work_email`, a
property meant to hold an email address.

## Driveway Makeover Contest (/driveway)

Postcard landing page, built from `src/content/contest.mjs`. It is noindex,
left out of the sitemap and the nav, and reached through the QR code, the
printed URL and the `/driveway-makeover`, `/spa` and `/makeover` redirects.

- Entries go to **Netlify Forms** under the form name `driveway-contest`
  (Netlify > Forms). Form detection must be switched on for the site, and the
  notification email for the inbox is set there too.
- Each entry carries `lead_source` ("Direct Mail: Driveway Postcard", or the
  utm_source when the link has one), the three UTM fields, the page URL and a
  timestamp.
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
