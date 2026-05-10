import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Try to get the previous version from Git to identify what's actually "new"
let oldMotions = [];
try {
  // Increase maxBuffer to 10MB to handle large motions.json file
  const oldJson = execSync('git show HEAD:public/data/motions.json', { 
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'ignore'] 
  }).toString();
  oldMotions = JSON.parse(oldJson);
} catch (e) {
  oldMotions = [];
}

const oldIds = new Set(oldMotions.map(m => m.id));

const missing = motions.filter(m => !oldIds.has(m.id) && !m.parentId && !m.summary);

if (missing.length > 0) {
  console.log(missing.map(m => `- ${m.id} (${m.date}) — ${m.title}`).join('\n'));
}
