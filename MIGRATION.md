# Original visual restoration (9 November 2026)

The owner rejected the first Astro migration because it changed their carefully designed website. This correction preserves the exact pre-migration HTML/CSS/JS/images, builds it with Astro, and removes the redesigned output.

Reference: pre-migration commit `5c137e8a85308ecfe2d4703cf3615497365c56ed`.
Corrected Astro routes: original 17 documents (home + 11 guides + 4 policies + author).
No new page or new site design is included.

## Non-negotiable
- Match original visually on desktop, tablet and mobile.
- Preserve the calculator, its Google Apps Script integration and pricing, plus local checker, policies and PWA.
- Use source equality checks and verify asset presence on each build.
- DO NOT refactor CSS/JS, rename sections or change pricing until verified.

## Deployment
Push to `main` triggers connected Cloudflare Pages deployment if configured; build command `npm run build`, output `dist`, Node 22.

## Follow-up after restore
1. Check the live Cloudflare deployment status and refresh in an incognito window; old service worker clients may cache earlier versions.
2. Compare original visual layout, header, menu, all guide pages, footer on desktop/mobile.
3. Submit one test calculation and verify Google Sheet `Calculations`; test local price checker and feedback/email/consent if possible.
4. After visual parity is confirmed, refactor **one component at a time** into clean Astro while keeping screenshots matched. The current implementation is an Astro static build of original HTML, not yet a fully native editable component redesign.
