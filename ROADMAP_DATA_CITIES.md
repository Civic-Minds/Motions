# Municipal Data Roadmap

Future municipal expansions for the Motions platform.

## High Priority (Structured Data Available)

- [ ] **Vancouver** — Individual vote records via [Open Data Portal](https://opendata.vancouver.ca/explore/dataset/council-voting-records/information/).
    - *Format*: CSV / OData API.
    - *Mapping*: Riding -> Ward equivalents.
- [ ] **Calgary** — Council and Committee votes via [Socrata API](https://data.calgary.ca/resource/ruq3-99hx.json).
    - *Format*: JSON (SODA2).
    - *Scale*: 14 Councillors + Mayor.

## Medium/Long Term (Requires Scraping)

- [ ] **Ottawa** — Currently requires parsing meeting minutes or scraping [Agendas & Minutes](https://ottawa.ca/).
- [ ] **Montreal** — Requires parsing text-based "procès-verbaux" from [Données ouvertes Montréal](https://donnees.montreal.ca/).

## Global Infrastructure

- [ ] **City Registry** — Move from hardcoded city constants to a shared `public/data/jurisdictions.json` registry that defines which city data is available, its primary API endpoints, and UI branding (colors/logo).

---

[Back to Data Roadmap](ROADMAP_DATA.md)
