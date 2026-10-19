/**
 * Validate Victoria's eSCRIBE-sourced dataset before publication.
 *
 * Besides per-motion field checks, this refuses publication when the newest
 * motion is more than 90 days old or when meetings that have motions have
 * lost their motion links -- both signs that minutes downloads are being
 * blocked (see scripts/lib/escribeDataChecks.js).
 */

import fs from 'node:fs';
import path from 'node:path';
import { CANONICAL_TOPICS } from './lib/topicClassification.js';
import { linkAndFreshnessErrors } from './lib/escribeDataChecks.js';

/* global process */

const DATA_DIR = path.join(process.cwd(), 'public/data/victoria');
const FROM_DATE = '2022-11-01';
const VALID_VOTES = new Set(['YES', 'NO', 'ABSENT', 'CONFLICT', 'NO_VOTE']);
const VALID_STATUSES = new Set(['Adopted', 'Lost', 'Referred', 'Recorded']);
const VALID_TOPICS = new Set(CANONICAL_TOPICS);

function readJson(file) {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

const motions = readJson('motions.json');
const meetings = readJson('meetings.json');
const councillors = readJson('councillors.json');
const councillorNames = councillors.map(c => c.name);
const errors = [];
const ids = new Set();

if (!motions.length) errors.push('no motions were imported');
if (!meetings.length) errors.push('no meetings were imported');
// A sanity range, not an exact business rule -- catches a broken roster
// (0 current members) without hard-failing CI during an election transition,
// when the new council briefly overlaps the outgoing one in this list.
const currentCount = councillors.filter(c => c.current !== false).length;
if (currentCount < 1 || currentCount > 18) errors.push(`implausible current council size: ${currentCount}`);

for (const motion of motions) {
    if (ids.has(motion.id)) errors.push(`duplicate motion id: ${motion.id}`);
    ids.add(motion.id);
    if (!motion.title || !motion.date || motion.date < FROM_DATE) errors.push(`invalid date/title: ${motion.id}`);
    if (!motion.sourceUrl) errors.push(`missing official source URL: ${motion.id}`);
    if (!motion.backgroundFiles?.length) errors.push(`missing direct official document: ${motion.id}`);
    if (!VALID_STATUSES.has(motion.status)) errors.push(`invalid status ${motion.status}: ${motion.id}`);
    if (!VALID_TOPICS.has(motion.topic)) errors.push(`invalid topic: ${motion.id}`);
    if (typeof motion.significance !== 'number' || motion.significance < 0 || motion.significance > 100) {
        errors.push(`invalid significance score: ${motion.id}`);
    }
    if (typeof motion.trivial !== 'boolean') errors.push(`invalid trivial flag: ${motion.id}`);
    for (const [member, vote] of Object.entries(motion.votes ?? {})) {
        if (!councillorNames.includes(member)) errors.push(`unknown councillor ${member}: ${motion.id}`);
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

errors.push(...linkAndFreshnessErrors(motions, meetings));

if (errors.length) {
    console.error(`Victoria data validation failed with ${errors.length} error(s):`);
    errors.slice(0, 30).forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Validated ${motions.length} Victoria motions across ${meetings.length} meetings (${councillors.length} councillors).`);
}
