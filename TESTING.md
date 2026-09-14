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

## Mirror entry performance and orientation — 13 September 2026

The right-hand hall mirror was visually checked after flipping. The new browser regression script measures first entry after reload and repeated hall/bathroom transitions, failing for a frame gap over 2 seconds. Bathroom-entry maximum gaps in the final local run were 139, 111, 146 and 125 ms, with no errors or failed requests; mobile Light quality and room-switching reflection checks passed. These are test-browser observations, not an all-device guarantee. The attempted pre-change timing run was interrupted by a graphics/loading stall, so no numerical before/after speedup is claimed. Render targets persist across room changes; changing quality or unmounting still disposes them.

## Compact mobile tour and tabletop styling — 13 September 2026

Production build and /Artwin/ asset checks passed. The existing guided-tour suite passed all six views, automatic advancement, pause, completion/replay, Escape, room handoff, exit and reduced motion. Additional Chromium checks at 320 × 740, 390 × 844 and 844 × 390 measured an 88 px tour card with at least 44 × 44 px action targets and no horizontal overflow. Mobile previous/next, count updates, play/pause, explore and exit worked. Dining-table borsok bowls and kitchen chair/drape clearance were visually reviewed in walkthrough close-ups. There were no runtime/console errors, failed requests or HTTP errors; the existing Three.Clock and Rapier deprecation warnings remain. Checks used browser emulation, not physical phones.

## Project collection shell — 13 September 2026

The home page now presents the ten project cards listed in Artwin's official directory, with locally bundled WebP images, city filtering, search and project overviews. Tokyo City has the existing 134.68 m² floor plan and apartment; the other nine projects have explicit unavailable-preview states. No other models, prices, floor assignments or inventory are claimed.

All 11 Node tests passed, covering existing layout/physics and new route isolation. The production build and strict /Artwin/ asset check passed, including all ten project images. The collection browser suite covered every project and image, filters, search/empty results, the Tokyo City apartment/tour handoff, leaving and remounting the viewer, Back/Forward, deep-link refresh, unknown-route recovery, and 390/320 px layouts. It confirmed no apartment/Three/physics chunks were requested before opening an apartment. The navigation handoff used Light quality; desktop and mobile screenshots were reviewed. There were no runtime/console errors, failed requests or HTTP errors in the completed run.

Browser automation now waits for client-side page changes and explicitly reloads apartment deep links for a fresh test session; navigating to the same fragment does not reset apartment state. Earlier attempts timed out around tour entry or raced a detached image while the route changed. A separate fresh-document tour-entry probe completed the click in 425 ms; graphics initialization and shader work still produce multi-second tasks on this test machine, so no startup-performance or physical-device guarantee is made.

The existing six-stop guided-tour regression suite also passed in High quality: all composed views, automatic advance, pause, completion/replay, Escape, room handoff, mobile controls, exit and reduced motion. It reported no console errors or failed requests; the existing Three.Clock and Rapier deprecation warnings remain.

## Six Tokyo City apartments — 13 September 2026

Added five distinct furnished layouts from the new references (52.10, 70.33, 78.83, 82.30 and 106.01 m²), alongside the original 134.68 m² residence. The duplicated 82.30 screenshot is represented once. The catalog supports bedroom filters and unique floor-plan previews and deep links.

All 27 Node tests passed. New checks cover plan metadata and route isolation, furniture footprints within rooms, a connected walking path from the hall to every room with doors open, door/furniture clearance, and actual Rapier capsule queries for all 38 new room destinations with doors both open and closed. The production build and strict `/Artwin/` asset check passed; the Pages workflow and locked dependencies remain unchanged.

The desktop browser suite opened all five apartments, verified their room counts and advertised areas, selected all 38 destinations, exercised all 20 tour stops, and switched between plans without retaining an extra canvas. It reported no runtime/console errors, failed requests or HTTP errors. Dollhouse and interior screenshots were reviewed. One bathroom screenshot initially captured the dark tour-transition overlay; a settled follow-up showed the room correctly. Screenshot checks now wait for the fade to complete rather than assuming a fixed rendering delay.

The original apartment's desktop regression suite passed all 11 destinations, keyboard movement/pause, closed/open door collisions, repeated door interactions, light switch, animated TV, entrance recovery, mode changes, help and subpath resources. Mobile Chromium emulation checked the six-card collection at 320 and 390 px, bedroom filters, the 52.10 and 82.30 apartments, tour stepping and room handoff, floor-plan selection and closure, landscape resizing and viewer cleanup. Both mobile tour cards measured 88 px tall; there was no horizontal overflow, runtime/console error or failed request.

These checks use a desktop browser and touchscreen emulation, not physical phones. Existing upstream deprecation warnings remain. Initial shader work can delay a scene transition on this machine; no device-wide startup or frame-rate guarantee is claimed. Geometry and furnishings remain approximate reconstructions, with some door positions and furniture clearances adapted for navigation.

## Multilingual showcase and consultations — 13 September 2026

The Tokyo City gallery now pairs each of its six 2D plans with a screenshot captured from that exact 3D apartment. It supports enlarged previews, bedroom/area filtering, area sorting, local favorites and comparison of two or three plans. The collection includes Russian (default), Kyrgyz, US English and Simplified Chinese, a consultation popup with ten project slides, a project consultation page with twelve published active consultants, and verified Artwin social destinations. The design review documents twenty official builder websites in `docs/design-research.md`.

