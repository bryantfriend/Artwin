# Buyer tools and sales integration

The site remains a static, client-side GitHub Pages app under `/Artwin/`. Navigation uses hashes. No backend, private API keys, CRM connection, authentication or purchase transaction has been introduced.

## Available now

1. Apartment inventory selector, grouped by building and floor, with plan/status filters. It starts empty; no unit numbers or availability are invented. Approved public records can be supplied through `public/sales-data.json`.
2. Personal payment calculator: KGS or USD (no currency conversion), cash/installment/trade-in scenarios, optional assumed annual interest, monthly/quarterly schedules, local saved scenarios and a contextual WhatsApp inquiry. These are user assumptions, not official lending or installment offers. Fees are not included; trade-in is not valued automatically.
3. Contextual WhatsApp summaries with project, layout, optional unit, payment assumptions and a question. The buyer reviews and sends the message in WhatsApp. No messages are sent by the app.
4. `#/finder`: city, bedroom and area preferences plus optional budget/payment constraints. Budget confirmation requires an available, priced record in the selected currency. Missing data is explicitly unknown, not affordable. Projects without layouts are shown separately; Seoul is commercial and excluded from residential matching.
5. Approximate room/furniture planning in each layout's expanded card and viewer purchase menu. Numeric furniture sizes, presets, rotation, pointer dragging and keyboard-accessible position sliders. It checks the approximate room boundary, not door swings or other furniture. Verified CAD/BIM, exact views, delivered-finish toggles and approved dimensions await Artwin material.
6. `#/shortlist`: existing saved plans, shareable snapshots, comparison cards, device-local notes, print/save-as-PDF and a group inquiry. Links contain only allowlisted project/plan identities. Notes and payments are never added to share URLs. Changes generate a new link; this is not a synchronized multi-user workspace.
7. Project information, expandable facilities, source links, and dated construction/document record rendering. Tokyo City and Wilton Park facts are paraphrased from their official pages, reviewed 2026-09-14. No invented progress or handover records. Other project presentations link to official sources while awaiting floorplans.
8. On-demand Google Maps embed, category searches and directions using the published project address. No fabricated nearby businesses, coordinates or travel times. Address searches can be approximate; buyers should check the exact entrance. Route origin remains in component memory and is passed only to the map service when the buyer opens directions.
9. Viewing preferences and summary-copy alongside the official booking link. The external page does not automatically receive apartment context; buyers are told to share the copied summary. Appointment requests, confirmation, rescheduling and reminders remain with Artwin. No pretend bookings are created.
10. `#/sales-workspace`: local, opt-in interaction counts, JSON export/reset, inventory import preview, and a data handoff checklist. The workspace is publicly accessible and grants no admin privileges. Imports never publish. Qualified leads, appointments, reservations and sales show “not connected”, not zero. Real reporting and shared staff updates require Artwin's approved service.

All new UI is translated into Russian, Kyrgyz, US English and Simplified Chinese. Project/plan names and imported unit identifiers retain their official identity. Mobile cards keep their collapsed default; purchase tools are within the expanded content and dialogs.

## Inventory contract

Top level: `version: 1`, `updatedAt: "YYYY-MM-DD"` or null, `units: []`, `milestones: []`, `documents: []`. Empty template is downloadable from the workspace. The checked-in public file intentionally has no records.

Each unit needs these fields:

| Field | Accepted value |
| --- | --- |
| id | Unique string, max 80 characters |
| projectId | An existing project ID from `src/projects.js` |
| building | Official building identifier, max 80 characters |
| floor | Integer 0–200 |
| number | Official apartment number, max 30 characters |
| planId | Existing plan ID in this project, or null while a model is unavailable |
| price | Positive finite number up to 1e12, or null for price on request |
| currency | KGS or USD |
| status | available, reserved, sold |
| updatedAt | Valid YYYY-MM-DD date |
| orientation | N, NE, E, SE, S, SW, W, NW, or null |
| handover | Valid YYYY-MM-DD date, or null |

Milestones and documents each accept `projectId`, `date`, an HTTPS `url` on `artwin.kg` or an Artwin subdomain, and `title` with nonempty `ru`, `ky`, `en-US`, `zh-CN` values. Link to Artwin's own document/progress page; don't put private purchaser records or documents in the public file. Imported content is rendered as text. Additional fields are discarded by validation.

Use the local workspace import to inspect approved data before publishing. Remove the preview to return to the deployed file. To publish, update `public/sales-data.json`, run the tests/build/subpath checks, then push through the existing Pages workflow. Every visitor will see published data; local imports are never a publishing mechanism. Keep timestamps current and do not describe a manually maintained file as real-time stock.

## Production integration handoff

Artwin should supply the inventory owner/update process, project-specific payment rules and an approved service interface for inventory, CRM and appointment status. A future authenticated service must control staff edits and store private leads. Do not put credentials in Vite variables or the repository. The current client can remain static while using approved endpoints.

The local measurement toggle records only the timestamp, known project/plan IDs and one of seven allowed interaction names. It stores at most 1,000 events in this browser, sends nothing remotely and is off by default. Turning it off stops future recording; Clear deletes the stored events. No visitor IDs, campaign attribution, private notes, phone numbers or financial amounts are recorded. Exporting is a deliberate local download. Reporting sales outcomes or consultant response times requires a real CRM integration; WhatsApp opens and booking-link clicks cannot establish those outcomes.

## Source references

- https://artwin.kg/ — published purchase methods; numeric terms are intentionally not hardcoded as approved offers.
- https://artwin.kg/tokyo_city — facilities and permitting descriptions.
- https://artwin.kg/wilton — facilities and specifications.
- https://artwin.kg/schedule-call — official appointment destination, unchanged.

This release prepares data contracts for other properties. Add future screenshots, layout metadata, model geometry and preview captures through the existing project/layout registries; the buyer tools automatically use added layouts.
