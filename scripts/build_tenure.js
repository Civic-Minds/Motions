/**
 * build_tenure.js
 *
 * Checks each term CSV to find the earliest term each councillor appears in.
 * Outputs public/data/tenure.json: { "Name": { since: 2010, terms: [2010, 2014, 2018, 2022] } }
 *
 * Usage: node scripts/build_tenure.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const OUT_PATH = path.join(process.cwd(), 'public/data/tenure.json');

const TERMS = [
  { year: 2006, url: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/01655cbd-dc66-4339-9f27-891e64413cbf/download/member-voting-record-2006-2010.csv' },
  { year: 2010, url: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/6c7dd98b-08d0-4f68-bee7-a0ba77a7da92/download/member-voting-record-2010-2014.csv' },
  { year: 2014, url: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/11d89d61-24c3-4241-8194-04b22098745e/download/member-voting-record-2014-2018.csv' },
  { year: 2018, url: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/373390e9-af88-4b58-a6a4-6863e3606a4b/download/member-voting-record-2018-2022.csv' },
  { year: 2022, url: 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/c4feb78c-c867-42a9-b803-7c6d859df969/download/member-voting-record-2022-2026.csv' },
];

async function getNamesForTerm({ year, url }) {
  console.log(`  Fetching ${year}–${year + 4}...`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${year}`);
  const text = await r.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const firstIdx = headers.findIndex(h => h === 'First Name');
  const lastIdx  = headers.findIndex(h => h === 'Last Name');
  const names = new Set();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(',');
    const first = cols[firstIdx]?.replace(/^"|"$/g, '').trim();
    const last  = cols[lastIdx]?.replace(/^"|"$/g, '').trim();
    if (first && last) names.add(`${first} ${last}`);
  }
  console.log(`    ${names.size} unique members`);
  return names;
}

async function main() {
  // Build map: name → sorted list of terms they appear in
  const memberTerms = {};

  for (const term of TERMS) {
    const names = await getNamesForTerm(term);
    for (const name of names) {
      if (!memberTerms[name]) memberTerms[name] = [];
      if (!memberTerms[name].includes(term.year)) memberTerms[name].push(term.year);
    }
  }

  // Build output: only include members with a known since year
  const tenure = {};
  for (const [name, terms] of Object.entries(memberTerms)) {
    terms.sort((a, b) => a - b);
    tenure[name] = { since: terms[0], terms };
  }

  // Sort by name
  const sorted = Object.fromEntries(
    Object.entries(tenure).sort(([a], [b]) => a.localeCompare(b))
  );

  fs.writeFileSync(OUT_PATH, JSON.stringify(sorted, null, 2));
  console.log(`\n✅ Written ${Object.keys(sorted).length} members to ${OUT_PATH}`);

  // Print current-term councillors with their since year
  const current = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'public/data/motions.json'), 'utf8'
  ));
  const currentNames = new Set();
  current.forEach(m => { if (m.votes) Object.keys(m.votes).forEach(n => currentNames.add(n)); });

  console.log('\nCurrent term councillors:');
  [...currentNames].sort().forEach(name => {
    const t = sorted[name];
    if (t) console.log(`  ${t.since}  ${name}  [${t.terms.join(', ')}]`);
    else   console.log(`  ????  ${name}  (not found in earlier terms)`);
  });
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
