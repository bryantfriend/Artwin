# Artwin showroom release — 15 September 2026

This release implements the upgrades that can be built and demonstrated without Artwin accounts, approved unit inventory or private system access.

## Buyer experience

- Compact mobile project introductions, a floorplan shortcut in the first screen and persistent bottom navigation. Extra filters and apartment details expand on demand.
- Project filters and finder preferences stay on the device. Returning to a project restores its list position.
- The consultation welcome modal waits for 45 seconds and engagement. Dismissal suppresses it for seven days. It does not interrupt the finder, presentations or tours.
- Ten project galleries contain 48 selected official images: architecture, courtyards, entrances, lobbies and shared facilities. Renderings are identified as design references, not construction progress.
- Daylight and warm evening lighting and a loose-furniture visibility control are available in apartment viewers. Fixed fixtures and finishes remain illustrative. Toggling furniture during walkthrough moves the visitor to the entrance to prevent an overlap.
- Seoul retains 12 commercial floorplans, is excluded from apartment matching and uses commercial contact wording.
- Added UI labels are translated into Russian, Kyrgyz, American English and Chinese. Russian remains the default for new visitors.

## Presentation and proposal

Open **Present these apartments** below a project's plans, or **Present this shortlist** from a saved shortlist. Select up to three apartments across projects, show one, compare the selection, open a walkthrough, enter fullscreen or share the selection.

**Print or save proposal** opens the browser's print dialog. Each apartment gets an ARTWIN A4 sheet with a 2D floorplan, furnished preview, QR link and contact information. Codes are generated locally with `qrcode`; no external QR service receives the selection. Printing waits for the QR assets and images. Shared links contain layout identities, not customer details, private notes or local inventory previews.

## Search and sharing

The build generates 82 HTML entry pages, including 65 individual project and apartment pages. Each has a canonical URL, relevant title/description and social preview. The sitemap contains 67 public routes. Workspace, shortlist and presentation pages carry `noindex,follow` metadata.

Clean routes such as `/Artwin/projects/tokyo-city/` work on GitHub Pages without an SPA fallback. Existing `#/projects/...` and shared shortlist links still work and are normalised in the browser. Static Russian content and links are available before JavaScript loads. This improves crawlability; it does not guarantee indexing or rankings.

## Local sales workspace

The footer's **Sales workspace** includes a form editor for inventory, translated document references and dated project records; validation, record editing/removal, JSON export and local preview; and a saved pilot checklist with export. The existing local interaction counter remains off by default and records no personal or payment details.

This is a public demonstration interface, not an authenticated CMS. It cannot publish changes or access Artwin systems. `public/sales-data.json` remains empty. Verification records are removed after checks and never enter published data.

## Five-minute demonstration

1. Open Tokyo City on a phone, jump to compact plans, expand filters and save two options.
2. Show Wilton Park's gallery and facilities, then add one of its apartments to a presentation.
3. Compare three apartments. Open a tour, hide furniture to reveal the space and switch the lighting.
4. Generate a branded proposal and open its QR link on a phone.
5. Show the local data editor and pilot checklist. Explain the proposed rollout and the records needed to measure it.

Suggested pilot measures: qualified inquiry rate, attended consultation rate and consultant time per inquiry. Agree definitions and record a baseline before evaluating changes. Browser interactions are not apartment sales.

## Still requires Artwin

Exact drawings and delivered specifications; approved prices, unit availability and handover dates; authenticated publishing; CRM access, consultant assignment and calendar integration; verified current construction records; shared analytics configuration and actual lead/sales outcomes. No placeholder data is presented as approved information.

## Media maintenance

`src/projectMedia.js` retains each original public CDN URL; gallery UI links to the official project page. Images are optimised WebP, at most 1440 by 1000 pixels. Rebuild the selected assets with `python scripts/prepare-project-media.py` (Pillow and network required). Review official material before changing captions or claiming delivery of a facility or finish.

## Verification

- 128 automated tests covering all 55 apartment configurations, translations, route compatibility, media provenance and commercial wording.
- Build and strict Pages-style checks for 65 project/apartment pages, 55 furnished previews and 48 gallery assets.
- Browser checks at mobile and desktop sizes in all four languages: galleries, filters, navigation restoration, presentations, cross-project selections, local editing and downloads.
- Furniture and lighting controls exercised in four representative apartments from Tokyo City, London Square and Wilton Park.
- Three-page A4 proposal rendered and visually inspected, with one QR image per page.

Browser checks use Chromium and do not replace physical iOS/Android testing. Real sales performance remains unmeasured.
