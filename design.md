# Window Cleaning Calculator — Original Design Contract

**Status: visual preservation, not redesign.** Updated 9 November 2026 after the owner rejected the first Astro visual migration.

## Authoritative reference
The actual 9 November 2026 **pre-migration** site at commit `5c137e8a85308ecfe2d4703cf3615497365c56ed` in `jordangreenwebsite/windowcleaningcalculator` is the **only approved visual baseline**. The original website was designed and built by the owner over considerable time. Do **not** apply a generic Astro/agency template, change the design without permission, or substitute an invented design system.

## Exact typography and palette from original source
- Main site body: **Average Sans**; heading type: **Domine**. Calculator widgets use their original embedded styling and may use Inter/system fonts internally. Some existing labels use Intel One Mono.
- Site palette defined in `wp-content/uploads/breakdance/css/global-settings.css`: off-white **#FCFDF5**, ink **#1F2113**, main orange **#FF681F**, white **#FFFFFF**, olive **#6E7448**. The calculator itself uses navy **#1E3A5F**, blue **#4A6FA5** and orange **#FF8C42** inside its own UI.
- Keep the original logo size, sticky header behaviour, mobile menu, background colours, layout columns, hero spacing, text sizes, page sequence, graphics, borders and footer.
- Use the actual existing images and original responsive rules until each component has been migrated and screenshot-compared. Do not use generic photographic substitutes.

## Product and page scope
- Preserve the homepage, all eleven existing UK pricing guides, all four legal/cookie pages and the existing author page. Retain URLs and pre-existing contents.
- Preserve the exact original main calculator (customer/cleaner modes, postcode, windows, inside, conservatories, frequencies, first clean, feedback, email, optional marketing consent), the original local price lookup and Google Apps Script connection.
- DO NOT silently change pricing factors, field names, Google Sheet behaviour or PWA flows.
- Existing live backend has been observed receiving calculation submissions on 9 Nov 2026.

## Implementation
- The live site **must render exactly like the pre-migration export**. A first corrective step uses Astro static routes and an Astro `OriginalDocument` component that renders the original full HTML documents from the archived source at repository root.
- The build copies the exact original CSS, graphics and legacy interaction runtime to `public/` and emits `dist/` for Cloudflare.
- An automated parity check fails the build if output HTML differs from the original, or required original assets are missing. This is essential while stabilising the migration.
- **Honest current limitation:** source is Astro-built, but the markup is still the original exported HTML, not yet decomposed into clean native Astro components. This is deliberate to prevent losing the owner's design. Extract header/footer, guide sections and widgets into editable Astro components in measured steps **only** with before/after DOM/screenshot and pricing regression evidence. No redesign is authorised.
- The rejected replacement navy/blue layout, substituted homepage and new frequency page are removed from the generated site.

## Future editing rule
1. Establish visual parity for desktop/tablet/mobile on the user's live Cloudflare site.
2. Extract **one** original component at a time without changing any visible output.
3. Compare its resulting rendered HTML and screenshots before merging.
4. Keep the original on GitHub for rollback until source-level extraction is complete.
5. Add future pages with the same original visual language, not a new design.

This project is its own product, not part of J Piper Cleaning.

## SEO-only changes (9 November 2026)
- `scripts/seo-pages.mjs` post-processes Astro's output **after** the original design and functionality are rendered. It changes only metadata, structured data, image alt attributes, heading semantics and link targets; no visual design or calculator behaviour changes are authorised.
- Use the existing original full-logo image for social previews and the existing PWA logo/icon for favicons. Google's search-result icon and thumbnails are ultimately selected by Google.
- Keep the original CSS, fonts, DOM text, JS logic, image dimensions, calculator and local price checker stable. The SEO verifier enforces non-regression.
- Do not invent a LocalBusiness address, telephone, opening hours, review scores, social profiles or service locations solely for a third-party audit score. This is a nationwide online calculator, not a local window-cleaning contractor.
- Fix the broken old links at build time, retain redirects, real SEO article dates (if published on original source), one heading per page, and genuine structured data.
