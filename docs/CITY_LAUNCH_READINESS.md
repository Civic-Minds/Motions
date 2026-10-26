# City Launch Readiness

This is the gate for adding a city to the public Motions selector. A city is
not launch-ready just because its route renders or its importer produces JSON.
It must have an authoritative, understandable, repeatable, and honestly
described record.

## Status levels

### Prototype

Local data and UI are available for investigation. Data may be incomplete,
stale, or weakly enriched. The city stays off the public selector.

### Review-ready

The source mapping, importer, data model, title cleanup, and core UI have been
checked by a human. Remaining gaps are known and documented.

### Launch-ready

All hard gates below pass against the data that will actually be published,
the refresh process is repeatable, and the deployed city has been checked with
populated data.

## Hard launch gates

Every item in this section must pass before `public: true` or a public Blob
namespace is enabled.

### 1. Source and scope

- [ ] The source is official or otherwise authoritative for the city body being
  represented.
- [ ] The source's coverage is understood: council, committees, date range,
  recorded-vote limitations, and any missing member groups.
- [ ] The source can be accessed repeatedly without a manual login or a
  fragile, one-off browser session.
- [ ] Terms, rate limits, and attribution requirements are understood.
- [ ] The city page identifies the official source and does not imply broader
  coverage than the source provides.

### 2. Stable record identity

- [ ] Every motion has a stable, source-derived ID.
- [ ] IDs are unique and remain stable across refreshes.
- [ ] Separate decisions remain separate when they are genuinely different
  recommendations, readings, amendments, or committee stages.
- [ ] Repeated source rows for individual member votes are grouped into the
  correct decision without losing any vote.
- [ ] The distinction between an agenda item and a recorded decision is
  documented and reflected in counts and labels.

### 3. Title quality

Titles are a launch gate because they drive search, topics, significance, and
what residents understand from a card.

- [ ] Character encoding is repaired: no mojibake such as `â€“`, `â€™`, or
  `â€œ` remains.
- [ ] Numbering, duplicated headers, document labels, and procedural noise are
  removed without deleting meaningful content.
- [ ] Titles distinguish amendments, readings, recommendations, and separate
  votes when those distinctions matter.
- [ ] Titles are not truncated, merged with unrelated agenda text, or made up
  from a vote description alone.
- [ ] Automated title checks pass for every record.
- [ ] Every high-impact/notable candidate and a representative sample across
  years and committees receive manual review.
- [ ] Corrections that cannot be expressed as a deterministic rule live in a
  tracked override file and are reapplied after every refresh.
- [ ] The source title remains available through the official record link when
  Motions normalizes it.

### 4. Vote integrity

- [ ] Vote values map to the shared schema: `YES`, `NO`, `ABSENT`, `CONFLICT`,
  `ABSTAIN`, `NO_VOTE`, or another explicitly documented value.
- [ ] Adopted/lost/not-adopted statuses are mapped consistently and checked
  against the source result.
- [ ] Stored yes/no totals reconcile with the member vote map where the source
  provides totals.
- [ ] Missing votes are not silently converted into `YES`.
- [ ] Roll-call limitations are disclosed, especially where the source only
  names opposing or absent members.
- [ ] A sample of close, unanimous, defeated, and multi-stage decisions has
  been checked against the official source.

### 5. Council and meeting coverage

- [ ] The current mayor/councillor roster is correct as of the proposed launch
  date.
- [ ] Historical members remain available where they appear in older votes.
- [ ] Current-member flags are correct and drive the UI's current roster.
- [ ] Meetings have dates, committee/body names, stable references, and source
  links.
- [ ] The latest expected meeting is present, or the reason it is absent is
  documented.
- [ ] Meeting pages, committee pages, councillor pages, and vote histories do
  not crash on the city's data shape.

### 6. Topics and significance

- [ ] Topics use the canonical Motions labels.
- [ ] Topic rules have been tested against a title sample and obvious false
  positives have been corrected.
- [ ] The city's significance formula uses only fields the city source actually
  supplies.
- [ ] Scores are not presented as directly comparable across cities unless the
  formulas and calibration have been reviewed together.
- [ ] `High Impact` and `Notable` are disabled until the city's scoring has
  been reviewed against real examples.
