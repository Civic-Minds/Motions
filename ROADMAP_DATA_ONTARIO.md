# Ontario Data Roadmap

Provincial legislative data acquisition, processing, and representative mapping.

## New Sources

- [ ] **MPP Representative Data** — Download and parse the official [Member Office CSV](https://www.ola.org/sites/default/files/node-files/office_csvs/offices-all.csv) from `ola.org`. This provides names, ridings, and contact details.
- [ ] **House Recorded Divisions (Votes)** — Build a scraper for the [Legislative Assembly of Ontario Votes Search](https://www.ola.org/en/legislative-business/votes-search). This is the primary source for "Motions" and "Bills" data. Since there is no bulk export, we need to crawl by session/date.
    - *Method*: POST to `https://www.ola.org/en/legislative-business/votes-search` with `view_mode=full_record`.
- [ ] **Hansard Transcripts** — Integrate [Structured Hansard CSVs](https://www.ola.org/en/office-assembly/library-research/data-resources#hansard). Use these to provide context and summaries for specific interventions during Bill debates.
    - *Example (P44 Q4 2025)*: [Hansard-202510-202512.csv](https://www.ola.org/sites/default/files/data-resources/structured-hansard/Hansard-202510-202512.csv)
- [ ] **Committee Record of Proceedings** — Similar to Hansard, use [Committee CSVs](https://www.ola.org/en/office-assembly/library-research/data-resources#committee-transcripts) to track work done in Standing Committees (e.g., [Finance & Economic Affairs 2025](https://www.ola.org/sites/default/files/data-resources/committee-transcripts/F-Standing-Committee-on-Finance-and-Economic-Affairs-202504-202512.csv)).

## Pipeline

- [ ] **Jurisdiction-Aware Ingestion** — Refactor `scripts/import_open_data.js` logic to be generic, move Toronto-specific logic to `scripts/import_toronto_data.js`.
- [ ] **Bill-Motion Correlation** — Develop logic to group individual recorded divisions by their parent Bill ID (e.g., "Bill 212").
- [ ] **Riding/District Mapping** — Create `public/data/ontario/ridings.json` to map MPPs to their electoral districts (similar to Wards in Toronto).

## Data Structure (Ontario)

For integration into `motions.json`, the following mapping is proposed:
- `id`: Bill ID + Division Number (e.g., `Bill-212-Div-1`)
- `date`: Intervention/Vote date
- `committee`: Committee name or "Legislative Assembly (House)"
- `ward`: Electoral District (Riding)
- `votes`: Map of MPP names to "YES" | "NO" | "ABSENT"

## Enrichment

- [ ] **Hansard Summarization** — Use the "Intervention" text from Structured Hansard to generate AI-powered summaries of the *debate* preceding a vote, not just the vote result.
    - *Field to Watch*: `SubjectofBusiness` in CSV often contains the bill title.
- [ ] **Party Line Analysis** — Track voting patterns relative to political party affiliation (PC, NDP, Liberal, Green), which is significantly more rigid than municipal voting.

## Quality

- [ ] **Reading Status Validation** — Ensure multi-stage votes on the same Bill (1st, 2nd, 3rd reading) are correctly represented as single "Bill Profile" with multiple vote events.

---

[Back to Data Roadmap](ROADMAP_DATA.md)
