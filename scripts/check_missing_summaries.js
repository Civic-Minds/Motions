/* global process */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Submotions intentionally inherit the parent motion's summary. Only primary
// motions with no summary are actionable pipeline failures.
const primary = motions.filter(m => !m.parentId);
const submotions = motions.filter(m => m.parentId);
const missing = primary.filter(m => !m.summary);

// Keep this on stderr so workflow command substitution still receives only
// the actionable motion list for automatic issue creation.
console.error(
  `Summary check: ${primary.length} primary motions, ` +
  `${submotions.length} submotions, ${missing.length} actionable missing summaries.`
);

if (missing.length > 0) {
  console.log(missing.map(m => `- ${m.id} (${m.date}) — ${m.title}`).join('\n'));
}
