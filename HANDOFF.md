# Motions — Handoff Prompt

Use this when resuming in a new Claude session.

---

I'm continuing work on **Motions** — a Toronto City Council voting transparency app at `motions.watch`. Code lives at `/Users/ryan/Desktop/Mag/Tools/Council/Motions`. React 19 + Vite 7 + Tailwind v4, react-router-dom v7, framer-motion. Deployed on Vercel.

## Architecture

**Data pipeline:**
- Source: Toronto Open Data CSV (member voting records, 2006–2026)
- Import script: `scripts/import_open_data.js` → `public/data/motions.json`
- One entry per distinct motion type per agenda item (multi-vote splitting)
- Primary entries: no `parentId`. Sub-entries (procedural votes): have `parentId = primary.id`
- Each entry stores: `id`, `title`, `date`, `committee`, `topic`, `significance`, `flags`, `status`, `ward`, `resultText`, `votes`, `parentId?`, `summary?`, `keyAmounts?`, `notabilityRank?`
- `import_open_data.js` preserves enriched fields (`summary`, `keyAmounts`, `notabilityRank`, etc.) from the previous file when rebuilding — GitHub Actions daily runs will not wipe summaries

**Data pipeline scripts (run in order):**
1. `scripts/import_open_data.js` — pulls Toronto Open Data CSV, rebuilds motions.json. Preserves enriched fields from previous run.
2. `scripts/scrape_agenda_text.js` — Playwright scraper (uses system Chrome via `channel: 'chrome'`), writes `body` field. Targets ALL primary motions (no significance filter). Incremental — skips motions that already have body.
3. `scripts/extract_fields.js` — regex extraction from `body`: dollar `amounts[]`, `staffRecommendation`, `developer`. No API key needed. Run before summarizing.
4. `scripts/generate_summaries.js` — calls Gemini API (`gemini-2.5-flash`) to generate plain-language `summary` from `body`. Requires `GEMINI_API_KEY` env var. Rate-limited to 10s/request (~6 req/min, within free tier).
5. `scripts/rank_notability.js` — *(planned)* pairwise notability ranking via Gemini quicksort. Writes `notabilityRank` field. Run after summaries are complete.
6. `scripts/geocode_addresses.js` — extracts street addresses from titles, geocodes via Nominatim (free, no key), stores `locations: [{address, lat, lng}]`. Rate-limited to 1.1s/request.
7. `scripts/strip_body.js` — removes `body` field from all motions before committing (body is pipeline-only, not needed in the browser)
8. `scripts/fetch_meetings.js` — fetches all TMMIS decision bodies dynamically (no hardcoded list), pulls 365d past + 180d future meetings with agenda items. Merge-on-rerun: preserves existing past agendas, only re-fetches new/upcoming ones.

**Key data files:**
- `public/data/motions.json` — local copy; live version served from Vercel Blob
- `public/data/meetings.json` — local copy; live version served from Vercel Blob
- `public/data/councillors.json` — local copy; live version served from Vercel Blob
- `public/data/tenure.json` — first elected year + term list per councillor (committed to repo)
- `public/data/wards.geojson` — Toronto ward boundaries for geolocation (committed to repo)

**Vercel Blob:** `motions.json`, `meetings.json`, and `councillors.json` are uploaded to `https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com`. Run `node --env-file=.env scripts/upload_to_blob.js` after any manual data edit. GitHub Actions uploads automatically after each daily refresh — no commits to the repo for data updates.

**Frontend:**
- `src/App.jsx` — routes + data loading via `useMotions`
- `src/hooks/useMotions.js` — fetches motions.json + councillors.json in parallel
- `src/constants/data.js` — `TOPIC_LIGHT`, `TOPIC_DOT`, `TOPIC_BADGE`, `FLAG_STYLES`, `COMMITTEE_NAMES`, `getCommittee()`, `WARD_COUNCILLORS`, `FORMER_MEMBERS`, `COUNCILLORS`

**Main views:**
- `/` — DashboardView (bento header, motion list, multi-select topic/committee/vote-type/year filters)
- `/motions/:id` — MotionPage (dedicated motion detail; sub-entry URLs redirect to primary)
- `/councillors` — CouncillorList grid (highlights "Your Councillor" if ward is saved)
- `/councillors/:slug` — CouncillorProfile full page (committees, voting DNA, sort/filter controls, VS button)
- `/councillors/:slug/vs/:slug2` — VersusOverlay comparison
- `/committees` — CommitteesView (committee grid with motion stats + "Boards & Other Bodies" section for meetings-only bodies)
- `/committees/:slug` — committee detail with upcoming meetings + motion list + member pills; also handles meetings-only bodies (boards/advisory committees) that appear in meetings.json but not motions
- `/meetings` — MeetingsListView (all meetings, grouped by month, filterable by time/type/committee)
- `/meetings/:ref` — individual meeting detail page
- `/wards` — WardGrid
- `/wards/:id` — ward detail with map (uses GeoJSON; extractWardId strips leading zeros so "01" matches "1")

