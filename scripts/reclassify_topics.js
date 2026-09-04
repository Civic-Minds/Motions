/**
 * Reapply a city's title-only topic classifier to its existing dataset,
 * without re-scraping or re-summarizing. Editing a city's keyword map in
 * scripts/lib/*Classification.js only changes what NEW imports produce —
 * this script is what makes that change visible for motions already in
 * public/data/<city>/motions.json.
 *
 * Usage:
 *   node scripts/reclassify_topics.js --city=toronto
 *   node scripts/reclassify_topics.js --city=vancouver
 *   node scripts/reclassify_topics.js --city=victoria
 *   node scripts/reclassify_topics.js --city=yellowknife
 *   node scripts/reclassify_topics.js --city=all
 */

import fs from 'node:fs';
import path from 'node:path';
import { classifyTorontoTopic } from './lib/torontoClassification.js';
import { classifyVancouverTopic } from './lib/vancouverClassification.js';
import { classifyVictoriaTopic } from './lib/victoriaClassification.js';
import { classifyYellowknifeTopic } from './lib/yellowknifeClassification.js';

/* global process */

const CITIES = {
    toronto: { dataPath: 'public/data/motions.json', classify: classifyTorontoTopic },
    vancouver: { dataPath: 'public/data/vancouver/motions.json', classify: classifyVancouverTopic },
    victoria: { dataPath: 'public/data/victoria/motions.json', classify: classifyVictoriaTopic },
    yellowknife: { dataPath: 'public/data/yellowknife/motions.json', classify: classifyYellowknifeTopic },
};

const cityArg = process.argv.find(arg => arg.startsWith('--city='))?.slice('--city='.length);
if (!cityArg || (cityArg !== 'all' && !CITIES[cityArg])) {
    console.error(`Usage: node scripts/reclassify_topics.js --city=<${Object.keys(CITIES).join('|')}|all>`);
    process.exit(1);
}
const targets = cityArg === 'all' ? Object.keys(CITIES) : [cityArg];

for (const city of targets) {
    const { dataPath, classify } = CITIES[city];
    const fullPath = path.join(process.cwd(), dataPath);
    const motions = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    const before = {};
    for (const motion of motions) before[motion.topic ?? '(missing)'] = (before[motion.topic ?? '(missing)'] ?? 0) + 1;

    for (const motion of motions) motion.topic = classify(motion.title);

    const after = {};
    for (const motion of motions) after[motion.topic ?? '(missing)'] = (after[motion.topic ?? '(missing)'] ?? 0) + 1;

    fs.writeFileSync(fullPath, JSON.stringify(motions, null, 2));

    console.log(`\n${city} — reclassified ${motions.length} motions`);
    console.log('  before:', before);
    console.log('  after: ', after);
}
