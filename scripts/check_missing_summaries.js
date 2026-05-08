import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Try to get the previous version from Git to identify what's actually "new"
let oldMotions = [];
try {
  const oldJson = execSync('git show HEAD:public/data/motions.json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
  oldMotions = JSON.parse(oldJson);
} catch (e) {
  // If file doesn't exist in HEAD or git fails, we assume everything is new
  oldMotions = [];
}

const oldIds = new Set(oldMotions.map(m => m.id));

// Filter for motions that:
// 1. Are new in this scrape (not in oldIds)
// 2. Are primary motions (!parentId)
// 3. Lack a summary
const missing = motions.filter(m => !oldIds.has(m.id) && !m.parentId && !m.summary);

if (missing.length > 0) {
  console.log(missing.map(m => `- ${m.id} (${m.date}) — ${m.title}`).join('\n'));
}
