# Federal Data Roadmap (Canada)

Federal legislative data acquisition from the House of Commons and LEGISinfo.

## New Sources

- [ ] **Member of Parliament (MP) Data** — Use the official House of Commons [Member Search XML](https://www.ourcommons.ca/Members/en/search/XML).
    - *Mapping*: Constituency -> Riding, Caucus -> Party.
- [ ] **LEGISinfo Bills API** — Directly consume the [LEGISinfo JSON Feed](https://www.parl.ca/legisinfo/en/bills/json). This provides a rich list of all bills, their status, and parliament numbers in machine-readable JSON.
- [ ] **Recorded Divisions (Votes)** — Consume the [House of Commons Votes XML](https://www.ourcommons.ca/Members/en/Votes/XML?parlSession=44-1&output=XML).
    - *Structure*: Contains `DecisionDivisionNumber`, `DecisionDivisionSubject`, and yea/nay counts.
- [ ] **Hansard (House Debates)** — Parse the sitting-by-sitting XML files (e.g., [Sitting 1 XML](http://www.ourcommons.ca/Content/House/441/Debates/001/HAN001-E.XML)).
    - *Note*: Requires a crawler to identify the latest sitting number and build the URL dynamically.

## Pipeline

- [ ] **OData / XML Parser** — Since much of the federal data is XML-first, build a robust `scripts/utils/xml_parser.js` to convert these feeds to the `motions.json` internal schema.
- [ ] **Parliamentary Session Logic** — Handle the `44-1` (44th Parliament, 1st Session) format across all URLs.
- [ ] **Senate Integration** — Investigate parallel sources for the Senate of Canada to provide a full bicameral picture.

## Data Structure (Federal)

- `id`: Parliament + Session + Division No (e.g., `44-1-Div-928`)
- `date`: Vote/Sitting date
- `committee`: "House of Commons" or specific Standing Committee (e.g., "FINA")
- `ward`: Riding (Constituency)
- `votes`: Map of MP names to "YES" | "NO" | "ABSENT"

## Enrichment

- [ ] **OpenParliament.ca API Fallback** — Consider using [api.openparliament.ca](https://api.openparliament.ca) as a secondary source for cleaned debate transcripts and "hand-tagged" topics.
- [ ] **LEGISinfo Detail Scrubbing** — Use Bill-specific LEGISinfo pages to extract the "Full Title" and latest progress (e.g., "Royal Assent").

## Quality

- [ ] **Omnibus Bill Detection** — Flag bills that contain a high volume of unrelated clauses (common in federal budgets) for special significance scoring.

---

[Back to Data Roadmap](ROADMAP_DATA.md)