**Global search (⌘K):**
- `src/components/GlobalSearch.jsx` — Fuse.js fuzzy search across motions, councillors, and committees
- Weighted keys: title (0.5), summary (0.3), committee (0.1), topic (0.1); threshold 0.35
- Results grouped: Councillors (3), Committees (2), Motions (6)
- Keyboard nav: ↑↓ arrows, Enter to select, Escape to close

**Meeting type badges (`MeetingsListView.getTypeBadge`):**
10 badge types in priority order: Council, Community Council, Transit, Appointments, Boards, Finance, Planning, Health, Advisory, Governance. Order matters — Appointments check before Finance (avoids "Compliance Audit Committee" → Finance collision); Boards before Finance (avoids "TO Live Finance & Audit" → Finance collision).

## Current data state (as of April 20, 2026)

- 1,288 total motions in motions.json
- **926 primary motions all scraped** (body text ready in local motions.json, not committed)
- **0 summaries** — GitHub Actions daily run wiped them before they were committed. Fix is now in place (import preserves enriched fields going forward).
- **Summaries need to be regenerated** — run `generate_summaries.js` on a stable internet connection. ~2.5 hours at 10s/request.
- 520 meetings across 76 TMMIS decision bodies; 397 have agenda items fetched
- `.env` file at project root with `GEMINI_API_KEY` — do not commit

## Pipeline — what's left to do

```bash
cd /Users/ryan/Desktop/Mag/Tools/Council/Motions

# 1. Generate summaries (needs internet — ~2.5 hours)
node --env-file=.env scripts/generate_summaries.js

# 2. Run pairwise notability ranking (needs internet — script TBD)
node --env-file=.env scripts/rank_notability.js

# 3. Strip body before committing
node scripts/strip_body.js

# 4. Commit + push → Vercel redeploys
git add public/data/motions.json
git commit -m "data: summaries + notability rankings"
git push
```

## Data notes

**Advisory committees:** The Toronto Open Data CSV only records City Councillors. Community appointees on advisory committees are not in the CSV. We store `resultText` (e.g. "Carried, 7-3") and use it to show correct totals when councillor votes are a subset.

**Multi-vote items:** Some agenda items have multiple distinct votes (e.g. "Waive Referral" + "Adopt Item"). Each vote is a separate entry. Primary selection priority: Adopt Item > Adopt Item as Amended > Adopt Order Paper as Amended > first Adopted result > first type. Sub-entries redirect to primary page.

**Significance scoring:** The current keyword-based significance score is known to be over-inflated (common words like "transit" give +20pts). Pairwise notability ranking (`notabilityRank`) will replace it as the primary signal for surfacing notable motions. Frontend currently uses `significance >= 60` as the Notable threshold — this will be updated to use `notabilityRank` once available.

**Ward 15:** Updated to Rachel Chernos Lin (won by-election November 4, 2024). Jaye Robinson remains in `FORMER_MEMBERS` for historical context.

**meetings.json merge logic:** `fetch_meetings.js` keys meetings by `meetingReference || "{committee}|{date}|{number}"`. On re-run, past meetings with cached agendaItems are preserved without re-fetching — only new/upcoming meetings hit the TMMIS API. This keeps daily runs fast and avoids overwriting data.

**SUPPL agenda items:** `publishTypeCd` filter was removed from `getAgendaItems()` — both `'MAIN'` and `'SUPPL'` types are included. Previously, boards like FIFA World Cup that only publish SUPPL items showed 0 agenda items.

## Known remaining work / roadmap

- Popular motions (upvoting via Upstash Redis) — deferred, needs backend
- "Who's responsible?" jurisdiction tool — roadmap feature; maps issues to the right gov't body
- Notability ranking script (`rank_notability.js`) — not yet written
- GitHub Actions: `fetch_meetings.js` is not yet in the daily workflow (currently only `import_open_data.js` runs). Add it so meetings stay fresh automatically.

## Verify build before anything else

```bash
cd /Users/ryan/Desktop/Mag/Tools/Council/Motions && npm run build
```
