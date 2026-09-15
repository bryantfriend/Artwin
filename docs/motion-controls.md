# Optional phone motion controls

In a residential apartment, select **Walkthrough**, then **Motion look** (Russian: **Движение**). The control appears on touch devices that expose the orientation API in a secure context. Permission is requested only from that button, when required by the browser. The first finite sensor reading activates motion; API presence alone does not imply working hardware.

Turning or tilting the phone adjusts the camera direction. Swiping and the movement joystick continue to work. The camera keeps a level horizon, smooths sensor movement and limits vertical tilt. Enabling or recalibrating motion preserves the current view. **Recenter motion** establishes a fresh baseline when the user changes their grip; disabling motion preserves the current direction too.

Motion is optional and off on entry. Leaving walkthrough mode removes listeners and cancels pending permission attempts. Room travel and pauses reset the relative baseline to prevent jumps. Background tabs stop sampling; sensor readings and permission choices are not stored or sent anywhere. A denied request or missing readings returns the user to touch controls with translated feedback. All control labels, accessibility labels, help and feedback support Russian, Kyrgyz, US English and Chinese.

Implementation uses the browser's `deviceorientation` event and the existing Three.js math; no new dependency is required. The sensor session lives in `src/deviceOrientation.js`, the additive camera adapter in `src/scene/motionCamera.js`, and the opt-in UI in `src/ui/MotionControls.jsx`.

## Validation

- `npm test`: includes motion math, permission lifecycle, cancellation races, hidden-page cleanup, invalid readings, localization, landscape/portrait, angle wrap, recalibration and preserving swipes.
- Build and `npm run check:dist` verify deployed repository paths.
- `npx --offline --package @playwright/cli@0.1.20 playwright-cli -s=motion run-code --filename scripts/browser-motion.js` against the production preview on port 4174 tests simulated readings against actual rendered pixels and the viewer's heading indicator. It covers swipe plus motion, pause/help, room travel, opt-out, permission denial, timeout, late cancellation and 12 language/viewport combinations.

The browser check simulates sensor readings and permission responses. Hardware testing remains: on iPhone Safari and Android Chrome, enter a walkthrough, enable motion, turn left/right and tilt, swipe while motion stays enabled, rotate to landscape, recalibrate, visit another room, leave/return to the page, and disable motion. Confirm movement direction and comfort on the handset. Also confirm declining the native permission prompt leaves swiping usable.

Browser reference: [MDN — DeviceOrientationEvent.requestPermission](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static), [MDN — orientation coordinate systems](https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Orientation_and_motion_data_explained).
