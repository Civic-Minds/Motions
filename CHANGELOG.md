# Changelog

All notable changes to this project will be documented in this file.

See [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) for earlier history.

## [Unreleased]

### Added

- Added deterministic Victoria topic labels, official agenda/minutes links on motion pages, and a source-named address geocoding pass; unresolved locations remain unmapped.
- Added a bounded Victoria council-vote importer from the City’s official public dashboard; Victoria stays off the public selector until the sample is validated.
- Added source-only Victoria outcome parsing, validation, and scheduled Blob refresh infrastructure without AI-generated enrichment.
- Victoria now opens from the city picker instead of appearing as a non-clickable election-date card.
- Victoria imports now cover the current council term and refuse publication when the City source is stale.

### Changed

- **Yellowknife council coverage**: Registered Yellowknife as a citywide jurisdiction and added an importer for its official agenda/minutes records, bringing the city’s council decisions onto the shared Motions data model.
- **Faster font load**: The Inter font stylesheet no longer blocks first paint — it loads in the background and swaps in once ready.
- **Smaller councillor photos**: Headshots were being served at their full 820×1024 source size everywhere, including 40px avatars — resized to the largest size actually used on screen, cutting the councillor photo payload from 5.3MB to about 0.2MB. Avatars below the fold now also defer loading until scrolled into view.
- **Faster page load**: The dashboard no longer waits on the full meetings history (~300KB gzipped) before showing content — only its small "next meeting" card needs that data, so it now loads in the background instead of blocking first render.
- **Smaller vendor bundle**: Replaced the framer-motion animation library with plain CSS transitions across cards, modals, and list entrances — same look, one fewer vendor chunk (about 43KB gzipped) for every visitor to download.
- **Smaller Election page**: A mapping library used only for merging school-trustee ward boundaries now loads on demand instead of being bundled into every visit to the Election page — cut that page's download by about two-thirds (22.6KB to 7.1KB gzipped).

### Fixed

- **Incumbents who aren't on the ballot**: The Election page listed every ward's sitting councillor as a 2026 candidate, even when they were retiring, running in a different ward, or running for mayor — wrong in four wards. Each ward now states which, and only shows the "Incumbent" tag when the councillor is actually on that ward's ballot.
- **Transparency refresh date**: The production data endpoint now serves metadata correctly, so the Transparency page can show when council data was last checked.
- **Vancouver title audit**: Data refreshes now report malformed titles or lost tracked corrections before upload without blocking otherwise valid new data.

- **Vancouver motion titles**: Older records no longer show broken punctuation, escaped whitespace, stray separators, source boilerplate, stacked agenda labels, or feed-truncated titles.
- **Vancouver agenda numbers**: Parenthesized agenda numbers no longer appear at the start of Vancouver motion titles.
- **Unsafe report links**: Issue-report page links now allow only web URLs, preventing crafted contact links from executing code when opened.
- **Data load failures on flaky connections**: A dropped or slow connection could return a non-JSON response and leave people stuck on a cryptic "Unexpected token" error with no way to recover. The error message is now readable, and a "Try again" button retries without a full page reload.

## [3.0.0] — 2026-09-02

### Added

