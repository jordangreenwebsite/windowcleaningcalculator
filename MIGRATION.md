# WordPress static export → Astro / Cloudflare Pages migration

## Observed baseline, 9 Nov 2026
The default branch is a Simply Static export of WordPress/Breakdance markup. The main calculator lives inline in `index.html`, and a separate local-price lookup widget lives in the UK pricing guide. Existing PWA files are at root. 17 HTML documents were identified: homepage, 11 guides, four legal/cookie pages and an author archive. The author archive should not become a valuable indexed page.

The old export contains multiple H1 elements from logo/footer, WordPress-specific JS/CSS, old `/home/` and root-level guide links that don't match their canonical nested `/window-cleaning-prices-uk/...` paths. This is a source audit, **not a live Lighthouse audit**.

## Scope implemented in preview branch
- Native Astro routes for homepage, eleven guides, privacy, cookies, settings and terms.
- Shared, editable design shell and responsive CSS, unique metadata, canonical URLs, sitemap, robots and legacy-path redirects.
- Main pricing app and local price lookup extracted without intentional arithmetic or backend changes.
- PWA/icons copied from the existing archive by a build script, without publishing all WordPress assets.
- Content migrated into editable structured page data; editorial review for tables, exact ordering and omitted Breakdance-specific presentation is still required.

## Slug preservation
- `/`
- `/window-cleaning-prices-uk/`
- `/window-cleaning-prices-uk/commercial-window-cleaning-cost/`
- `/window-cleaning-prices-uk/conservatory-cleaning-cost/`
- `/window-cleaning-prices-uk/conservatory-roof-cleaning-cost/`
- `/window-cleaning-prices-uk/first-window-cleaning-cost/`
- `/window-cleaning-prices-uk/how-we-calculate-prices/`
- `/window-cleaning-prices-uk/inside-window-cleaning-cost/`
- `/window-cleaning-prices-uk/one-off-window-cleaning-cost/`
- `/window-cleaning-prices-uk/window-cleaning-cost-per-window/`
- `/window-cleaning-prices-uk/window-cleaning-prices-by-area/`
- `/window-cleaning-prices-uk/window-cleaning-prices-by-property-type/`
- `/privacy-policy/`, `/terms-of-use/`, `/cookie-policy/`, `/cookie-settings/`

## Cloudflare staging (no DNS change)
1. Connect **this existing repository** to a new Cloudflare Pages project. Set preview project's production branch to `astro-migration`.
2. Preset Astro; build `npm run build`; directory `dist`; root `/`; Node 22 (from `.nvmrc`).
3. Visit the preview `*.pages.dev` domain. Verify all page paths and browser console.
4. Complete test matrix before any production change:
   - Two postcode cases in different pricing areas; property/window/access/frequency, inside/conservatory; compare £ estimates with currently live site.
   - Ensure a test calculation appears in the **Calculations** sheet with matching ID and fields; check failed / timed-out Apps Script executions.
   - Verify cleaner feedback in **Pricing Feedback** and opt-in in **Marketing Opt-Ins**; email results received; no marketing entries without express consent.
   - Test local pricing widget, mobile keyboard/nav, print, saved image, install/offline PWA, policy links, redirect status and sitemap.
   - Compare old content and critical price tables; review Search Console/analytics and Lighthouse.
5. After sign-off, promote preview Astro commit to `main`, set the normal Pages production branch to `main`, attach `windowcleaningcalculator.co.uk` and verify HTTPS. Retire the old deployment only after parity and rollback plan are confirmed.

## Known caveats
- The original script uses `fetch(...,{mode:'no-cors'})` and can report success without a confirmed server response; this needs backend work in a *separate* change.
- Live Apps Script, Google Sheet and Brevo credentials are external; no secrets should be committed.
- No actual build/Cloudflare deployment or integration tests are claimed by this source migration.
