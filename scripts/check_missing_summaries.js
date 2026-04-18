/**
 * check_missing_summaries.js
 *
 * Prints a markdown list of primary motions missing summaries, one per line.
 * Exits 0 with no output if none are missing.
 * Used by the GitHub Actions refresh workflow to open an issue when needed.
 */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const missing = motions.filter(m => !m.parentId && !m.summary);

if (missing.length > 0) {
  console.log(missing.map(m => `- ${m.id} (${m.date}) — ${m.title}`).join('\n'));
}