- **Google Analytics** — adds longer-term and campaign traffic reporting alongside Vercel Analytics.
- **Contact & issue reporting**: A new Contact page lets residents ask questions, report issues, or make privacy requests. Motion, meeting, and Learn pages now have Share and Report actions — Report opens this contact flow with the page's context (URL, city, and whether it concerns a motion or meeting) automatically included and previewed, editable before sending; if no page context applies (e.g. reported from the footer), the URL can be entered manually.
- **Analytics events** — records motion views, city changes, and issue-report clicks for useful usage patterns.
- **Vancouver's official upcoming meeting schedule**: Scheduled Council and committee meetings now appear even before voting records are published.
- **Learn participation guidance**: Added the dedicated "How to Depute" guide and placed its supporting resources beside the steps they explain.
- **Vancouver council coverage**: Added Vancouver as a second city with citywide motion browsing, councillor voting records, election information, and an official-data importer while keeping Toronto's ward experience intact.
- **Map page**: Added a full-page map plotting motions at their address (Toronto: 346 of 1,496; Vancouver: 421 of 2,164) for both cities, separate from Toronto's ward-grouped Wards page — each city's homepage mini-map opens it, with motion-location deep links, a legend overlay, and reliably clickable/hoverable pins. Later merged the two cities' near-identical implementations into one `MotionsMap.jsx` component, and made its "mostly X and Y" topics filter the homepage (`/?topic=X`) when clicked, matching the existing `?ward=` pattern.
- **Real homepage**: motions.watch no longer redirects straight into Toronto — it's now a landing page with a hero, a short "why Motions" section, and a Canada-wide map/city picker. Toronto and Vancouver are clickable pins; other cities are limited to the three actually on the roadmap (`docs/roadmap/DATA_CITIES.md`: Calgary, Ottawa, Montreal) shown as muted "Planned" pins, after an earlier pass added speculative cities with no real near-term path or already-past elections. City cards float on the map as a bottom carousel, sync with what's in view, fly the map to a city on hover, and show real per-city facts (ward structure, mayor, live election date) instead of a repeated template sentence. The Canada map now loads only once it enters view for faster loading on slow connections, the Motions wordmark is clickable to return home, and the page uses the same max-width/padding container as every other page instead of sitting flush against the browser edge.
- **Learn hub**: Transparency and the footer now point residents to city-aware guides explaining how council decisions and recorded votes work.
- **About page**: Residents can now see what Motions covers, how municipal decisions differ from other levels of government, and how the project supports participation.
- **Toronto's "How to Get Involved" guide**: Replaced the "coming soon" placeholder with real steps and links — Have Your Say Toronto, Public Notices & Bylaws, the Application Information Centre, and how to register to speak at a committee meeting.
- **Vancouver's civic participation guide**: Residents can now find consultations, public notices, rezoning opportunities, meeting participation options, and official follow-up resources in one place; Toronto's equivalent is marked coming soon.

### Changed

