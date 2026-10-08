/* global process */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const REVIEW_PATH = path.join(process.cwd(), 'scripts/data/toronto_2019_2022_location_review.json');

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const review = JSON.parse(fs.readFileSync(REVIEW_PATH, 'utf8'));
const byId = new Map(motions.map(motion => [motion.id, motion]));
let applied = 0;

for (const [id, decision] of Object.entries(review)) {
    if (decision.decision !== 'inherit-parent') continue;

    const motion = byId.get(id);
    const parent = byId.get(decision.parentId);
    if (!motion || !parent?.locations?.length) {
        throw new Error(`Cannot inherit a location for ${id} from ${decision.parentId}`);
    }

    motion.locations = parent.locations.map(location => ({
        ...location,
        source: 'parent-motion',
        sourceMotionId: decision.parentId,
    }));
    motion.scope = parent.scope;
    applied++;
}

fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
console.log(`Applied ${applied} reviewed parent locations.`);
