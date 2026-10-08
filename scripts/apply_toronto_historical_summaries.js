/* global process */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const SUMMARY_PATH = path.join(process.cwd(), 'scripts/data/toronto_2019_2022_summaries.json');

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const summaries = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'));
let applied = 0;

for (const motion of motions) {
    if (summaries[motion.id]) {
        motion.summary = summaries[motion.id];
        applied++;
    }
}

fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
console.log(`Applied ${applied} Toronto historical summaries.`);