- Report previews now show the title of the linked Learn article.
- Topic colours now give Housing a warm stone colour and distinguish Finance, Parks, and Climate more clearly.
- Map zoom controls now use the same rounded buttons across every map.
- Full map popups now show motion summaries and the map supports topic and outcome filters.
- **Contact emails**: Issue reports are formatted as readable messages with a clear greeting, page reference, and message prompt, and tell reporters to keep the automatically included details in the message.
- **Legal-page contact links**: Privacy opens the contact form with a privacy request selected, while Terms uses the general question option.
- **Cities footer navigation**: Added an “All cities” link back to the city picker.
- **Winnipeg homepage status**: Labels Winnipeg as coming soon while its coverage finishes testing.
- **Search preview**: Replaced the generic homepage title and slogan with a clearer description of Motions’ council-voting coverage.
- **Contact flow**: Opens the message form immediately after a visitor picks a reason, with the reason, issue type, and any auto-included page details staying visible and editable throughout — including when arriving from a report link elsewhere on the site — and the page context shown before the issue-type question when it's preselected.
- **Vancouver onto shared components**: Vancouver progressively moved off standalone implementations onto the same shared components Toronto already used — election page layout, voting guide shell, static-page layout, map markers, homepage map, meeting and committee screens, councillor profiles and council directory, motion details, and page metadata — instead of maintaining a second copy of each. Vancouver-specific details (at-large council, citywide geography, official record links) are preserved through parameters rather than forked code.
- **Vancouver motion data cleanup**: Removed leading agenda labels (e.g. "Motion 3.", "CD-1") from displayed motion titles, both on new imports and retroactively for already-imported records, while preserving the official source links. Motion sources now link to their filtered official voting-record entry instead of the generic dataset page; documents (agenda/voting-record links) are visible via the shared Documents section without duplicating the agenda and voting-record links; mapped locations survive re-imports since existing coordinates are preserved while the importer rebuilds voting records; and blocked, missing, or unmatched agenda pages are rejected before summary generation.
- **Vancouver council/committee content**: Wrote real per-committee descriptions for all 6 Vancouver committees, replacing generic fallback text, and refined the at-large council wording site-wide to remove confusing "record" language.
- **Vancouver data refresh**: Vancouver now has its own scheduled import/upload workflow independent of Toronto's, and each data page shows its own latest voting-record date; scheduled refreshes run when either city has new meeting data.
- **Election card copy** (Toronto + Vancouver): Iterated the homepage election cards to a consistent final treatment — dates pulled from shared jurisdiction data instead of hardcoded strings, the year dropped for a compact format, Toronto's headline pointing to election day with the exact date in the footer, and Vancouver's headline highlighting the nomination deadline with a "Register to run by [date]" candidate call to action.
- **Election results framing**: Once an election's voting closes, the Election page's voting-info/voting-days cards, the Dashboard's election teaser, the "Where to vote" card, and Vancouver's page heading all automatically swap from pre-election to results-framed copy ("voting closed / see council") instead of continuing to show a past date as upcoming — verified on both cities by testing a past date.
- **Deduplicated election pages**: Toronto's and Vancouver's election pages had independently reimplemented the same summary tiles, the non-partisan voting-guide callout, the post-election result/what's-next cards, and the closing disclaimer. All four are now shared components/helpers, Toronto's previously-hardcoded election-day/advance-voting strings are named constants, and Vancouver's page was revamped onto Toronto's compact layout with citywide council and candidate cards while keeping its own ballot/voting/official-resource details.
- **Vancouver election page content**: Expanded with official voting options, ballot details (including the actual Capital Plan and public-safety plebiscite questions instead of a "check the guide" hedge), eligibility, accessibility guidance, and candidate timing. The top summary now tracks the real campaign calendar (nomination period → vote-by-mail → voting places) instead of one static tile, and the voting section links the shared "How Voting Works" guide instead of repeating it across three cards.
- **Ballot guide layout**: Both cities' "what's on your ballot" sections now use small side-by-side cards instead of a bullet list; Vancouver's accessibility info moved out of "Other ways to vote" into "At the voting place," matching Toronto's existing split.
- **Learn/guide content**: Renamed the voting guide from "How to Vote" to "How Voting Works" (URL updated to match, old URLs redirect) and made it evergreen — election-specific dates now live only on the Election page. Toronto and Vancouver guides are explicitly city-specific (different council structures and contacts: ward councillor vs. any councillor/Mayor; Toronto's committee review vs. Vancouver's Council/committee/hearing distinction), cover the full decision path (agenda review, debate, amendments, thresholds, publication, follow-through, Toronto's Strong Mayor exceptions), show a last-reviewed date, resolve at city-and-hub URLs (e.g. `/toronto/learn/how-council-works`), and share one `GuideCard`/`OfficialLink` implementation and Learn-page shell instead of duplicated versions per city. "How Voting Works" is also a featured full-width card on Learn while an election is upcoming, reverting to a normal card afterward.
- **Toronto Strong Mayor guide**: Expanded to cover administrative, committee, budget, provincial-priority, and public-record powers with official sources — catalogued the register by category (budget, by-law, veto, committee, staffing, organizational), clarified it covers more than vetoes, sourced the 2023 delegation of hiring/dismissal powers (noting no direct use since), and stated Toronto's actual thresholds (26 members, 18 votes to override a veto, 9 votes for provincial-priority proposals).
- **Map/footer/nav reorganization**: Split the footer's "Explore" column into "Your City" (city-scoped links) and "Understand" (Learn/Transparency/Sources/Map, the same regardless of city). Footer columns now align with the homepage's card columns, branding stays visible while nav aligns, internal footer links reset scroll position on click, About/GitHub links were added to the homepage footer, and election dates show beside the Election nav link. Desktop navigation aligns with the homepage's content column at all widths, uses text-first pills instead of boxed/active-state controls, and the city selector is a scalable dropdown instead of inline switching.
- **Transparency page**: Separates the data's actual date span (earliest–latest, computed from real motion dates) from the "last checked" refresh date, only shows the current city's sources instead of both cities', relabels source-card eyebrows by type (Open Data / Council Pages / Maps) instead of repeating the city name, states the real factors behind "notable" scoring per city, and is now a top-level page instead of a back-linked sub-page; footer labels now match its headings so the distinction from the Sources directory is clear.
- **Static page cleanup**: About/Privacy/Terms consolidated to one URL each (`/about`, `/privacy`, `/terms`) instead of duplicated per-city routes — old links redirect, the header logo remembers the last city visited, and both now show the visitor's city in the header/footer instead of a bare logo. These and other static pages (Learn, Sources, Transparency) share one responsive content-column shell instead of each repeating its own width calculation, show a single page title instead of a repeated heading, and Privacy's copy is city-neutral instead of naming Toronto's ward specifically.
- **Meeting list density**: Toronto and Vancouver meeting archives now use less vertical space, and unfiltered pages no longer repeat the same total in the tab and below the filters.
- **Shared back navigation**: Motion, meeting, and committee pages now use one reusable responsive back-button component with the same placement and styling.
- **Removed the vote breakdown's collapse/expand toggle**: A motion's vote breakdown, and every amendment/procedural vote on the same item, now always shows fully expanded.
- **Notable motion cards now align**: Homepage cards share the same height even when one title is longer than the others.
- **Faster council data loading**: Production now serves motion data compressed, reducing the initial download before the dashboard appears.
- **Motion maps show more neighborhood context**: Automatic pin fitting now avoids zooming too tightly around a single address.
- **Motion dates are consistent across cities**: Vancouver's ISO dates now display in the same short month-and-day format as Toronto's.
- **City switcher closes on outside click**: The city menu now dismisses when focus moves outside it, with Escape-key support.
- **Vote labels stay on one line**: Vancouver voting terms remain readable at narrow widths.
- **Councillor cards**: Removed misleading topic labels and repeated Vancouver at-large text, clarified that "With majority" measures majority-vote agreement, and added official City profile links to Vancouver councillor Contact cards.

### Fixed

- **Toronto meeting source links**: Meetings without a stored record URL now link to the official Toronto Council site instead of showing dead source text.
- **Vancouver motion metadata links**: Council and topic labels now return to the homepage with the matching filter applied instead of opening a meeting detail page.
- **Trustee candidate selection**: Prevented unselected trustee wards from appearing empty and showing false zero-candidate counts while candidate data loads.
- **Alignment/spacing fixes**: The voting guide header now matches other detail pages' Back-link and header spacing, the Election nav pill no longer sits flush against its label, and the Documents card's fixed minimum height no longer leaves blank space below a single short document link.
- **Voting guide clarity**: Explained that the three-hour voting entitlement means three consecutive hours free to vote, not three additional hours off work.
- **Fixed a stale link on the Wards page**: "Learn how ward activity is tagged" pointed at the retired `/data` route; now points to `/transparency`.
- **Fixed Vancouver's site showing no data**: `vancouver/motions.json` and related files were missing from storage — the automated pipeline had never actually run the Vancouver upload steps (silently blocked by the "skip if no recent meeting" gate every time since before those steps existed), so the data had only ever gotten there from a one-time manual upload that later disappeared. Re-uploaded a fresh copy.
- **Stopped Vancouver's summary generation from calling Gemini uselessly**: agenda pages there don't have enough real text to summarize (the substance is in a linked PDF, not the page itself), so the scrape-and-summarize steps ran repeatedly for no usable output. Removed.
- **Motion-map tooltips not wrapping long titles**: Leaflet's default tooltip CSS forced `white-space: nowrap`, silently overriding the `max-width` on tooltip content, so a long motion title stretched the box across the map instead of wrapping. Fixed on the Map page and both existing motion-pin tooltips.
- **Fixed a too-tight gap above the featured Learn card**: The spacing wrapper used margin-based spacing, but the card is wrapped in a link (inline by default), so its top margin was silently ignored — switched to a flex gap.
- **Fixed a crash in the mobile nav menu**: It referenced a `tab.icon` field never defined on the tab list, so opening the mobile menu on any page threw "Element type is invalid."
- **Fixed the mayor not being marked on Vancouver's Councillors page**: Detection compared the exact name against `jurisdiction.mayorName` ("Ken Sim"), but Vancouver's vote data stores the mayor as "Mayor Ken Sim," so the match silently failed. Now matches regardless of which convention a city's data uses.
- **Sources page cleanup**: Fixed a broken link to Vancouver's council pages (pointed at a retired URL), removed a duplicate disclaimer that repeated Transparency's near-verbatim, and fixed a card linking to the same external Open Data URL twice (the button now points to the fuller internal Sources page).
- **Transparency alignment fixes**: Fixed misaligned disclaimer text (missing the same inline padding as the section label above it) and aligned "Latest voting record"/"Last checked" onto the same line regardless of how much content sits above them.
- **Fixed "Latest voting record: Invalid Date" on Transparency**: The date comparison compared display-formatted strings instead of parsing them, so it picked the wrong motion and then failed to parse it. Now compares real dates.
- **Fixed "last checked" never appearing on Transparency**: The metadata-writing step only lived inside the gated refresh job, so on the common case (no new meeting found, job skipped) it never ran — the site's "last checked" date had been silently missing since this feature was added. Added an ungated step that always records a check.
- **Fixed stale voting-guide links**: The Election page's "How to vote" / "Non-partisan guide" links pointed at the old `/learn/how-to-vote` URL; updated to the renamed `/learn/how-voting-works`.
- **Fixed council-vote guide rendering**: City-specific guide steps now load correctly instead of leaving the page blank.
