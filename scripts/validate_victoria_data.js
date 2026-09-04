/** Validate Victoria's source-only dataset before publication. */

import fs from 'node:fs';
import path from 'node:path';

/* global process */

const DATA_DIR = path.join(process.cwd(), 'public/data/victoria');
const FROM_DATE = '2022-11-01';
const VALID_VOTES = new Set(['YES', 'NO', 'ABSENT', 'CONFLICT', 'NO_VOTE']);
const VALID_STATUSES = new Set(['Adopted', 'Lost', 'Referred', 'Recorded']);

function readJson(file) {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

const motions = readJson('motions.json');
const meetings = readJson('meetings.json');
const councillors = readJson('councillors.json');
const metadata = readJson('metadata.json');
const errors = [];
const ids = new Set();

if (!motions.length) errors.push('no motions were imported');
if (!meetings.length) errors.push('no meetings were imported');
if (metadata.sample) errors.push('dataset is still marked as a sample');
if (!metadata.sourceLastRefreshed) errors.push('dashboard refresh time is missing');
if (councillors.length !== 9) errors.push(`expected 9 council members, found ${councillors.length}`);

for (const motion of motions) {
    if (ids.has(motion.id)) errors.push(`duplicate motion id: ${motion.id}`);
    ids.add(motion.id);
    if (!motion.title || !motion.date || motion.date < FROM_DATE) errors.push(`invalid date/title: ${motion.id}`);
    if (!motion.sourceUrl) errors.push(`missing official source URL: ${motion.id}`);
    if (!VALID_STATUSES.has(motion.status)) errors.push(`invalid status ${motion.status}: ${motion.id}`);
    if (motion.topic !== undefined) errors.push(`source-only record contains topic enrichment: ${motion.id}`);
    if (motion.significance !== 0 || motion.trivial !== true) errors.push(`source-only scoring fields are not neutral: ${motion.id}`);
    for (const [member, vote] of Object.entries(motion.votes ?? {})) {
        if (!councillors.includes(member)) errors.push(`unknown councillor ${member}: ${motion.id}`);
        if (!VALID_VOTES.has(vote)) errors.push(`invalid vote ${vote}: ${motion.id}`);
    }
}

if (errors.length) {
    console.error(`Victoria data validation failed with ${errors.length} error(s):`);
    errors.slice(0, 30).forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Validated ${motions.length} Victoria motions across ${meetings.length} meetings (${councillors.length} councillors); source-only fields are intact.`);
}
