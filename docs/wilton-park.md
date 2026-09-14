# Wilton Park reconstruction

Source checked 14 September 2026: [official Wilton Park page](https://artwin.kg/wilton).

The four supplied screenshots contain three unique plans. The final screenshot repeats the 82.60 m² apartment. Higher-resolution official presentation boards were used to trace the room boundaries:

- [82.60 m² board](https://static.tildacdn.one/tild3234-3634-4037-b034-616234363431/plan-3.jpeg)
- [92.70 m² board](https://static.tildacdn.one/tild3035-6466-4961-a435-323665343361/3kom.jpeg)
- [122.10 m² board](https://static.tildacdn.one/tild6632-3063-4461-a231-623935333736/4kom.jpeg)

| Plan | Bedrooms | Bathroom spaces | Arrangement |
| --- | --- | --- | --- |
| 82.60 m² | 1 | 2 | Separate living room and kitchen; six dining chairs; storage |
| 92.70 m² | 2 | 2 | Open kitchen/living space; round dining table; long balcony |
| 122.10 m² | 3 | 2 | Open kitchen/living space; three bedrooms around a central hall |

These are approximate furnished visualizations, not official construction drawings. Total advertised areas are preserved; unconfirmed room areas are omitted. Geometry, furniture and door swings are adjusted for clear virtual walking paths. Compact secondary spaces in the 82.60 and 92.70 plans are interpreted as WC/vanity and storage spaces. Artwin should confirm these functions against approved drawings before treating the app as a definitive specification. The ninth-floor key map in the boards does not establish current availability, prices or stock.

Wilton's theme uses pale warm timber flooring, light curtains, blue dining chairs, neutral sofas, dark storage and grey/brown bedding. Round tables have four inset settings, a bowl of borsok and a centered warm chandelier in walkthrough and tour modes. The existing six-seat table, city/mountain backdrop, animated TVs, interactive mirrors and room controls are reused. Materials are generated locally; no new runtime asset service is required.

The balcony has open metal railings with matching collision geometry, no ceiling or indoor ceiling light, a glazed bedroom wall, seating and a dedicated tour stop. The panorama blends into the sky and ground without exposed image edges. The 2D plan shows its railings distinctly. Gallery badges describe the actual outdoor space; plans without a loggia no longer advertise one.

All three plans participate in the existing translated gallery, finder, comparisons, saved plans, family shortlist, furniture planning and consultation/WhatsApp tools. Sales inventory remains empty pending approved Artwin data.

## Verification

Run `npm test`, `npm run build` and `npm run check:dist`. The Wilton tests check plan identity, furniture counts, room containment, connected walking routes, open-door clearance and balcony boundaries. Shared tests cover all toilet orientations, dining fixtures, translations and Rapier capsule destinations with doors open/closed; an additional physics check walks into the balcony rail.

All 80 Node tests pass. Production checks cover 13 model previews. At 390 × 844, the three collapsed cards are 258 px tall and tour controls are 88 px tall, with no horizontal overflow.

With the strict `/Artwin/` server running, use Playwright CLI:

```sh
npx --no-install --package @playwright/cli playwright-cli -s=artwin run-code --filename scripts/capture-wilton-previews.js
npm run build
npx --no-install --package @playwright/cli playwright-cli -s=artwin run-code --filename scripts/check-wilton-browser.js
```

Previews are actual rendered model screenshots. The browser script visits all 22 room destinations and 15 tour stops, checks all four languages, mobile back navigation, collapsed/expanded floorplan cards and compact tour controls, and rejects console errors or missing assets. It does not submit consultations or send WhatsApp messages.