All **34 Node tests passed**, including translation completeness/interpolation, all dynamic project/room/door/tour strings, consultation route isolation, combined filters, area boundaries, non-mutating sorting and the existing geometry/Rapier collision checks. The production build and strict `/Artwin/` check passed for seven generated assets, four HTML references, ten project images, six previews, twelve consultant portraits, logo and panorama. Unknown paths still return 404; navigation uses hashes and does not require rewrites.

`scripts/browser-experience.js` passed Russian first load, all four language choices and persistence, ten slideshow images and timed/manual playback, popup dismissal/CTA, all ten consultation project choices, twelve loaded consultant portraits, the exact six social links, six distinct local model previews, combined filtering/sorting, empty-state recovery, persisted favorites, the three-plan comparison limit, enlarged previews and keyboard focus restoration. Gallery/header bounds were checked at 320, 390, 768, 1051, 1201 and 1440 px in every language. Collection browsing did not request the apartment, Three.js or physics chunks. There were no runtime/console errors or failed assets in the completed run.

`scripts/browser-languages.js` passed on the 52.10 and original 134.68 m² apartments. Room selectors, room navigation, help, tour titles and controls changed in all four languages; changing language preserved walkthrough mode. Guided tours retained an **88 px** mobile card and action targets of at least **44 × 44 px**, without horizontal overflow, at 320 × 740, 390 × 844 and 844 × 390. Reduced-motion mode paused the welcome slideshow. Both viewers unmounted when leaving their routes. No runtime/console errors or failed assets were reported.

The original apartment smoke suite passed keyboard movement/pause, all eleven room destinations, closed/open door collisions, repeated door interactions, light and TV interactions, entrance recovery, mode changes, help and subpath resources. A separate deliberate viewer-chunk failure confirmed that its recovery text updates through all four languages and that restoring the request allows normal loading again. Mobile comparison scrolling was checked with the keyboard, and its sideways-scroll guidance and sticky metric labels were visually inspected.

Desktop/mobile screenshots of the welcome popup, gallery, enlarged previews, comparison, consultant page and translated tours were reviewed. A narrow Kyrgyz footer overflow found during testing was corrected. One preliminary smoke run started from an older open document after a rebuild and attempted an obsolete hashed chunk; repeating from a fresh document passed. Deliberate fault-injection errors and the existing Three.Clock/Rapier/SVGLoader deprecation warnings are separate from normal-load errors. These checks use desktop Chrome and resized/emulated viewports, not physical phones. No booking was submitted and no WhatsApp message was sent.

## Reference seating, wardrobes and chandeliers — 13 September 2026

The 52.10 m² living room now has a gray sofa alongside the dining table, an oval coffee table in front, and the TV on the opposing wall. The former TV corner is clear. All freestanding wardrobes use detailed paired doors and silver handles, with matte black on the dark units. Eight table-aligned chandeliers cover the six apartments in walkthrough and guided-tour modes.

All **36 Node tests passed**, including fixture coverage, tabletop centers and extents, room boundaries, sofa/TV alignment, the cleared corner, furniture separation, connected walking paths, door sweeps and actual Rapier capsule checks. The five additional apartments passed all 38 room destinations and all 20 guided-tour views with no runtime/console errors, failed requests or missing assets. The original apartment smoke suite passed its 11 destinations, movement/pause, door collisions, repeated interactions, light and animated TV controls, recovery, help and subpath checks.

The dining browser check captured all eight chandeliers in High quality, reviewed the new sofa/coffee table and black wardrobe, and switched the original kitchen light off and back on. Its 390 × 844 Light-quality tour check passed without horizontal overflow or runtime/asset errors. The relocated 52.10 TV was reached using keyboard movement and switched on to show its SVG animation. Fixtures are hidden in dollhouse views and use non-shadow-casting warm lights; no frame-rate improvement or physical-phone performance claim is made. Existing upstream deprecation warnings remain.

All six gallery previews were recaptured from the updated production models. The final build and strict `/Artwin/` asset check passed, including the refreshed previews. A focused 52.10 rerun passed the TV and mobile checks after the test explicitly returned to dollhouse mode when revisiting the same hash route.

## Mobile return navigation, official booking and bathroom orientation — 14 September 2026

All **37 Node tests passed**. The new bathroom check covers all ten existing toilets across the six layouts: the cistern faces a nearby wall, the modeled footprint clears other fixtures and walls, and the bowl faces a clear approach zone. Existing room connectivity, door sweep and Rapier capsule checks also passed. The compact 82.30 m² en suite has an outward-opening door and adjusted nearby storage; a browser check opened that door from inside and walked into the bedroom.

All twelve bathroom destinations were opened in the production viewer and screenshots reviewed. Mobile back navigation was checked in a 320 px dollhouse view, 390 px walkthrough and 844 × 390 landscape tour, including all four languages. The visible back link returned to Tokyo City's six-plan gallery and unmounted the viewer, with no horizontal overflow and a touch target of at least 44 × 44 px.

Consultation buttons now link directly to `https://artwin.kg/schedule-call`. The welcome CTA and legacy consultation hash redirects were checked by intercepting the official destination with a minimal test response: this verifies navigation without submitting a booking or loading external trackers. The collection browser suite passed language switching, slideshow, all six previews, filtering, sorting, favorites, comparison, social links and responsive layouts. Completed checks reported no runtime/console errors or missing requests/assets. Existing upstream deprecation warnings remain. These checks use desktop Chrome with resized viewports, not physical phones.

All six 3D preview assets were refreshed. The final production build and strict `/Artwin/` asset check passed; unknown paths still return 404 and no server-side rewrites are used.