- [ ] Every record shown in a “Most Notable” or “High Impact” area has received
  a human spot-check before launch.
- [ ] If scoring is not ready, the homepage says `Recent Decisions` and does
  not imply editorial impact ranking.

### 7. Summaries and enrichment

Summaries are optional for launch. They must never be invented to make a city
look complete.

- [ ] If summaries are enabled, they are based on a permitted, non-PDF text
  source that is actually available to the pipeline.
- [ ] PDFs and OCR are never used for summaries.
- [ ] If no acceptable text source exists, summaries remain blank and the UI
  does not imply that summaries are available.
- [ ] Every motion is reviewed for a location signal, not just the motions that
  already look easy to geocode.
- [ ] Location extraction distinguishes a real civic location from incidental
  addresses, dates, bylaw numbers, organization names, and unrelated places.
- [ ] Every accepted location has a source-backed address or named place,
  coordinates, and a record of how it was derived.
- [ ] Every rejected or unresolved location is safe to leave unmapped; the
  importer does not guess coordinates from weak text.
- [ ] Location tagging is optional for launch only if the full review is
  complete and the city page states the resulting coverage. A city with no
  location coverage must say so plainly.
- [ ] Candidate, election, financial, and other enrichment modules are either
  sourced and checked or omitted from the city experience.

### 8. UI and public claims

- [ ] The city route loads with its own local data.
- [ ] Homepage, motion detail, meetings, committees, councillors, sources, and
  transparency pages work.
- [ ] City name, mayor, election date, geography, labels, and official links
  are correct.
- [ ] Ward-level features are hidden unless ward boundaries and motion-to-ward
  mapping are actually implemented.
- [ ] The city selector, footer, sitemap, metadata, and API routing agree on
  whether the city is public.
- [ ] The transparency page states the actual date range and known limits.
- [ ] No “coming soon”, “most notable”, “high impact”, summary, or map claim
  exceeds the evidence in the published data.

### 9. Refresh and validation

- [ ] A clean checkout can install dependencies and run the importer.
- [ ] Refreshing twice produces stable IDs and does not duplicate records.
- [ ] The importer fails loudly on source schema changes, empty data, stale
  data, invalid dates, invalid votes, or missing required fields.
- [ ] The city has a dedicated validation command or an equivalent check in the
  refresh workflow.
- [ ] The refresh preserves title overrides and any approved enrichment.
- [ ] Data freshness is recorded in metadata.
- [ ] Publication is blocked when a required validation gate fails.

### 10. Production publication

- [ ] Published files are in the correct city Blob namespace.
- [ ] The production API can serve all required city files.
- [ ] The deployed route loads the published data, not a developer's local
  files.
- [ ] A live check confirms populated motions, meetings, councillors, source
  links, and the latest data date.
- [ ] The city is enabled publicly only after the live check passes.
- [ ] The first post-launch refresh is monitored and its output is checked.

## Not required for launch

These are valuable, but they should not block a city if the limitations are
clearly disclosed:

- AI summaries, where no permitted non-PDF text source exists
- Location extraction and geocoding
- Ward maps for a city with no reliable ward mapping
- Candidate tracking and custom election pages
- Full historical coverage beyond the source's reliable range

## Winnipeg initial assessment

Winnipeg currently has a local prototype with an official Socrata voting
source, 8,927 decision records, 239 meetings, and a current councillor roster.
It is not launch-ready yet.

The known work is:

- [ ] Repair title encoding and normalize title structure, including examples
  such as `â€“` becoming `–`.
- [ ] Audit repeated titles and separate recommendation/readings correctly.
- [ ] Replace or disable the provisional Winnipeg significance score and its
  `High Impact`/`Notable` badges until reviewed.
- [ ] Keep summaries blank because the project does not use PDFs for summaries.
- [ ] Review all 8,927 Winnipeg motions for location signals, then add only
  source-backed location tags; unresolved records remain unmapped.
- [ ] Until that review is complete, state clearly that location coverage is
  unreviewed rather than presenting the map as complete.
- [ ] Add repeatable refresh validation and a freshness gate.
- [ ] Complete a production-data and live-deployment check before public launch.

Until those checks pass, Winnipeg should remain a development-only city.
