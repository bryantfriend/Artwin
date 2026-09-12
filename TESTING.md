# Verification — 12 September 2026

Tested locally on Windows with Node 22.14.0, npm 11.2.0, Chromium via Playwright CLI 0.1.19, and the **production `dist` build served at `http://127.0.0.1:4173/Artwin/`**. The static verification server rejects unknown paths instead of rewriting them to the app.

## Passed

- `npm ci --no-fund --no-audit`: clean installation from `package-lock.json`.
- `npm ls --depth=0`: all declared packages installed without peer-dependency errors.
- `npm test`: **9 tests**, including actual Rapier WASM checks for every configured destination, closed/open door passage, backing away after contact, wall sliding, and grounding.
- `npm run build`: production application built successfully.
- `npm run check:dist`: all **5 built asset files** and **3 HTML asset references** served successfully under `/Artwin/`. Root and missing asset/room paths return 404.
- Desktop browser: furnished dollhouse, keyboard movement after entering, pause/resume, all **11 room destinations**, closed door obstruction, open door passage, repeated interaction during animation, kitchen light toggle, TV toggle, entrance recovery, mode switch with a held movement key, keyboard help dismissal.
- Desktop normal-load request monitoring: **no failed requests, HTTP errors, or console/runtime errors**. Every requested application asset remained below `/Artwin/`; no remote model, texture, font, or WASM request occurred.
- Touchscreen emulation: portrait layout, simultaneous joystick movement and second-finger looking, input release, touch cancellation, room selection, landscape resizing, and quality selection. The test closes the floor-plan overlay before using the controls beneath it.
- Separate fault-injection checks: no automatic pointer lock; simulated pointer-lock and fullscreen refusal show fallback messages; simulated blur pauses; cabinet opening animation works; graphics-context loss shows recovery; a failed lazy scene download is caught by the loading boundary; restoring assets and reloading succeeds.
- Visual inspection of the generated dollhouse, living/kitchen and bedroom interiors, light-on/light-off views, cabinet interaction, and mobile screenshots. Layout was checked against the supplied four-room reference. The result is an approximate procedural reconstruction.
- Live publication: commit `2517c0e` was pushed to `main`, and [GitHub Actions build and Pages deployment succeeded](https://github.com/bryantfriend/Artwin/actions/runs/34691769295). A browser check of [the published site](https://bryantfriend.github.io/Artwin/) returned HTTP 200, loaded all assets and physics without failed requests or console errors, entered walkthrough mode, and navigated to the primary bedroom.

Two upstream deprecation warnings remain in normal runs: Three.js's `Clock` (used by React Three Fiber) and Rapier's compatibility initializer. Neither is a runtime error or asset-load failure. The deliberate fault-injection run produces expected errors that are separate from the clean normal-load checks.

## Evidence

Screenshots are in the local, gitignored `output/playwright/` folder:

- `dollhouse.png`
- `living.png`, `kitchen.png`, `primary.png`
- `light-on.png`, `light-off.png`, `television.png`, `cabinet-open.png`
- `mobile-dollhouse.png`, `mobile-walkthrough.png`, `mobile-landscape.png`
- `graphics-recovery.png`, `asset-recovery.png`

Reproduce the browser checks using the commands in README. The production physics chunk is approximately 2.24 MB minified (0.84 MB gzip); it contains embedded WASM. The initial application shell is approximately 217 KB minified (69 KB gzip), and the viewer/Three.js load separately.

## Not claimed or not tested

- The live check covered loading, walkthrough entry, and room navigation. The broader interaction and failure-injection suite above was run against the matching local production build.
- No physical phone, Safari, Firefox, device-specific FPS benchmark, or construction-dimension survey was tested.
- The occupied-door-swing guard is tested at the geometry level, and door contact/retreat and repeated animation are tested in the browser. Exhaustive player/door corner cases are not claimed.
- The rejection path for an obstructed relocation is implemented against live colliders; the automated destination tests confirm the shipped destinations are clear. Arbitrarily edited/obstructed destinations were not injected in the browser.
- No separate linter is configured; production compilation and focused Node/browser tests are the available checks.

## Furnished-reference revision — 12 September 2026

Reoriented the overview and beds to the furnished reference. Added two brown striped bed covers and one white upholstered bed, padded gray and black/gold marble feature walls, gray pleated curtains, a black TV partition, an eight-chair oval dining set, a separate kitchen breakfast table, marble kitchen flooring, round brass bathroom mirrors, and paired coffee tables. Materials and geometry remain generated locally with no external asset downloads.

After the revision, all nine Node layout/physics tests, the production build and subpath asset check passed. The desktop browser suite passed all eleven room destinations, door collisions/interactions, lights, TV, pause and recovery. The mobile Chromium suite passed touch movement/look, cancellation, room navigation and orientation changes. Both normal browser runs had no console errors or failed requests. The two documented upstream deprecation warnings remain. The wall-sliding test now uses the clear wall segment before the added bedside table; its wall contact and floor assertions are retained.

## Guided tour and material refinement — 12 September 2026

Added a six-stop guided tour with composed room views, timed advancement, pause/resume, previous/next, direct stop selection, completion/replay, Escape pause and handoff into room exploration. Reduced-motion settings start the tour paused and suppress scene fades. Playback is suspended while help is open, the document is hidden or graphics recovery is active.

Rendering now uses a locally generated Three.js RoomEnvironment/PMREM lighting map, physical surface finishes, fabric bump maps, shaped pillows, continuous draped bedding, folded curtain geometry, softened sofa geometry and detailed bedside cabinets. High quality casts interior shadows from the active room light. No new dependencies, remote models or hosted textures were introduced.

Verification: nine Node layout/physics tests passed; production build and /Artwin/ asset checks passed. Desktop walkthrough, mobile touch and recovery suites passed. The tour browser suite checks all six stops, automatic advancement, pause, completion/replay, Escape, mobile layout, room handoff, exit and reduced motion. All six desktop tour views and the mobile tour card were visually reviewed. Tests use Chromium emulation, not physical phones; photographic fidelity and device-wide frame-rate guarantees are not claimed.

## Decorative styling — 12 September 2026

Reviewed the six guided interior views with wall art, patterned rugs, tabletop accessories and layered curtains. The guided-tour suite passed with no console errors or failed requests. The production build and /Artwin/ asset check passed. Decorative texture generation adds no remote requests. Added décor is placed on existing surfaces or against walls and retains the existing collision layout; rug fringe uses instancing. Physical-device performance is not claimed.

## Bathroom fixtures — 12 September 2026

The upgraded sinks, live mirrors and shower passed production compilation, subpath asset checks and all nine layout/physics tests. Browser verification covered the bathroom tour view, repeated navigation between all three bathrooms, shower orientation and Light-quality mirrors at a 390 px viewport, with no errors or failed requests. Close-up screenshots were reviewed. Only the active bathroom has a live reflection; quality controls its render resolution. No physical-phone frame-rate claim is made.

## Kyrgyz panorama — 13 September 2026

Production build and /Artwin/ checks passed. The six-stop guided-tour suite passed on desktop and mobile emulation with no console errors or failed requests. After adjusting the horizon, living-room and Bedroom 02 screenshots were reviewed and the 390 px layout checked; the panorama returned successfully beneath /Artwin/textures/. The existing Three.Clock and Rapier deprecation warnings remain. The panorama is illustrative, not a surveyed property view or explorable exterior.

## Animated television — 13 September 2026

The production build and /Artwin/ asset check passed. The TV browser test compares rendered frames: on-state frames differ, off-state frames stay identical, switching on again restarts the scene, and reduced-motion frames stay identical. Close-up frames were visually reviewed for screen fit and moving clouds/boat. No console errors, failed requests or HTTP errors occurred.

## Hall reference refinement — 13 September 2026

All nine layout/physics tests passed after rotating the storage unit toward the entrance. The production browser smoke suite passed all 11 room destinations, door movement/collisions, entrance recovery, light and TV interactions, and resource checks with no errors or failed requests. Hall walkthrough and dollhouse screenshots were inspected. Production build and /Artwin/ asset checks passed. Three.Clock, Rapier initialization and SVGLoader.createShapes emit library deprecation warnings.

## Living-room woven rug — 13 September 2026

Production build and /Artwin/ checks passed. Floor-level desktop and 390 px mobile screenshots were reviewed for continuous woven texture, band direction and bound edges. The browser check reported no runtime/console errors, failed requests or HTTP errors. Walking layout and furniture collision footprints are unchanged.

## Half-circle bathroom mirrors — 13 September 2026

Production build and /Artwin/ checks passed. Bathroom browser verification covered live reflections, repeated navigation among all three bathrooms, the shower and mobile Light quality, with no errors or failed requests. Both hall bathroom mirrors were visually reviewed; gray panels sit in front of the wall finish and taps remain in front of the panels. The en-suite retains its round mirror.

## Kitchen marble floor — 13 September 2026

Production build and /Artwin/ asset checks passed. Kitchen floor screenshots at desktop and 390 px mobile widths were checked for tile scale, grout and gray veining. Browser verification returned no runtime/console errors, failed requests or HTTP errors. Floor and collision geometry remain unchanged.
