/**
 * Validate Yellowknife's eSCRIBE-sourced dataset before publication.
 *
 * Basic field checks plus the shared link/freshness checks that refuse
 * publication when minutes downloads are being blocked
 * (see scripts/lib/escribeDataChecks.js).
 */

import fs from 'node:fs';
import path from 'node:path';
import { linkAndFreshnessErrors } from './lib/escribeDataChecks.js';

/* global process */

const DATA_DIR = path.join(process.cwd(), 'public/data/yellowknife');
const VALID_VOTES = new Set(['YES', 'NO', 'ABSENT', 'CONFLICT', 'NO_VOTE']);
const VALID_STATUSES = new Set(['Adopted', 'Not adopted']);

function readJson(file) {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

const motions = readJson('motions.json');
const meetings = readJson('meetings.json');
const councillors = readJson('councillors.json');
const councillorNames = new Set(councillors.map(c => c.name));
const errors = [];
const ids = new Set();

if (!motions.length) errors.push('no motions were imported');
if (!meetings.length) errors.push('no meetings were imported');

for (const motion of motions) {
    if (ids.has(motion.id)) errors.push(`duplicate motion id: ${motion.id}`);
    ids.add(motion.id);
    if (!motion.title || !motion.date) errors.push(`missing date/title: ${motion.id}`);
    if (!motion.sourceUrl) errors.push(`missing official source URL: ${motion.id}`);
    if (!VALID_STATUSES.has(motion.status)) errors.push(`invalid status ${motion.status}: ${motion.id}`);
    for (const [member, vote] of Object.entries(motion.votes ?? {})) {
        if (!councillorNames.has(member)) errors.push(`unknown councillor ${member}: ${motion.id}`);
        if (!VALID_VOTES.has(vote)) errors.push(`invalid vote ${vote}: ${motion.id}`);
    }
}

errors.push(...linkAndFreshnessErrors(motions, meetings));

if (errors.length) {
    console.error(`Yellowknife data validation failed with ${errors.length} error(s):`);
    errors.slice(0, 30).forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
} else {
    console.log(`Validated ${motions.length} Yellowknife motions across ${meetings.length} meetings (${councillors.length} councillors).`);
}
