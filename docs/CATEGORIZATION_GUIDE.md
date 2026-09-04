# Motion categorization guide

Use this guide for every city in Motions. Review the official motion title and
record only what the title clearly supports.

## Two separate decisions

`administrative` describes the kind of action. `topic` describes what the
action is about. An administrative motion can still have a topic, but routine
administrative records should normally remain hidden from the public motion
list.

## Administrative motions

Mark a motion administrative when it only handles council's routine process and
does not make a meaningful policy, spending, service, bylaw, development, or
public-asset decision.

Common examples:

- approving or adopting previous minutes
- adopting, receiving, or making minor changes to an agenda
- adjourning or recessing a meeting
- setting a meeting date or procedural deadline
- routine receipt, confirmation, or filing of correspondence
- procedural referrals with no decision on the underlying issue

Do not mark a motion administrative merely because it is short or unanimous.
Appointments, grants, contracts, bylaws, budgets, tax decisions, and service
changes are substantive even when routine or unanimous.

## Topics

Assign one topic only when the subject is clear from the title. Use these
topic labels consistently across cities. Every city's classifier must store
the exact **short** string in `motion.topic` — that's what filters, colours,
and the `?topic=` URL param key on. The **long** form is display-only,
looked up from the short key (`TOPIC_LONG` in `src/constants/data.js`) for
places where the short label alone would read as ambiguous, such as the
motion detail page.

| Short (stored, sidebar/badges) | Long (display-only) | Covers |
|---|---|---|
| **Housing** | Housing & Homelessness | housing supply, shelters, homelessness, supportive housing |
| **Transit** | Transit & Transportation | transit, roads, traffic, parking, active transportation |
| **Finance** | Finance & Budgets | budgets, taxes, fees, grants, contracts, procurement, reserves |
| **Planning & Development** | Planning, Zoning & Development | zoning, development permits, land use, building and property approvals |
| **Parks** | Parks, Recreation & Culture | parks, trails, recreation, libraries, arts, heritage, events |
| **Climate** | Climate & Environment | climate, emissions, energy, water, waste, recycling, conservation |
| **Governance** | Governance & Council Operations | elections, boards, bylaws, council structure, appointments, and other government-operation decisions |
| **Public Safety** | Public Safety & Emergency Services | policing, fire, emergency services, safety, disaster response |
| **General** | General | a substantive motion whose subject is not clear enough for another topic |

If more than one topic applies, choose the primary subject stated in the
motion. If the subject is not clear, use **General** rather than guessing.
Routine administrative records such as minutes and adjournments should
normally use General unless the title clearly identifies another subject.

### Tie-breaks a classifier must encode

These came out of a title-by-title review across all four cities and apply
regardless of which city's keyword list is running:

- **Appointments beat domain keywords.** "Appointment of a Public Member to
  the TTC Board" is Governance, not Transit — the same goes for library,
  police, and fire board seats. Detect appointment/election-of-officer
  titles and resolve to Governance *before* running the topic keyword loop
  (see `isAppointmentTitle` in `scripts/lib/topicClassification.js`).
- **Housing-framing beats the legal mechanism.** A rezoning or heritage
  permit whose stated purpose is preserving or adding housing (rental
  demolition control, supportive housing, affordable housing) is Housing,
  not Planning & Development, even though the mechanism is a zoning
  instrument.
- **A domain noun beats a generic Finance/Governance word.** "Contract
  Award — Fire Apparatus" is Public Safety, not Finance; "Grant Allocations
  — Arts and Culture" is Parks, not Finance. Keep Finance's generic
  keywords (`budget`, `tax`, `contract`, `grant`) checked last, after every
  domain-specific category, so they only catch true catch-all cases.
- **Routine process titles skip the keyword loop entirely** (adopting
  minutes, adjournment, notice of motion, meeting-schedule changes,
  correspondence receipt) and go straight to General — see
  `isAdministrativeTitle`. This is narrower than the full administrative
  definition above: it only fires on title shapes with no substantive
  content, never on judgment calls like appointments or grants.

## Review rules

1. Preserve the original title, source link, vote, and meeting record.
2. Do not remove administrative motions from the dataset; hide them only in
   normal public browsing.
3. Do not treat agenda-item numbers or numbered clauses as separate motions.
4. Flag titles containing PDF headers, OCR corruption, or unrelated agenda text
   for title cleanup before categorizing them.
5. When uncertain, leave the motion visible, use General, and note the
   uncertainty for later review.

Each city's classifier lives in `scripts/lib/<city>Classification.js`.
Editing a keyword list only changes future imports — run
`node scripts/reclassify_topics.js --city=<city>` (or `--city=all`) to
reapply it to the motions already in `public/data/`.
