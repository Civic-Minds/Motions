import fs from 'fs';
import path from 'path';

const isVancouver = process.argv.includes('--vancouver');
const directory = isVancouver ? 'public/data/vancouver' : 'public/data';

fs.writeFileSync(
  path.join(process.cwd(), directory, 'metadata.json'),
  JSON.stringify({ lastChecked: new Date().toISOString() }, null, 2) + '\n'
);

console.log(`Wrote ${directory}/metadata.json`);
