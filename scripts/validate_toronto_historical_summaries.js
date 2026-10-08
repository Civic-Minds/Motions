/* global process */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const SUMMARY_PATH = path.join(process.cwd(), 'scripts/data/toronto_2019_2022_summaries.json');

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const summaries = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'));
const historical = motions.filter(motion => /\b(2019|2020|2021|2022)\b/.test(motion.date ?? ''));
const motionIds = new Set(historical.map(motion => motion.id));
const summaryIds = new Set(Object.keys(summaries));
const missing = historical.filter(motion => !summaries[motion.id] || !summaries[motion.id].trim()).map(motion => motion.id);
const extra = [...summaryIds].filter(id => !motionIds.has(id));

if (missing.length || extra.length || historical.length !== summaryIds.size) {
    console.error(JSON.stringify({ historical: historical.length, summaries: summaryIds.size, missing, extra }, null, 2));
    process.exit(1);
}

console.log(`Validated ${historical.length} Toronto 2019–2022 manual summaries.`);
