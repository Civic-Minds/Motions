# Claude Notes — Motions / Your City at Work

## Environment

A `.env` file lives at the project root with `GEMINI_API_KEY`. It is gitignored.

When running summary generation, always use:
```bash
node --env-file=.env scripts/generate_summaries.js
```

Do **not** `export GEMINI_API_KEY=...` manually — the key is already in `.env`.

## Scripts

Run in order when refreshing data:
1. `node scripts/import_open_data.js`
2. `node scripts/scrape_agenda_text.js`
3. `node scripts/extract_fields.js`
4. `node --env-file=.env scripts/generate_summaries.js`
5. `node scripts/geocode_addresses.js`
6. `node scripts/strip_body.js`
7. `node scripts/fetch_meetings.js` (can run independently — fetches upcoming meeting schedule)

## Logging

After every session, update:
- `CHANGELOG.md` — add to the current `[Unreleased]` section, or create one if it doesn't exist
- MotionsLog Notion DB (ID: `3289563c-9a49-8133-82a6-000b5e36402d`)

## Data sources

Most data refreshes are **manual**. `motions.json` and `meetings.json` are refreshed automatically by GitHub Actions daily at 6am UTC.

| File | Source | How to update |
|---|---|---|
| `motions.json` (votes) | Toronto Open Data — City Council Voting Record CSV | Run `import_open_data.js` (automated daily) |
| `motions.json` (summaries) | TMMIS agenda scraper + Gemini AI | Run scripts 2–4 in order (scrape → extract → summarize). Requires `GEMINI_API_KEY`. Slow — only run when new motions need summaries. |
| `meetings.json` | Toronto Open Data — Meeting Schedule CSV | Run `fetch_meetings.js` (automated daily). Upcoming 90 days, major committees only. |
| `councillors.json` | Hand-maintained from toronto.ca councillor pages | Edit manually when councillors change |
| `tenure.json` | Derived from voting record + manual overrides | Run `build_tenure.js` after importing new voting data |
| `expenses.json` | City of Toronto annual remuneration PDF (published each March) | Hand-encode from new PDF. See Manual checks below. Quarterly HTML table also at `secure.toronto.ca/tcer2/` — check manually if mid-year updates are needed. |
| `budget.json` | Unknown | — |
| `wards.geojson` | Toronto Open Data — Ward Boundaries | Stable (25 wards since 2018) — unlikely to change |

## Manual checks

- **Councillor expenses** — the City publishes a new annual PDF each March at:
  `https://www.toronto.ca/wp-content/uploads/YYYY/MM/[hash]-[year]-Remuneration-Report-Members-of-Council.pdf`
  The URL changes each year (check `toronto.ca` search for "remuneration report members of council"). When new data drops, update `public/data/expenses.json` and the `source_url` field inside it.
  Current data: year ended December 31, 2025 (fetched April 2026).
  **Check again: ~July 2026** for Q2 2026 data at `secure.toronto.ca/tcer2/`.
