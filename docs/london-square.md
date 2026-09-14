# London Square reconstruction

Source checked 14 September 2026: [official London Square page](https://artwin.kg/london-square).

The user provided the two presentation-board screenshots. Higher-resolution versions were used to read room boundaries and dimensions:

- [71.95 and 110.13 m² presentation board](https://static.tildacdn.one/tild3130-3666-4266-b435-333832363566/LONDON_SQUARE__.png)
- [131.20 and 100.72 m² presentation board](https://static.tildacdn.one/tild3635-6539-4565-b564-383961343361/LONDON_SQUARE__.png)

These are approximate furnished visualizations, not official construction drawings. Advertised total areas are preserved. No room areas, sales inventory, floor availability, prices or delivery dates are inferred. Coordinates are traced and adjusted for clear virtual walking paths; they must not be used as construction measurements. The images show a second-floor key plan; that is a reference location, not a claim of current availability.

| Layout | Furnished sleeping rooms | Bathroom spaces | Notable arrangement |
| --- | --- | --- | --- |
| 71.95 m² | 1 | 1 | Separate kitchen/dining and living rooms; loggia |
| 100.72 m² | 3 | 2 | Open living/kitchen; three furnished sleeping rooms; dressing room |
| 110.13 m² | 2 | 3 | Corner living/dining; two bedrooms; compact en suite WC |
| 131.20 m² | 3 | 3 | Polygonal bay living room; three bedrooms; central hall |

The 100.72 board is titled “3-комнатная студия” but its furnished illustration shows three beds plus a living space. The app uses the neutral title “Studio residence” and counts the furnished sleeping rooms shown, rather than silently dropping a room. Unlabelled wet-room functions are interpreted from both drawings and furnished views. Compact rooms are represented as WC/vanity spaces where a shower would obstruct access. Artwin should confirm these classifications against its approved plans before using the app as a definitive sales specification.

London Square uses pale parquet, ivory seating, green curtains, rust/forest/navy bedding accents and patterned bathroom flooring. Materials are generated locally, with no new runtime asset service. Existing chandeliers, TV animation, mirrors, room controls and exterior views are reused.

The bay walls share the same start, angle and openings between the SVG floor plan, 3D meshes and Rapier colliders. Tests cover all room destinations with doors open/closed, connected walking paths, furniture footprints, door-leaf clearance and toilet orientation. Gallery images are screenshots of the actual models, regenerated with `scripts/capture-london-previews.js` against the production subpath server.

Project features paraphrased from the official page include English-inspired architecture, panoramic windows, a landscaped private courtyard, underground parking, individual gas heating, stroller storage and a mother-and-child room. Links for consultation continue to use Artwin's official scheduling page.

## Validation

- 64 Node tests pass, including Tokyo City regression tests and actual Rapier destination queries.
- Production build and strict `/Artwin/` asset checks pass for all ten model previews.
- Playwright visited all 29 London Square room destinations and all 18 guided-tour stops; no page/console errors or missing assets were detected. Existing Three.js/Rapier dependency deprecation warnings remain.
- At 390 × 844, all four collapsed gallery cards are 258 px tall, tour controls are 88 px tall, the back link is visible, and the page has no horizontal overflow. All four language choices and expandable plan details were checked.
