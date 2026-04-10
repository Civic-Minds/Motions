/**
 * extract_fields.js
 *
 * Extracts structured fields from the `body` text of each motion before
 * it gets stripped. Adds two fields to each motion:
 *
 *   amounts: number[]   — dollar values found in the body, normalized to
 *                         integer dollars. e.g. "$4.2 million" → 4200000
 *
 *   staffRecommendation: 'approval' | 'refusal' | null
 *                       — whether staff recommended approval or refusal
 *
 *   developer: string | null
 *             — applicant/developer name for zoning and development items
 *
 *   relatedMotions: string[]
 *             — IDs of other motions referenced in the body text
 *               e.g. "In response to Council direction (2025.MM35.15)" → ['MM35.15']
 *
 * Incremental — skips motions that already have both fields set.
 * Run BEFORE strip_body.js.
 *
 * Usage:
 *   node scripts/extract_fields.js
 *   node scripts/extract_fields.js --force   (re-extract all)
 */

import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);
const FORCE = !!args['force'];

// ─── Dollar amount extraction ─────────────────────────────────────────────────

// Matches: $4.2 million, $1,200,000, $850,000.00, $3.5 billion, $500 thousand
const AMOUNT_RE = /\$\s*([\d,]+(?:\.\d+)?)\s*(million|billion|thousand)?/gi;

const MULTIPLIERS = { thousand: 1_000, million: 1_000_000, billion: 1_000_000_000 };

function extractAmounts(text) {
  const amounts = new Set();
  for (const match of text.matchAll(AMOUNT_RE)) {
    const raw = parseFloat(match[1].replace(/,/g, ''));
    const mult = MULTIPLIERS[match[2]?.toLowerCase()] ?? 1;
    const value = Math.round(raw * mult);
    if (value >= 1000) amounts.add(value); // ignore trivial amounts under $1k
  }
  return [...amounts].sort((a, b) => b - a); // largest first
}

// ─── Developer/applicant extraction ──────────────────────────────────────────

// Toronto zoning reports follow a pattern like:
//   "Owner: Slate Asset Management Corp."
//   "Applicant: Bousfields Inc."
//   "submitted by Jane Smith, Acme Developments"
const DEVELOPER_RE = /(?:^|\n)\s*(?:Owner|Applicant|Application\s+by|Submitted\s+by)[:\s]+([A-Z][^\n,]{3,60}?)(?:\s*[,\n]|$)/m;

function extractDeveloper(text) {
  const excerpt = text.slice(0, 4000);
  const match = excerpt.match(DEVELOPER_RE);
  return match ? match[1].trim() : null;
}

// ─── Related motion extraction ───────────────────────────────────────────────

// Matches cross-references like "2025.MM35.15" or "2026.IE28.1"
// Strips the year prefix to match our stored IDs (e.g. "MM35.15")
const RELATED_RE = /\b20\d\d\.([A-Z]{2,4}\d+\.\d+)\b/g;

function extractRelatedMotions(text, selfId) {
  const ids = new Set();
  for (const match of text.matchAll(RELATED_RE)) {
    if (match[1] !== selfId) ids.add(match[1]);
  }
  return [...ids];
}

// ─── Staff recommendation extraction ─────────────────────────────────────────

// Toronto staff reports use consistent language near the top.
// Approval signals: "recommends adoption", "recommends approval", "recommends that...approve"
// Refusal signals: "recommends refusal", "recommends rejection", "recommends that...refuse/reject"

const APPROVAL_RE = /\b(?:recommend(?:s|ed)?|recommending)\s+(?:adoption|approval|that\b[^.]{0,80}?\b(?:adopt|approve|enact|authorize|direct))\b/i;
const REFUSAL_RE  = /\b(?:recommend(?:s|ed)?|recommending)\s+(?:refusal|rejection|that\b[^.]{0,80}?\b(?:refuse|reject|deny|not\s+approve))\b/i;

function extractStaffRecommendation(text) {
  // Only look in the first 3000 chars — recommendations are always near the top
  const excerpt = text.slice(0, 3000);
  if (REFUSAL_RE.test(excerpt)) return 'refusal';
  if (APPROVAL_RE.test(excerpt)) return 'approval';
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const targets = motions.filter(m =>
    m.body &&
    (FORCE || (m.amounts === undefined && m.staffRecommendation === undefined))
  );

  console.log(`🔍 ${targets.length} motions to extract from`);
  if (!targets.length) { console.log('Nothing to do.'); return; }

  let done = 0;
  for (const motion of targets) {
    const idx = motions.findIndex(m => m.id === motion.id);
    motions[idx].amounts = extractAmounts(motion.body);
    motions[idx].staffRecommendation = extractStaffRecommendation(motion.body);
    motions[idx].developer = extractDeveloper(motion.body);
    motions[idx].relatedMotions = extractRelatedMotions(motion.body, motion.id);
    done++;
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));

  const withAmounts = motions.filter(m => m.amounts?.length > 0).length;
  const withRec     = motions.filter(m => m.staffRecommendation).length;
  const approvals   = motions.filter(m => m.staffRecommendation === 'approval').length;
  const refusals    = motions.filter(m => m.staffRecommendation === 'refusal').length;
  const withDev     = motions.filter(m => m.developer).length;

  console.log(`✅ Done — ${done} processed`);
  console.log(`   ${withAmounts} motions with dollar amounts`);
  console.log(`   ${withRec} motions with staff recommendation (${approvals} approval, ${refusals} refusal)`);
  console.log(`   ${withDev} motions with developer/applicant`);
  const withRelated = motions.filter(m => m.relatedMotions?.length > 0).length;
  console.log(`   ${withRelated} motions with cross-references`);
}

main();
