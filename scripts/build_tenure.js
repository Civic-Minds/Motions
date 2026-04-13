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

// Pre-2006 terms not captured by Open Data CSVs.
// Pre-amalgamation/pre-2006 Toronto terms were 3 years each (1988 reform).
// Post-2006 terms are 4 years. Term year = election year.
const TERM_YEARS = { 1988: 3, 1991: 3, 1994: 3, 1997: 3, 2000: 3, 2003: 3 };
const termYears = year => TERM_YEARS[year] ?? 4;

// Councillors with known service predating the Open Data CSV record (2006).
// Only post-amalgamation (1997+) Toronto City/Metro Council terms are counted.
const SUPPLEMENTAL_TERMS = {
  'Olivia Chow':      [1991, 1994, 1997, 2000, 2003], // Metro/City council before going federal
  'Frances Nunziata': [1997, 2000, 2003],              // post-amalgamation pre-2006 terms
};

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

  // Merge supplemental pre-2006 terms
  for (const [name, extraTerms] of Object.entries(SUPPLEMENTAL_TERMS)) {
    if (!memberTerms[name]) memberTerms[name] = [];
    for (const t of extraTerms) {
      if (!memberTerms[name].includes(t)) memberTerms[name].push(t);
    }
  }

  // Build output: only include members with a known since year
  const tenure = {};
  for (const [name, terms] of Object.entries(memberTerms)) {
    terms.sort((a, b) => a - b);
    const totalYears = terms.reduce((sum, t) => sum + termYears(t), 0);
    tenure[name] = { since: terms[0], terms, totalYears };
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
