# Artwin apartment walkthrough

A client-side React + Vite + Three.js reconstruction of the supplied **four-room, 134.68 m²** apartment reference. Three bedrooms, a separate kitchen/dining space, living room, central hall, three bathroom spaces, and two loggias. No server, account, database, SSR, remote model, or hosted texture service is required.

**[Open the live apartment walkthrough](https://bryantfriend.github.io/Artwin/)**

The older pasted 52.10 m² brief is not the reference for this implementation. The subsequently supplied four-room image is.

## Run locally

Use **Node.js 22.12 or later** (Node 22 LTS is used by CI) and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/Artwin/`.

```sh
npm test
npm run build
npm run check:dist
npm run serve:pages
```

Open `http://127.0.0.1:4173/Artwin/` for the production verification server. It serves only `dist` under the repository subpath and returns **404** for unknown paths. It does not use SPA rewrites. This local test server is not uploaded or used by the application.

Alternatively, `npm run preview` starts Vite's production preview at the same address. Stop an existing preview before starting another on port 4173.

## GitHub Pages activation

GitHub Pages is enabled with **GitHub Actions** as its source. The [initial deployment succeeded](https://github.com/bryantfriend/Artwin/actions/runs/34691769295), and the live viewer was checked in a browser. The following steps describe setup for a new copy or reactivation; this repository is already activated.

1. Commit these files, including `package-lock.json`, and push them to the repository's default branch. The initial local branch is `main`:

   ```sh
   git add .
   git commit -m "Build apartment walkthrough and configure GitHub Pages"
   git push -u origin main
   ```

2. In [repository Settings → Pages](https://github.com/bryantfriend/Artwin/settings/pages), choose **Build and deployment → Source → GitHub Actions**.
3. Under **Settings → Actions → General**, allow the official `actions/*` actions used by the workflow. Any organization policy must also allow them. No personal access token or deployment secret is needed by the workflow: it uses the built-in `GITHUB_TOKEN` and OIDC permissions.
4. If the `github-pages` environment has branch restrictions, permit the default branch. If required reviewers are configured, approve the deployment when GitHub requests it.
5. Open **Actions → Build and deploy Artwin to GitHub Pages → Run workflow**, select the default branch, and run it. A new push to the default branch also starts it. If the first run preceded enabling Pages, rerun it after step 2.
6. Wait for both **build** and **deploy** jobs to succeed. Use the URL shown by the deployment environment and verify the app there. The expected address, without a custom domain, is [bryantfriend.github.io/Artwin/](https://bryantfriend.github.io/Artwin/).

`.github/workflows/pages.yml` uses `npm ci`, runs the configuration/physics tests, builds `dist`, checks subpath assets, and uploads/deploys with official `configure-pages`, `upload-pages-artifact`, and `deploy-pages` actions. Actions are pinned to immutable commit SHAs. The default-branch condition is read from the GitHub event, so it follows future branch renames. Pushes to other branches produce a skipped build; manual runs must select the default branch as well. Deployment permissions are restricted to the deployment job.

## Base paths and assets

`vite.config.js` explicitly sets `base: '/Artwin/'`. Case matters. Change it if the repository is renamed; use `/` for a user site or a custom domain served at its root, and update the strict preview/check scripts accordingly.

- Vite rewrites imported JS, CSS, and dynamic chunks beneath `/Artwin/assets/`.
- The favicon uses `%BASE_URL%` in `index.html`.
- Wood and stone textures are generated deterministically in the browser. There are no texture URL requests.
- All furniture is actual procedural geometry. There are no required GLB downloads.
- `@react-three/rapier` uses the locked `@dimforge/rapier3d-compat` package. Its WASM bytes are embedded in the locally built physics JS chunk, so no WASM CDN or root-relative `.wasm` request is needed.
- Three.js and physics have separate chunks so an interface edit need not invalidate those large assets.
- For future file assets, prefer `import modelUrl from './assets/model.glb?url'`. For files in `public`, use `${import.meta.env.BASE_URL}models/model.glb`, never `/models/model.glb`. Apply the same rule to future WASM URLs, audio, and textures.
- Room selection and viewing modes use React state. They do not change the URL or require a router/404 rewrite.

See [Vite's Pages deployment guidance](https://vite.dev/guide/static-deploy.html#github-pages).

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Orbit / zoom | Drag / scroll in Dollhouse | Drag / pinch |
| Walk | WASD or arrow keys | Left joystick |
| Look | Drag the canvas, or Capture mouse | Drag the scene with another finger |
| Interact | Aim at a nearby object, then E or click the prompt | Aim, then tap Interact or the prompt |
| Pause | Escape; also pauses on focus or pointer-lock loss | Leaving the app clears input |
| Change room | Floor plan or room selector | Floor plan or room selector |
| Recover | Return to entrance | Return to entrance |

Switches are beside bedroom, kitchen, and living-room doorways. The television and the left door of the low living-room cabinet also respond to interaction. A door pauses when the player occupies its swing; step back to let it continue. The exterior entrance door stays closed.

In walkthrough mode, floor-plan navigation fades out, checks the destination against live physics colliders, and relocates the body and camera together. An obstructed destination is rejected with a message. Door, light, cabinet, and TV states survive mode changes during the session. Reloading restores their defaults.

## Organization and editing

| File | Purpose |
| --- | --- |
| `src/apartmentConfig.js` | Room polygons, dimensions, doors, furniture transforms, switches, destinations, camera defaults |
| `src/geometry.js` | Wall segmentation, containment, movement normalization, door poses and swing checks |
| `src/input.js` | Shared mutable input and reset logic |
| `src/physicsController.js` | Shared character-controller setup and grounding, used by the app and tests |
| `src/App.jsx` | UI, mode/interaction state, relocation requests, loading and help |
| `src/scene/Viewer.jsx` | Canvas, orbit camera, scene lighting, interaction ray, error recovery |
| `src/scene/Architecture.jsx` | Floors, ceilings, cutaways, walls, doors, and matching colliders |
| `src/scene/Player.jsx` | Rapier capsule character controller, fixed-step movement, camera following |
| `src/scene/Furniture.jsx` | Reusable procedural furniture and simplified colliders |
| `src/scene/materials.js` | Local deterministic textures, reusable geometry and PBR materials |
| `src/ui/` | Floor plan, touch joystick, inline icons |
| `tests/` | Node tests, including real Rapier WASM collision tests |
| `scripts/` | Static subpath verification server, build asset check, browser smoke checks |

Coordinates use metres: **+X is right on the 2D plan, +Z is down, +Y is up**. The reference's isometric rendering is rotated relative to the plan. Define a shared wall only once. Wall `openings` are measured from the wall start along its positive axis; the same segmentation generates rendering and collisions. A door's opening width, hinge, base angle, and swing sign determine both its visible panel and moving collider.

Change furniture through its stable `id`, `kind`, `position`, `rotation`, and `size` in the config. Size is also the simplified collider footprint: update it if a replacement model is larger. Keep interaction IDs when replacing procedural models with GLBs. Avoid putting destinations near furniture or door sweeps; rerun the tests after layout edits.

## Reconstruction assumptions

- **134.68 m² is an advertised figure, not a measured result of this model.** The approximate room polygons total about **129.08 m²**, including loggias, without an authoritative wall-area accounting. The model is not stretched to force a match.
- The 2D plan determines adjacency: upper-left bedroom, upper-right kitchen and loggia, a central hall and bathroom strip, two lower bedrooms, lower-right living room, and the second loggia below the central bedroom.
- The furnished view informs the neutral upholstery, wood floors, dark wardrobes and cabinetry, stone surfaces, beds, dining furniture, and plants. It is not treated as a dimensioned drawing.
- Small room-area labels and uncertain dimensions were not copied as verified measurements. Window positions, door swings, furniture dimensions, bathroom fixtures, finishes, and concealed details remain estimates.
- Prototype values: 2.7 m ceiling, 1.65 m eye height, 1.5 m/s walking speed. Player capsule radius 0.25 m, cylindrical half-height 0.55 m (1.60 m total height); door clearances are at least 0.90 m before framing.
- Dollhouse lowers selected walls and panels; walkthrough restores their full appearance and ceilings. Full architectural collisions are retained.
- The interface labels the reconstruction as approximate. This is not a construction drawing or a claim about available inventory.

## Manual verification

1. Build and start `npm run serve:pages`. Open `/Artwin/`, not `/`. In DevTools, enable Preserve log on Console and Network, then reload. Check that every JS/CSS/favicon request succeeds beneath `/Artwin/`, including the physics chunk. No external asset service should be contacted.
2. Orbit and zoom; select rooms on the floor plan; reset the view. Check all three beds, kitchen/dining area, living room, bathroom strip, and two loggias against the reference.
3. Step inside. Move using WASD, including diagonal movement into a wall. Confirm sliding, grounding, and obstruction by furniture, windows, and the exterior entrance door.
4. Select Bedroom 02, turn toward its hall door, and approach. A closed door should stop you. Back away from its swing, aim at it, press E, and walk through once it is open. Repeat interactions during animation; stand in its swing and confirm that motion defers until you move away.
5. Aim at the kitchen and bedroom switches, then press E. Confirm fixture appearance and room illumination change. A wall should block interactions with objects behind it. Toggle the living-room television and cabinet.
6. Visit every room using the plan or selector. Return to the entrance. Switch modes while a movement key is down. Release pointer lock, blur the window, and switch browser tabs; movement should pause or clear.
7. Test drag-to-look when pointer lock is refused. Try fullscreen on a browser without support and check the message. Open/close help by keyboard; Tab should remain within its dialog.
8. Emulate a narrow touchscreen. Move with one finger and look with another. Cancel/release touches and check that movement stops. Rotate/resize the viewport, open the plan, navigate, and change quality.
9. Block a viewer chunk in DevTools and reload to check the recovery state. Restore network access before retrying. Test with WebGL disabled to check the graphics fallback.
10. Repeat the subpath/network check at the actual Pages URL **after the deployment succeeds**.

For reproducible desktop browser checks, with the production verification server running:

```sh
npx --yes @playwright/cli@0.1.19 -s=artwin open http://127.0.0.1:4173/Artwin/ --browser chrome
npx --yes @playwright/cli@0.1.19 -s=artwin run-code --filename scripts/browser-smoke.js
npx --yes @playwright/cli@0.1.19 -s=artwin run-code --filename scripts/browser-recovery.js
npx --yes @playwright/cli@0.1.19 -s=artwin-mobile open http://127.0.0.1:4173/Artwin/ --browser chrome --mobile
npx --yes @playwright/cli@0.1.19 -s=artwin-mobile run-code --filename scripts/browser-mobile.js
```

The browser must be available to Playwright. Screenshots are written to `output/playwright/` (gitignored); create that folder before running the browser scripts on a fresh clone. The recovery script deliberately refuses browser permissions, loses the graphics context, and aborts a scene download, then restores the page. Errors during those injected failures are expected. Browser tools are optional local verification tools and are not part of the runtime or Pages upload.

Actual verification results and limits are recorded in [TESTING.md](TESTING.md).

## Assets and limitations

The ARTWIN logo image was supplied by the user and is stored in `public/artwin-logo.png`. The illustrative Kyrgyz city and mountain panorama in `public/textures/kyrgyz-city-panorama.jpg` was AI-generated for this prototype. It is not a verified view from this property. Remaining SVGs, textures, and furniture geometry were created in code. No external models, fonts, apartment-reference image copies, HDR presets, music, tracking, or analytics are included. The supplied apartment screenshot remains the user's design reference; no independent license to republish it is asserted. Third-party library licenses remain with their respective packages.

This is a procedural visual reconstruction, not a photorealistic or dimensionally surveyed model. Bathrooms and decorative details are simplified. Cabinet collision is conservative and does not model shelf contents. The exterior is a distant panoramic backdrop, not an explorable city. There is no save system, jump/sprint, or audio.

Graphics quality depends on the device. Light mode disables shadows and limits pixel ratio. No real-phone or device-wide performance claim is made. The sizeable physics chunk includes WASM by design. Upstream Three.js Clock and Rapier initialization deprecation warnings may appear; they are distinct from runtime errors and failed asset requests.

The furnished-reference revision adds striped brown and white bedding, padded and black/gold feature walls, gray curtains, marble kitchen surfaces, oval dining furniture, round brass mirrors, and a black TV partition. Furniture placement and collision bounds are defined together in `src/apartmentConfig.js`; decorative wall finishes are in `src/scene/Decor.jsx`.


## Guided tour and rendering

Choose **Take a guided tour** from the dollhouse for six composed interior views. Each stop stays on screen for 8.5 seconds; the tour stops at the end. Pause/resume, previous/next, direct stop selection, replay and exit are available. **Explore this room** hands over to the existing collision-checked walkthrough destination. Escape pauses playback. Opening help or hiding the browser tab suspends advancement. Reduced-motion users start with manual playback and no scene fades. Camera positions, framing and copy are in `src/tourConfig.js`. No URL navigation or server is involved.

The existing React Three Fiber, Drei and Three.js packages are reused without new dependencies. Three.js RoomEnvironment and PMREM generate local image-based lighting; fabric bump maps, striped duvet maps and marble/oak finishes are generated in the browser. Pillows, duvet drape, curtain folds and sofa upholstery use shaped geometry. High quality enables shadows in the active interior room; Light quality keeps shadows off. These upgrades improve the procedural model but do not replace Artwin's original architectural models or a photorealistic production render.

Test the guided tour with `npx --yes @playwright/cli@0.1.19 -s=artwin run-code --filename scripts/browser-tour.js` against the production subpath server.

The decorative styling includes eleven framed original abstract/botanical prints, eight patterned rugs and runners, books, vases, flowers, mugs, a fruit bowl, kitchen accessories and bathroom toiletries/towels. Curtains now combine sheers, gathered side panels and brass rails/rings; balcony door openings are kept clear. Art and rug textures are generated locally in `src/scene/decorativeTextures.js`. Rug fringes use instanced geometry to reduce draw calls. Decorative items sit on existing furniture or against walls; the walking collision layout is unchanged.

Bathroom fixtures now use hollow ceramic vessel basins with drain inserts, curved brass mixers, fluted vanity fronts and slim round mirrors. The active bathroom mirror uses Three.js Reflector (512 px High / 256 px Light); inactive mirrors use the environment material, avoiding recursive mirror rendering. Render targets are retained across room changes and disposed on quality changes or viewer unmount. The shower uses its configured footprint with a room-facing opening, glass side panel, rain head, mixer, shelf and linear drain. No backend or remote assets are required.

Window views use a locally bundled 451 KB JPEG on a world-fixed cylindrical backdrop, with mirrored wrapping to avoid a hard seam. It appears in walkthrough and guided-tour modes; dollhouse keeps its studio background. Curtains are drawn aside to reveal the scenery. The texture URL uses Vite's BASE_URL and requires no external image service.

The television plays an original animated SVG mountain-and-lake scene when switched on. Three.js SVGLoader turns the bundled SVG into screen geometry; cloud, water and boat motion follow its animation tracks, retaining normal 3D perspective and room occlusion. Switching off removes the animation and releases its geometry/materials. Hidden tabs pause playback, and reduced-motion users see a still frame. No video service, audio, autoplay permission or external request is needed. Verify with scripts/browser-tv.js.

The entrance hall follows the supplied hall reference with narrow warm oak planks, gray six-panel fitted storage, white end panels/header and small brass knobs. Storage faces the entrance; its rotated collision footprint is shared with the navigation checks. The hall runner, wall art and wall shelf were removed to keep this circulation area open.

The living-room rug is a reference-inspired gray knitted design with six raised lengthwise bands and bound edges. Original yarn-loop color and bump maps are generated locally; the backing sits below the woven surface to avoid overlapping faces. Its footprint stays 2.75 by 3.5 metres, and other rugs retain their existing styles.

Both hall bathrooms have vertical half-circle reflective mirrors mounted over gray panels, with warm yellow illuminated perimeters and a subtle light wash on the panel. The en-suite retains its round mirror. Active-room reflection targets still use 512 px High / 256 px Light resolution and are retained when switching rooms.

The kitchen floor uses original white/gray marble tiles inspired by the supplied floor reference: 80 cm squares, fine grout, varied diagonal veining and a restrained polished finish. Color and grout relief maps are generated locally. The kitchen runner was removed to expose the tile field; counters, bathrooms and loggia finishes retain their existing materials.

The right hall mirror is flipped so the pair faces inward. Mirror targets are allocated and their shader compiled asynchronously during scene initialization. Bathroom glow lights remain mounted with zero intensity outside the active room to keep shader light counts stable. Only the active mirror renders a reflection, capped at 24 updates/second in High and 15 in Light; hidden tabs skip updates. This trades some reflection smoothness for less GPU work. Run scripts/browser-mirrors.js to measure first and repeated bathroom-entry frame gaps.
