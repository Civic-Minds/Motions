#!/usr/bin/env node
/**
 * Fetches Toronto City Council voting records from the Open Data API.
 * Groups individual vote rows into motions, merges with existing data to
 * preserve manually-set fields (topic, significance, trivial, url, ward, flags).
 *
 * Usage: node scripts/fetch_motions.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RESOURCE_ID = '55ead013-2331-4686-9895-9e8145b94189'; // 2022-2026 term
const API_BASE    = 'https://ckan0.cf.opendata.inter.prod-toronto.ca';
const OUT_FILE    = path.join(__dirname, '../public/data/motions.json');
const PAGE_SIZE   = 5000;

// ── Topic classification ──────────────────────────────────────────────────────

const TOPIC_KEYWORDS = {
  Housing: [
    'housing', 'affordable', 'rental', 'rent', 'tenant', 'landlord', 'zoning',
    'rezoning', 'shelter', 'eviction', 'secondary suite', 'inclusionary',
    'supportive housing', 'development application', 'official plan amendment',
    'community infrastructure and housing accelerator',
  ],
  Transit: [
    'transit', 'ttc', 'bus', 'subway', 'streetcar', 'cycling', 'bike', 'bicycle',
    'road', 'traffic', 'transportation', 'pedestrian', 'sidewalk', 'vision zero',
    'fare', 'rapid transit', 'light rail', 'eglinton', 'ontario line',
  ],
  Finance: [
    'budget', 'tax', 'levy', 'fee', 'rate', 'grant', 'funding', 'appropriation',
    'procurement', 'financial', 'revenue', 'expenditure', 'reserve fund',
    'operating budget', 'capital budget', 'rebate',
  ],
  Parks: [
    'park', 'recreation', 'community centre', 'arena', 'sports', 'playground',
    'trail', 'waterfront', 'ravine', 'green space', 'dog off-leash',
  ],
  Climate: [
    'climate', 'environment', 'green', 'emission', 'tree', 'waste', 'energy',
    'sustainability', 'net zero', 'electric vehicle', 'carbon', 'flood',
    'resilience', 'biodiversity',
  ],
};

const TRIVIAL_KEYWORDS = [
  'election of', 'appointment of', 'recess', 'adjourn', 'in-camera',
  'confidential', 'consent agenda', 'routine matters', 'confirmation of',
  'minute', 'declare conflict', 'pecuniary interest',
];

function classifyTopic(title) {
  const lower = title.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return topic;
  }
  return 'General';
}

function isTrivial(title) {
  const lower = title.toLowerCase();
  return TRIVIAL_KEYWORDS.some(k => lower.includes(k));
}

// ── Significance scoring ──────────────────────────────────────────────────────

function estimateSignificance(motion, rawResult) {
  let score = 30;

  // Committee weight
  const code = motion.id.split('.')[0].replace(/\d/g, '');
  if (['EX', 'PH', 'IE', 'EC', 'GG'].includes(code)) score += 20;
  else if (['MM', 'CC'].includes(code)) score += 10;

  // Close vote (more contentious = more significant)
  const m = rawResult?.match(/(\d+)-(\d+)/);
  if (m) {
    const margin = Math.abs(parseInt(m[1]) - parseInt(m[2]));
    if (margin <= 3) score += 30;
    else if (margin <= 6) score += 18;
    else if (margin <= 10) score += 8;
  }

  // High-impact keywords
  const title = motion.title.toLowerCase();
  const highKeywords = [
    'official plan', 'bylaw', 'emergency', 'community benefit', 'inclusionary',
    'major capital', 'rapid transit', 'budget', 'affordable housing',
    'net zero', 'ontario line', 'eglinton',
  ];
  if (highKeywords.some(k => title.includes(k))) score += 15;

  // Trivial penalty
  if (motion.trivial) score = Math.min(score, 20);

  return Math.min(Math.max(score, 5), 95);
}

// ── API helpers ───────────────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function fetchAllRecords() {
  const firstPage = await fetchJSON(
    `${API_BASE}/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=1`
  );
  const total = firstPage.result.total;
  console.log(`  Total vote rows: ${total}`);

  const all = [];
  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    process.stdout.write(`  Fetching rows ${offset}–${Math.min(offset + PAGE_SIZE, total)} of ${total}...\r`);
    const page = await fetchJSON(
      `${API_BASE}/api/3/action/datastore_search?resource_id=${RESOURCE_ID}&limit=${PAGE_SIZE}&offset=${offset}`
    );
    all.push(...page.result.records);
  }
  process.stdout.write('\n');
  return all;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📥  Fetching Toronto Open Data voting records (2022–2026)...');

  // Load existing motions for field preservation
  let existingMap = {};
  if (fs.existsSync(OUT_FILE)) {
    const existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    existing.forEach(m => { existingMap[m.id] = m; });
    console.log(`📂  Loaded ${existing.length} existing motions for merging`);
  }

  const rows = await fetchAllRecords();
  console.log(`✅  Fetched ${rows.length} vote rows`);

  // Group by Agenda Item # → motion
  const motionMap = {};
  for (const row of rows) {
    const agendaNum = row['Agenda Item #'];
    if (!agendaNum) continue;

    // "2023.PH27.8" → "PH27.8"
    const id = agendaNum.replace(/^\d{4}\./, '');

    if (!motionMap[id]) {
      // Parse date: "2022-11-23 15:17 PM" → "November 23, 2022"
      const rawDate = row['Date/Time'] ?? '';
      const datePart = rawDate.split(' ')[0]; // "2022-11-23"
      const dateObj = datePart ? new Date(datePart + 'T00:00:00') : null;
      const dateDisplay = dateObj
        ? dateObj.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
        : rawDate;

      motionMap[id] = {
        id,
        title: row['Agenda Item Title'] ?? '',
        date: dateDisplay,
        _rawDate: datePart,
        committee: row['Committee'] ?? '',
        _rawResult: row['Result'] ?? '',
        votes: {},
      };
    }

    // Record this councillor's vote
    const name = `${(row['First Name'] ?? '').trim()} ${(row['Last Name'] ?? '').trim()}`.trim();
    if (name) {
      const raw = (row['Vote'] ?? '').toLowerCase();
      motionMap[id].votes[name] = raw === 'yes' ? 'YES' : raw === 'no' ? 'NO' : 'ABSENT';
    }
  }

  console.log(`📋  Unique motions: ${Object.keys(motionMap).length}`);

  // Build final motions
  const motions = Object.values(motionMap).map(m => {
    const existing = existingMap[m.id];
    const rawResult = m._rawResult;

    // Derive status
    const lower = rawResult.toLowerCase();
    const status = lower.startsWith('carried') ? 'Adopted'
                 : (lower.startsWith('lost') || lower.startsWith('failed')) ? 'Defeated'
                 : 'Unknown';

    const trivialVal = existing?.trivial ?? isTrivial(m.title);
    const topicVal   = existing?.topic   ?? classifyTopic(m.title);

    const base = {
      id:         m.id,
      title:      m.title,
      date:       m.date,
      status,
      topic:      topicVal,
      trivial:    trivialVal,
      votes:      m.votes,
    };

    base.significance = existing?.significance ?? estimateSignificance(base, rawResult);

    // Preserve manually-set fields from existing data
    if (existing?.mover)    base.mover    = existing.mover;
    if (existing?.seconder) base.seconder = existing.seconder;
    if (existing?.url)      base.url      = existing.url;
    if (existing?.ward)     base.ward     = existing.ward;
    if (existing?.flags?.length) base.flags = existing.flags;

    return base;
  });

  // Sort: newest first, then by id
  motions.sort((a, b) => {
    const da = motionMap[a.id]?._rawDate ?? '';
    const db = motionMap[b.id]?._rawDate ?? '';
    if (db !== da) return db.localeCompare(da);
    return a.id.localeCompare(b.id);
  });

  fs.writeFileSync(OUT_FILE, JSON.stringify(motions, null, 2));

  // Stats
  const adopted = motions.filter(m => m.status === 'Adopted').length;
  const topics  = {};
  motions.forEach(m => { topics[m.topic] = (topics[m.topic] || 0) + 1; });
  const preserved = motions.filter(m => existingMap[m.id]).length;

  console.log(`\n✅  Written ${motions.length} motions → ${OUT_FILE}`);
  console.log(`    Adopted: ${adopted} (${Math.round(adopted / motions.length * 100)}%)`);
  console.log(`    Preserved from existing: ${preserved}`);
  console.log(`    Topics:`, topics);
}

main().catch(err => { console.error('❌ ', err.message); process.exit(1); });
