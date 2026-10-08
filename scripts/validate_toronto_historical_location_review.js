/* global process */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const REVIEW_PATH = path.join(process.cwd(), 'scripts/data/toronto_2019_2022_location_review.json');

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const review = JSON.parse(fs.readFileSync(REVIEW_PATH, 'utf8'));
const byId = new Map(motions.map(motion => [motion.id, motion]));
const invalid = [];

for (const [id, decision] of Object.entries(review)) {
    const motion = byId.get(id);
    if (!motion) {
        invalid.push(`${id}: motion not found`);
        continue;
    }
    if (!['inherit-parent', 'unresolved'].includes(decision.decision)) {
        invalid.push(`${id}: invalid decision ${decision.decision}`);
    }
    if (decision.decision === 'inherit-parent') {
        const parent = byId.get(decision.parentId);
        if (!parent?.locations?.length) invalid.push(`${id}: parent has no locations`);
        if (!motion.locations?.some(location => location.source === 'parent-motion' && location.sourceMotionId === decision.parentId)) {
            invalid.push(`${id}: inherited location not applied`);
        }
    }
}

if (Object.keys(review).length !== 70 || invalid.length) {
    console.error(JSON.stringify({ reviewCount: Object.keys(review).length, invalid }, null, 2));
    process.exit(1);
}

console.log(`Validated 70 reviewed Toronto historical location decisions.`);
