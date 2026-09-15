# Shared interior finish update

This pass improves the existing furnished visualizations; it does not change the official floor plans or imply that these finishes are delivered with a purchase.

- Locally hosted CC0 wood grain and fabric normal/roughness maps replace flat joinery and the coarse generated upholstery bump pattern. See `public/textures/interiors/ATTRIBUTION.md` for sources.
- Sofas and pillows have shaped cushions, fine piping and small seam creases. Duvets have broad cloth folds, side/foot overhang and quieter bedding colors. Geometry checks cover every catalog bed size.
- Stone counters use clouded, branching marble without floor-tile grout lines. Kitchen counters have an actual opening, recessed metal sink and curved faucet. Dinnerware has a shallow ceramic bowl and thin dark rim. Houseplants have tapered pots and curved leaves with stems.
- Soft contact overlays ground floor-standing furniture even in Light mode. They do not intercept interaction rays or add physics colliders.
- Interior ceilings cast shadows in High mode. Only the current room's ceiling light illuminates the walkthrough, preventing unshadowed lights in neighboring rooms leaking through walls. Environment fill is lower indoors, with AgX tone mapping to control bright highlights.
- Four shared 1K material maps total about 1.6 MB. They load inside the apartment viewer's existing loading boundary; the homepage does not request them. Browser-cached source textures are cloned per material set, and the owned textures/geometries are disposed on unmount.

Run `node scripts/prepare-interior-previews.mjs`, then the generated batches with `playwright-cli run-code --filename output/playwright/interior-preview-batch-N.js` to refresh the 55 apartment gallery previews. The production subpath server must run on port 4174. Batches also capture representative guided-tour views for visual review.

Validation: `npm test`, `npm run build`, `npm run check:dist`, and `scripts/browser-interiors.js` via Playwright. Review bedroom/living/bathroom, warm-evening and mobile Light-mode captures before publication.
