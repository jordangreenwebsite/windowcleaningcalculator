# Window Cleaning Calculator — Design system (Astro migration)

Status: **implementation design specification**, 9 November 2026. This is the independent Window Cleaning Calculator product, not the J Piper Cleaning customer site. The direction is approved by the owner's request to adopt the Astro/Cloudflare/GitHub workflow; individual visual variations remain reviewable.

## Product promise
Provide a clear, quick, region-sensitive window-cleaning estimate to homeowners and usable price guidance to professional cleaners. Explain assumptions, do not portray model outputs as fixed quotes. Keep the calculator free to use without an account. Use guide content to answer genuine UK search queries.

## Look and feel
- Recognisable existing palette: **Navy #1E3A5F**, blue **#4A6FA5**, orange **#FF8C42**, off-white **#F5F7FA**, ink **#172033**, muted **#667085**.
- Modern, calm trade-tool aesthetic: clean cards, thin borders, generous white space, restrained shadows, 12–20px radii. No generic stock-photo hero, gimmicky gradients or emoji-led copy.
- Typography: system-ui/Inter fallback, expressive but practical headings, 16–18px paragraphs, readable line lengths (approx 68–75 characters).
- Orange is a single functional highlight for primary calls to action; navy owns headers, information hierarchy and strong panels; blue for secondary emphasis.
- Use existing product icon as a local lightweight asset. Never stretch it, and avoid full-size legacy 2,000px logo downloads.

## Experience and navigation
- Header: calculator, UK prices, a single dropdown of pricing guides, and the parent UK Trade Websites attribution. Mobile is native-details navigation; no JS framework required.
- Homepage: one H1; immediate explanation; live calculator above the guide content; explicit free/no-account positioning; pricing assumptions and links to educational guides.
- Guide template: one H1, short introduction, optional live local-price checker, well-scanned H2/H3 article blocks, relevant guide links and start-calculator CTA. Avoid breadcrumb clutter.
- Footer: actual working guide and legal URLs; no placeholder directory links or extra H1s.
- Small screens: calculator and local checker get full available width; touch targets ~44px; headings wrap; nav stays usable with no horizontal overflow.
- Accessibility: skip link, keyboard-operable menus, labelled form fields, visible focus indicators, WCAG AA text contrast; respect reduced motion.

## Technical source of truth
- GitHub repository: `jordangreenwebsite/windowcleaningcalculator`.
- Design/layout in `src/layouts/`, site CSS in `src/styles/`, marketing content in `src/data/pages.json`, routes in `src/pages/`.
- Legacy functional calculator HTML/JS/CSS versioned as `src/widgets/calculator.html`; local-price widget as `src/widgets/local-pricing.html`. This extraction intentionally preserves pricing and data behaviour for migration; a later refactor requires regression tests.
- Existing export at root is archival only during transition. No more WordPress/Breakdance/Simply Static copy/paste after successful cutover.
- Astro statically builds `dist/`; Cloudflare Pages serves it. No database or SSR required for public pages currently.

## SEO & editorial rules
- Preserve all 11 canonical pricing-guide slugs and the four legal/cookie slugs.
- Canonical URL per route; unique title and description; one semantic H1; internal links must use actual Astro routes; no fake or orphan guide links.
- Sitemap and robots; 301s for previously mislinked root-level guide paths and the old `/home/` path; don't redirect actual canonical pages to new slugs needlessly.
- Relevant SoftwareApplication and WebSite structured data; no invented reviews, author qualifications or local-search claims.
- Treat estimated prices as modelled guidance, not official regional averages. Avoid unexplained "2026" copy that becomes stale.
- All legal pages retained; privacy/consent text and email flows should be checked against the live backend before cutover.
- Minimise assets and render-time JS outside interactive widgets; images locally served and right-sized.

## Functional non-regression contract (confirmed in source)
- Household and cleaner modes; UK postcode lookup with postcodes.io; property/window input; height, frequency, condition and access; inside and conservatories; regional multipliers.
- Price breakdown, printable/image/email results, PWA install, calculator submission, cleaner pricing feedback, optional marketing consent.
- App sends `save_calculation`, `email_result` and `cleaner_feedback` actions to Google Apps Script. The existing `no-cors` client response cannot prove backend success; preserve service now and improve observability separately with backend cooperation.
- The guide-local price lookup is a **second** interactive tool and must be checked separately.
- The blank `Main List` Google Sheet is intentionally unused; the `Calculations` tab was receiving data on 9 Nov 2026.

## Product ideas — not existing functionality
- Future authenticated cleaner quoting, editable price settings per cleaner, white-label embeds and deeper price-calibration analytics are **ideas only**. They are not part of the migration scope.
- Automated SEO content or a directory of cleaners requires a separate approved implementation.

## Acceptance gate
Verify one clean H1 and canonical per route, all current guide text and legal notices, 301s, postcode/pricing sample parity, two widgets, Google Sheets updates, emails/consent/feedback, PWA and mobile, lighthouse/accessibility and Cloudflare staging. Do not switch DNS until all pass.
