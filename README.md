# Window Cleaning Calculator — Astro source

This repository is the **dedicated design, content and application source** for windowcleaningcalculator.co.uk, not merely a WordPress static-export destination.

- Main branch: existing static site (live production source until cutover).
- `astro-migration` branch: editable Astro website, shared layouts, styling, page data and standalone calculator widgets.
- `design.md`: visual and content design contract.
- `MIGRATION.md`: audit, URL map, deployment and acceptance checklist.

## Local development

Node 22+.

```bash
npm install
npm run dev
npm run build
npm run preview
```

`src/pages/` owns routes, `src/layouts/` owns the shell, `src/styles/` owns global design, and `src/data/pages.json` stores editable page copy. The widget code is version-controlled under `src/widgets/`, extracted unchanged from the original export for initial parity.

The old static export remains at repository root for rollback and comparison; Astro does not publish the exported WordPress directory wholesale. `scripts/prepare-public.mjs` copies only required PWA/icon assets before build.

## Adding guide pages

The [How Often Should Windows Be Cleaned?](/src/pages/window-cleaning-prices-uk/how-often-should-windows-be-cleaned.astro) page is a fully native Astro guide built to demonstrate the `design.md` visual system. It includes its own responsive schedule cards, accessible FAQ accordions, internal links and calculator CTA without adding any external dependencies.

For new bespoke guides: add an `.astro` file in `src/pages/window-cleaning-prices-uk/` using `Base.astro`, then link it in `SiteHeader.astro`, the relevant guide cards, the sitemap and build checks. Regular article pages can continue to use `src/data/pages.json`. Preserve the one-H1, unique canonical, local-price-guide and pricing-model boundaries in `design.md`.

## Cloudflare Pages preview

Framework: **Astro** · Build: **npm run build** · Output: **dist** · Node: **22**. Create a *separate preview Pages project* with production branch `astro-migration`, and keep the live domain on the old deployment until the acceptance checklist passes.

The existing Google Apps Script endpoint, postcodes.io dependency, optional email, cleaner feedback, marketing consent and current PWA must be smoke-tested before any domain cutover. Do not replace or reset the existing Google Sheet.

See [MIGRATION.md](MIGRATION.md) before deployment.
