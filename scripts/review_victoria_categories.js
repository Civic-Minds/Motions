/** Reapply the title-only Victoria category rules to an existing dataset. */

import fs from 'node:fs';
import path from 'node:path';
import { classifyVictoriaTopic } from './lib/victoriaClassification.js';

/* global process */

const dataPath = path.join(process.cwd(), 'public/data/victoria/motions.json');
const motions = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
for (const motion of motions) motion.topic = classifyVictoriaTopic(motion.title);
fs.writeFileSync(dataPath, JSON.stringify(motions, null, 2));
const categorized = motions.filter(motion => motion.topic).length;
console.log(`Reviewed ${motions.length} Victoria motions: ${categorized} categorized, ${motions.length - categorized} left blank.`);
