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
