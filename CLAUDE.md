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

## Logging

After every session, update:
- `CHANGELOG.md` — under `[Unreleased]`
- MotionsLog Notion DB (ID: `3289563c-9a49-8133-82a6-000b5e36402d`)
