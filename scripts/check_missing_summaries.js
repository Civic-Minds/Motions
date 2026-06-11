import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// After generate_summaries.js runs, anything still missing a summary is
// genuinely stuck (e.g. missing body text) — flag it regardless of age.
const missing = motions.filter(m => !m.parentId && !m.summary);

if (missing.length > 0) {
  console.log(missing.map(m => `- ${m.id} (${m.date}) — ${m.title}`).join('\n'));
}
