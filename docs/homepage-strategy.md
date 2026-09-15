# A buyer-led ARTWIN homepage

Research reviewed 15 September 2026. The homepage should introduce ARTWIN and make it easy to find a suitable home, with projects, plans and people one step away. The previous collection page gave Tokyo City a disproportionate feature; the base URL did not actually redirect to that project's detail page. Existing deep links must continue to open their intended projects.

## Evidence and limits

- [ARTWIN](https://artwin.kg/) opens with its brand message and company information, followed by a substantial project collection, purchase options and quality information. This supports a company-wide entry point, but does not establish its conversion performance.
- [Zillow's 2025 prospective-buyer research](https://www.zillow.com/research/prospective-buyers-consumer-housing-trends-2025/) ranks floor plans, high-resolution photos and virtual tours ahead of written descriptions and video among the listed presentation features. These are US buyer preferences, not a controlled test of homepage designs or evidence of a sales uplift in Kyrgyzstan.
- [Nielsen Norman Group's homepage guidance](https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/) recommends a clear purpose, obvious starting points for the main user tasks and real examples of site content.
- [Berkeley](https://www.berkeleygroup.co.uk/) combines location search, project examples and company positioning. [Barratt](https://www.barratthomes.co.uk/) emphasizes finding homes by location and practical buying support. [Emaar](https://www.emaar.com/en) uses strong architectural imagery and project discovery. These are design examples, not published conversion experiments.

## Implemented experience

- `/Artwin/` is a distinct brand homepage with a city/bedroom search, a useful description of the offering and attributed imagery from more than one project.
- `/Artwin/projects/` is the complete collection without a default Tokyo City promotion. City links initialize its existing filters.
- The homepage search passes validated preferences into the finder, clearing hidden budget/area restrictions from an earlier search. Direct finder visits still retain saved preferences.
- Residential discovery covers both Bishkek and Osh. Seoul has a separate, explicitly commercial route.
- Preview counts come from the catalog. They are not available-unit counts. Imagery is labeled as visualization, and 3D interiors remain illustrative.
- The buyer journey connects project discovery, layout comparison and the official consultation page. Actual local project images illustrate everyday spaces.
- Russian is the first-visit language, with all new text available in Kyrgyz, US English and Simplified Chinese.
- Homepage views and search starts are added to the existing opt-in, browser-only demonstration counters. No new tracking service, cookies, visitor-identification system or network reporting was added.

## How to establish whether it sells better

Use a controlled comparison against the previous project-led opening once ARTWIN can supply enough real traffic and connect outcomes. Compare qualified inquiries and attended visits per visitor; use search starts, plan views and shortlist saves only as intermediate signals. Keep campaign source, mobile/desktop split and load speed in the analysis. The current local demonstration counters cannot measure conversion across visitors or prove sales impact.
