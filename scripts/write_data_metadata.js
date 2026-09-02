import fs from 'fs';
import path from 'path';

/* global process */

const cityArg = process.argv.find(arg => arg.startsWith('--city='));
const city = cityArg ? cityArg.slice('--city='.length) : process.argv.includes('--vancouver') ? 'vancouver' : 'toronto';
const directory = city === 'toronto' ? 'public/data' : `public/data/${city}`;

fs.writeFileSync(
  path.join(process.cwd(), directory, 'metadata.json'),
  JSON.stringify({ lastChecked: new Date().toISOString() }, null, 2) + '\n'
);

console.log(`Wrote ${directory}/metadata.json`);
