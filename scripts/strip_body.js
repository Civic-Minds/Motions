/**
 * strip_body.js
 *
 * Removes the `body` field from all motions before committing to the repo.
 * Run after generate_summaries.js — body is only needed for summary generation.
 *
 * Usage:
 *   node scripts/strip_body.js
 */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');

const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const before = JSON.stringify(motions).length;

const stripped = motions.map(({ body: _, ...m }) => m);
fs.writeFileSync(DATA_PATH, JSON.stringify(stripped, null, 2));

const after = JSON.stringify(stripped).length;
const saved = ((before - after) / 1024 / 1024).toFixed(1);

console.log(`✅ Stripped body from ${motions.filter(m => m.body).length} motions — saved ${saved} MB`);
