# Life in this project

The lifestyle cards use the individual project's official ARTWIN presentation.
`src/projectLifestyle.js` stores each image's original URL, caption and matching
published feature keys. Existing gallery assets are reused; eleven additional
images are stored under `public/lifestyle/` as compressed WebP files.

Images were visually checked on 2026-09-15. `render` means a project/design
visualization; `illustration` means the illustrative picture used by ARTWIN
(for example heating equipment, access control or swimming). Neither is shown
as evidence of completed construction. The full-image dialog links to the
project's official page and explains this distinction.

Features without a matching picture stay available under “More project details”.
They are not assigned an unrelated picture from another project. Seoul uses
business imagery and a business heading.

Cards use native horizontal scrolling with touch, keyboard and arrow-button
controls. Images load lazily, and motion respects reduced-motion preferences.
The existing modal handles Escape, focus trapping and return to the opener.
