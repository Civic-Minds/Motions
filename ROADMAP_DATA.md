# Data Roadmap

Pipeline improvements, new data sources, and data quality.

## New Sources

- [ ] **Advisory committee full votes** — the Open Data CSV only records City Councillors. Advisory committee votes include community appointees whose votes appear on toronto.ca agenda item pages but not in the CSV. A targeted scraper per item could fill this gap.
- [ ] **Committee & board memberships** — Toronto Open Data has no feed for official committee assignments. Best approach: a term-start scraper against the city's [Committees, Boards & Panels](https://www.toronto.ca/city-government/council/committees-other-bodies/) pages generating `public/data/committees.json`. Updated once per term (~every 4 years).
- [ ] **Multi-city support** — expand data pipelines to other Canadian municipalities with Open Data portals (Ottawa, Vancouver, etc.).
- [ ] **Ontario (Provincial) Support** — See the dedicated **[Ontario Data Roadmap](./ROADMAP_DATA_ONTARIO.md)**.
- [ ] **Canada (Federal) Support** — See the dedicated **[Federal Data Roadmap](./ROADMAP_DATA_CANADA.md)**.
- [ ] **Other Canadian Cities** — See the dedicated **[Municipal Data Roadmap](./ROADMAP_DATA_CITIES.md)**.

## Pipeline

- [ ] **Scraper robustness** — `scripts/import_open_data.js` relies on the Toronto Open Data CSV format staying stable. Consider adding schema validation so a format change fails loudly rather than silently producing bad data.
- [ ] **Playwright fallback** — add a Playwright-based scraper path for municipal portals that don't expose a clean CSV or JSON endpoint.
- [ ] **BudgetTranslator: annual update process** — `TOTAL_BUDGET` and department figures are hardcoded to the 2025 operating budget. Document the update process and consider pulling from a versioned `public/data/budget.json`.

## Enrichment

- [ ] **Agency & organization tagging** — extract referenced City of Toronto agencies, departments, and bodies (TTC, Toronto Public Health, Toronto Police Service, Build Toronto, etc.) from motion titles during the import pass. Store as a `tags` array on each motion. Enables filtering by org, showing which agencies appear most, and surfacing on motion cards and ProfilePanel notable votes. Keyword-matching approach similar to topic tagging is the fastest path; could be refined with a curated org list from the city's [Agencies & Corporations](https://www.toronto.ca/city-government/accountability-operations-customer-service/city-administration/city-managers-office/agencies-corporations/) directory.

## Quality

- [ ] **Ward resolution gaps** — some motions have `ward: "City"` (citywide) rather than a specific ward number. These are excluded from Ward Impact view. Consider a secondary classification pass for citywide motions that still have a geographic focus.

---

[Back to Roadmap](ROADMAP.md)
