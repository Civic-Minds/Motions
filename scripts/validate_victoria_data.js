/** Validate Victoria's source-only dataset before publication. */

import fs from 'node:fs';
import path from 'node:path';

/* global process */

const DATA_DIR = path.join(process.cwd(), 'public/data/victoria');
const FROM_DATE = '2022-11-01';
const MAX_SOURCE_AGE_DAYS = 90;
const VALID_VOTES = new Set(['YES', 'NO', 'ABSENT', 'CONFLICT', 'NO_VOTE']);
const VALID_STATUSES = new Set(['Adopted', 'Lost', 'Referred', 'Recorded']);
const VALID_TOPICS = new Set(['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'Events', 'General']);

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
else {
    const sourceAge = Date.now() - new Date(metadata.sourceLastRefreshed).getTime();
    if (!Number.isFinite(sourceAge) || sourceAge < 0 || sourceAge > MAX_SOURCE_AGE_DAYS * 86400000) {
        errors.push(`dashboard data is older than ${MAX_SOURCE_AGE_DAYS} days`);
    }
}
if (councillors.length !== 9) errors.push(`expected 9 council members, found ${councillors.length}`);

for (const motion of motions) {
    if (ids.has(motion.id)) errors.push(`duplicate motion id: ${motion.id}`);
    ids.add(motion.id);
    if (!motion.title || !motion.date || motion.date < FROM_DATE) errors.push(`invalid date/title: ${motion.id}`);
    if (!motion.sourceUrl) errors.push(`missing official source URL: ${motion.id}`);
    if (!motion.backgroundFiles?.length) errors.push(`missing direct official document: ${motion.id}`);
    if (!VALID_STATUSES.has(motion.status)) errors.push(`invalid status ${motion.status}: ${motion.id}`);
    if (!VALID_TOPICS.has(motion.topic)) errors.push(`invalid topic: ${motion.id}`);
    if (motion.significance !== 0 || motion.trivial !== true) errors.push(`source-only scoring fields are not neutral: ${motion.id}`);
    for (const [member, vote] of Object.entries(motion.votes ?? {})) {
        if (!councillors.includes(member)) errors.push(`unknown councillor ${member}: ${motion.id}`);
        if (!VALID_VOTES.has(vote)) errors.push(`invalid vote ${vote}: ${motion.id}`);
    }
    for (const location of motion.locations ?? []) {
        if (!location.address || !Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lng))) {
            errors.push(`invalid location: ${motion.id}`);
        }
    }
    for (const file of motion.backgroundFiles ?? []) {
        if (!file.label || !/^https:\/\//.test(file.url)) errors.push(`invalid document link: ${motion.id}`);
    }
}

if (errors.length) {
    console.error(`Victoria data validation failed with ${errors.length} error(s):`);
    errors.slice(0, 30).forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Validated ${motions.length} Victoria motions across ${meetings.length} meetings (${councillors.length} councillors); source-only fields are intact.`);
}
