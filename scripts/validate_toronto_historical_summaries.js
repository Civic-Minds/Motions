/* global process */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const SUMMARY_PATH = path.join(process.cwd(), 'scripts/data/toronto_2019_2022_summaries.json');

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const summaries = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'));
const motionIds = new Set(motions.map(motion => motion.id));
const summaryIds = new Set(Object.keys(summaries));
const missing = [...summaryIds].filter(id => !motionIds.has(id) || !summaries[id].trim());
const extra = [...summaryIds].filter(id => !motionIds.has(id));

if (missing.length || extra.length) {
    console.error(JSON.stringify({ motions: motions.length, summaries: summaryIds.size, missing, extra }, null, 2));
    process.exit(1);
}

console.log(`Validated ${summaryIds.size} Toronto 2019–2022 manual summaries against ${motions.length} motions.`);
