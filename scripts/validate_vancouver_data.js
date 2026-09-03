/**
 * Validate the generated Vancouver data before it is uploaded.
 *
 * The importer owns the normal title cleanup, while the tracked overrides in
 * motionTitle.js own source-backed corrections. This check makes the refresh
 * fail instead of publishing a title that bypasses either one.
 */

import fs from 'node:fs';
import path from 'node:path';
import { cleanVancouverTitle, VANCOUVER_TITLE_OVERRIDES } from '../src/utils/motionTitle.js';

/* global process */

const dataPath = path.join(process.cwd(), 'public/data/vancouver/motions.json');
const motions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const errors = [];
const seenIds = new Set();

for (const [index, motion] of motions.entries()) {
    const prefix = `motions[${index}]`;
    if (!motion.id) errors.push(`${prefix} is missing an id`);
    if (seenIds.has(motion.id)) errors.push(`${prefix} duplicates id ${motion.id}`);
    seenIds.add(motion.id);

    if (!motion.title?.trim()) {
        errors.push(`${prefix} (${motion.id}) is missing a title`);
        continue;
    }

    const cleanedTitle = cleanVancouverTitle(motion.title, motion.id);
    if (cleanedTitle !== motion.title) {
        errors.push(`${motion.id} is not normalized: ${JSON.stringify(motion.title)}`);
    }

    const expectedOverride = VANCOUVER_TITLE_OVERRIDES[motion.id];
    if (expectedOverride && motion.title !== expectedOverride) {
        errors.push(`${motion.id} lost its tracked source-title override`);
    }
}

if (errors.length) {
    console.error(`Vancouver data validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log(`Validated ${motions.length.toLocaleString()} Vancouver motions; titles and tracked overrides are intact.`);
}
