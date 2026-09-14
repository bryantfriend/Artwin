# Official project catalog

References reviewed on 14 September 2026. This collection models published layout choices, not available units or current sales inventory. Published apartment totals are preserved; inferred room areas are not displayed.

| Project | Published choices added | Primary source |
| --- | ---: | --- |
| Urpaq Park | 9, including two mirrored pairs | https://artwin.kg/urpaq-park |
| Hayat | 5 | https://artwin.kg/hayat |
| Esentai | 10 | https://artwin.kg/esentai |
| Tokyo | 7 | https://artwin.kg/tokyo |
| Boston Tower | 11 | https://artwin.kg/page31279315.html |
| Seoul | 12 commercial floor drawings | https://artwin.kg/seoul |
| French House | Drawings available by enquiry; none published on the current page | https://artwin.kg/page31314850.html |

The five residential collections add 42 furnished apartments to the previous 13. Seoul uses a separate commercial floor browser. French House has project information, location tools and official consultation/contact links without fabricated apartment drawings.

`src/referenceSources.json` records the original CDN URL, page record and local reference image. WebP versions preserve the original presentation boards, including their original Russian labels. Buyers can open these from the enlarged apartment preview. Seoul floor source images are ordered by their printed floor number: the source gallery places floor 12 first and floor 10 before floor 9.

Most residential boundaries are traced from raster drawings. Furniture, finishes, small shafts and wall thicknesses are approximations. Tokyo publishes furnished perspectives in its gallery rather than dimensioned drawings: its schematic plans are explicitly labelled reconstructions. Names and bedroom filters describe the furnished sleeping rooms; they do not infer sales inventory from a marketing room-count label. Duplicate screenshots of the same plan are not separate units.

No historic prices, time-limited deposit offers, unconfirmed completion dates or stock counts have been imported. Official brochure links are supplied for Seoul and Boston Tower. Project facilities are paraphrased from Artwin's published descriptions and remain attributable to those pages.

## Rebuild and verify

1. Edit source coordinates in `scripts/specs-*.mjs`. Coordinates for traced drawings are pixels, converted using the declared approximate scale. Tokyo's perspective reconstructions use metres.
2. Run `node scripts/compile-catalog.mjs`. Furnishing and door placement are computed offline. The compiler requires a connected walking route to every room before writing `src/layouts/generated/catalog.js` and `src/catalogPlans.js`. Diagnostics go to the ignored `output/` folder. `PLAN=<id fragment>` restricts a diagnostic run and does not replace the shipped catalog.
3. Run `npm test` and `npm run build`. Serve `dist` with `node scripts/serve-pages.mjs` at `/Artwin/`.
4. Run `node scripts/prepare-catalog-qa.mjs`, then execute each generated `output/capture-<project>.js` through Playwright CLI `run-code --filename`. This captures actual furnished models into `public/plans/` and checks tour navigation. Rebuild after updating these images.
5. Run `npm run check:dist` and `scripts/check-catalog-browser.js` through Playwright CLI. Review the captured models and representative room screenshots, including mobile layouts.

The generated geometry avoids running the furniture search on a visitor's device. Existing physics, mirror performance, dining chandeliers, multilingual UI, compact mobile cards, contact links, shortlist and comparison flows are reused.
