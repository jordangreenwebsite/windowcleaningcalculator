# Window Cleaning Calculator — Astro, original design preserved

**The owner's original website appearance is the source of truth.** Do not redesign it.

This repository builds the original Window Cleaning Calculator through Astro for Cloudflare Pages. The source design to reproduce is the last pre-migration state at GitHub commit `5c137e8a`.

## Build

```bash
npm install
npm run build
```

Cloudflare Pages: production branch `main`, Node 22, build `npm run build`, output `dist`.

## Structure

- `src/pages/index.astro`, `src/pages/[...slug].astro`: Astro static routes matching the original site.
- `src/components/OriginalDocument.astro`: faithful document renderer.
- `src/lib/legacy-routes.mjs`: all original routes.
- Original HTML archives and original designer CSS/images remain in root and `wp-content/` until fully componentised.
- `scripts/prepare-public.mjs`: copies only the original assets actually used by the website, plus PWA/sitemaps.
- `scripts/verify-build.mjs`: prevents visual markup drift and missing CSS/images; the calculator logic is untouched.
- `design.md`: authoritative design-preservation contract.

**This is a visual-parity phase, not the completed clean source refactor.** The original HTML is deliberately left intact. Once the owner verifies the live appearance, progressively extract real reusable Astro header/footer/page components with before/after visual tests. Don't redo the site design.

The rejected newly designed Astro templates and frequency test page were not authorised and have been removed from the output.

## Search optimisation

`scripts/seo-pages.mjs` adds unique meta descriptions, modern JSON-LD, the existing brand logo/favicon, descriptive image alt attributes, corrected internal URLs and semantic headings **without touching original layout or calculator JavaScript**. The subsequent `scripts/verify-build.mjs` checks visual text/CSS/script preservation, links, metadata, schema, images, indexability and robots/sitemap coverage.

Cloudflare may separately manage or override robots.txt and crawler policies. A live fetch of `/robots.txt` and Google Search Console URL Inspection are required after deploy.

## 9 November 2026: remaining audit findings
- `public/robots.txt` already explicitly allows all user agents and supplies the sitemap URL. A live audit claiming a universal block despite the correct compiled file requires checking Cloudflare zone-level **Security → Settings → Bot traffic → AI Crawler and Agent access policies**, particularly Bot Preference Sync and Search/Training actions. Cloudflare may prepend managed robots directives; don't misrepresent that as a code defect. Review the actual served `/robots.txt` after deployment.
- The footer's `#calculator` links on guide and policy pages previously targeted a missing on-page anchor. These are now converted to `/#calculator`, which goes to the actual homepage tool; no visible labels/layout change.
- `Organization.areaServed` explicitly describes the United Kingdom because the tool models UK prices. It is not a local window-cleaning company, so no LocalBusiness address/opening hours are invented.
- A third-party report of one failed live internal-link request cannot be attributed to a specific URL without its audit detail or direct live response; GitHub's static link audit should not be presented as proof of a Cloudflare live HTTP response.
