# Technical Roadmap

Code quality, bugs, and structural improvements.

## Bugs

- [x] **Error state UI** — if `public/data/motions.json` fails to load, the app shows a blank screen. `useMotions.js` captures the error but never surfaces it. Add a simple error state to `App.jsx`.
- [x] **VersusOverlay: 0-vote alignment default** — `getMemberAlignmentScore` returns 75 as a baseline when a councillor has no recorded votes. This can produce misleading alignment scores in the Versus panel.


## Code Quality

- [x] **Centralize TOPIC_STYLES** — the topic colour mapping (`Housing → blue`, `Transit → red`, etc.) is duplicated across `ContestBoard.jsx`, `MotionTable.jsx`, `ProfilePanel.jsx`, and `VersusOverlay.jsx`. Extract to `src/constants/data.js`.
- [x] **Centralize FLAG_STYLES** — same issue as TOPIC_STYLES; flag badge styles (`close-vote`, `unanimous`, etc.) are duplicated across `ContestBoard.jsx` and `MotionTable.jsx`.


## Architecture

- [ ] **Multi-jurisdiction refactor** — transition from a Toronto-centric model to a generic engine.
    - Remove hardcoded `/toronto` basename in `App.jsx`.
    - Refactor `useMotions` to support dynamic loading from `/data/{jurisdiction}/motions.json`.
    - Create a shared `representatives.json` schema to handle MPs, MPPs, and Councillors.
- [ ] **Jurisdiction Registry** — implement a centralized registry (`src/constants/jurisdictions.js`) to manage regional branding, representative types (MP vs Councillor), and geography terms (Riding vs Ward).

## Data Pipeline

- **Scraping is intentionally manual** — `scrape_agenda_text.js` uses Playwright to render toronto.ca/TMMIS pages in a real browser. Automating this in GitHub Actions was attempted but failed consistently due to bot detection, timing issues, and headless browser setup on CI runners. Don't revisit unless TMMIS exposes a proper API or a reliable alternative scraping path is found.
- **Current flow**: Actions runs `import_open_data.js`, `fetch_meetings.js`, and `generate_summaries.js` daily, then uploads to Vercel Blob. Summaries are generated automatically in CI; if any motions still lack summaries after that step (e.g. missing body text), an issue is opened. For motions that need body text first, run `scrape_agenda_text.js` → `extract_fields.js` → `generate_summaries.js` → `upload_to_blob.js` locally.

## Data Storage

- **Current approach: Vercel Blob** — `motions.json`, `meetings.json`, and `councillors.json` are served from Vercel Blob. Data refreshes via GitHub Actions without committing to the repo. This is intentional — committing every new motion would inflate commit history with automated noise rather than real work.
- [ ] **Database migration** — consider migrating to Postgres/Supabase if: (a) the JSON file size becomes a load-time concern, (b) server-side filtering is needed for a feature, or (c) multi-city support requires querying across jurisdictions. Not worth the infra complexity until one of those is true.

## Performance

- [ ] **DataModule pagination** — currently renders 100 rows at a time. Consider virtualizing the list (e.g. `react-window`) if dataset grows significantly beyond 717 motions.

---

[Back to Roadmap](ROADMAP.md)
