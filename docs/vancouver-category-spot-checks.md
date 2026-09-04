# Vancouver category spot-check log

The Vancouver feed contained 2,164 records on 2026-09-04. Each batch reviews
108 records, which is 5% of that snapshot. The records are selected by their
position in `public/data/vancouver/motions.json`, with `i` from 0 through 107:

- Batch 1: position `floor(i * 2164 / 108) + 1`
- Batch 2: position `floor((i + 0.5) * 2164 / 108) + 1`

The two batches contain 216 distinct motion IDs and are the completed samples.
Future spot-checks must use positions not selected by either formula, or a new
dataset snapshot with an explicit exclusion list.

## Batch 1 — 2026-09-04

108 motions reviewed by hand. 16 clear category mismatches found.

## Batch 2 — 2026-09-04

108 different motions reviewed by hand. 14 clear category mismatches found.

Clear mismatches:

- `General → Planning & Development`: prioritization framework, CD-1/text amendments, mass timber construction, station area plan, permitting targets
- `General → Finance`: development-potential relief program, BIA renewals
- `General → Parks`: cultural-grant motions
- `General → Governance`: council committee structure
- `General → Public Safety`: dangerous-building declaration
- `General → Transit`: school travel planning

## Batches 3–6 — 2026-09-04

Four further batches of 108 motions were reviewed by hand. Their IDs were
selected from the records not used by Batches 1–2, then each later batch was
selected from the remaining IDs. No record from Batches 1–4 was reused.

The cumulative sample is now 648 motions. The observed rate is still below
95%, so the review remains active. Clear mismatches in these rounds included
additional General → Planning & Development records (CD-1, development,
building, permitting, and land-use titles), General → Finance records (funds,
grants, and tax titles), General → Transit records (school travel and
e-scooter titles), and General → Governance/Public Safety/Parks/Housing/Climate
records where the title clearly named that subject.
