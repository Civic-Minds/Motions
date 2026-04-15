/**
 * rank_notability.js
 *
 * Pairwise quicksort over primary motions with summaries using Gemini.
 * Each API call compares a batch of motions against a single pivot:
 * "Is each of these more or less notable than the pivot?"
 *
 * Writes `notabilityRank` (1 = most notable) to motions.json.
 * Caches comparisons to allow resuming if interrupted.
 *
 * Usage:
 *   node --env-file=.env scripts/rank_notability.js
 *   node --env-file=.env scripts/rank_notability.js --limit=200   (only rank top N by significance)
 *   node --env-file=.env scripts/rank_notability.js --dry-run     (show pool size, no API calls)
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const DATA_PATH  = path.join(process.cwd(), 'public/data/motions.json');
const CACHE_PATH = path.join(process.cwd(), 'scripts/cache/notability_cache.json');
const BATCH_SIZE = 10;   // motions compared against pivot per API call
const DELAY_MS   = 7000; // ~8 req/min — within Gemini 2.5 Flash free tier

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

const LIMIT   = args['limit']   ? parseInt(args['limit'], 10)   : Infinity;
const DRY_RUN = !!args['dry-run'];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Cache ─────────────────────────────────────────────────────────────────────

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch { return {}; }
}

function saveCache(cache) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// ─── Gemini comparison ─────────────────────────────────────────────────────────

let apiCalls = 0;

async function compareBatchVsPivot(pivot, batch, cache) {
  // Check cache first — batch items that need API calls
  const uncached = batch.filter(m => {
    const key = `${m.id}:${pivot.id}`;
    return !(key in cache);
  });

  // Fill from cache
  const results = {};
  for (const m of batch) {
    const key = `${m.id}:${pivot.id}`;
    if (key in cache) results[m.id] = cache[key]; // 'above' | 'below'
  }

  if (uncached.length === 0) return results;

  const pivotSnippet = `Title: ${pivot.title}\nSummary: ${pivot.summary ?? '(no summary)'}`;

  const items = uncached.map((m, i) =>
    `${i + 1}. ID: ${m.id}\n   Title: ${m.title}\n   Summary: ${m.summary ?? '(no summary)'}`
  ).join('\n\n');

  const prompt = `You are ranking Toronto City Council motions by civic notability — how much impact, public interest, or consequence the decision has for residents.

Pivot motion (use as your reference point):
${pivotSnippet}

For each motion below, respond "above" if it is MORE notable than the pivot, or "below" if it is LESS notable.
Respond with ONLY valid JSON — an array, no markdown:
[{"id": "...", "side": "above"}, {"id": "...", "side": "below"}, ...]

Motions to compare:
${items}`;

  process.stdout.write(`  [API call ${++apiCalls}] ${uncached.length} vs pivot ${pivot.id}… `);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const raw = response.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(raw);

    for (const { id, side } of parsed) {
      if (side === 'above' || side === 'below') {
        const key = `${id}:${pivot.id}`;
        cache[key] = side;
        results[id] = side;
      }
    }

    // Save cache after each call
    saveCache(cache);
    console.log('✓');
  } catch (err) {
    console.log(`✗ ${err.message}`);
    // Fill unknowns as 'below' to keep progress moving
    for (const m of uncached) {
      if (!(m.id in results)) results[m.id] = 'below';
    }
  }

  await new Promise(r => setTimeout(r, DELAY_MS));
  return results;
}

// ─── Quicksort ─────────────────────────────────────────────────────────────────

async function quicksort(motions, cache) {
  if (motions.length <= 1) return motions;

  // Random pivot
  const pivotIdx = Math.floor(Math.random() * motions.length);
  const pivot    = motions[pivotIdx];
  const rest     = motions.filter((_, i) => i !== pivotIdx);

  console.log(`\nQuicksort: ${motions.length} items, pivot = ${pivot.id}`);

  // Compare rest against pivot in batches
  const above = [];
  const below = [];

  for (let i = 0; i < rest.length; i += BATCH_SIZE) {
    const batch   = rest.slice(i, i + BATCH_SIZE);
    const results = await compareBatchVsPivot(pivot, batch, cache);
    for (const m of batch) {
      if (results[m.id] === 'above') above.push(m);
      else                            below.push(m);
    }
  }

  const sortedAbove = await quicksort(above, cache);
  const sortedBelow = await quicksort(below, cache);

  return [...sortedAbove, pivot, ...sortedBelow];
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!DRY_RUN && !process.env.GEMINI_API_KEY) {
    console.error('❌  GEMINI_API_KEY not set');
    process.exit(1);
  }

  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const cache   = loadCache();

  // Pool: primary motions with summaries
  const pool = motions
    .filter(m => !m.parentId && m.summary)
    .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
    .slice(0, LIMIT);

  console.log(`📊 Pool: ${pool.length} primary motions with summaries`);
  console.log(`   Cached comparisons: ${Object.keys(cache).length}`);

  if (DRY_RUN) {
    const cachedHits = pool.reduce((n, m) =>
      n + pool.filter(p => p.id !== m.id && `${m.id}:${p.id}` in cache).length, 0);
    const estimatedCalls = Math.ceil((pool.length * Math.log2(pool.length + 1)) / BATCH_SIZE);
    console.log(`\n   Estimated API calls (worst case): ~${estimatedCalls}`);
    console.log(`   Estimated time at ${DELAY_MS / 1000}s/call: ~${Math.round(estimatedCalls * DELAY_MS / 60000)} minutes`);
    console.log(`   Cached hits so far: ${cachedHits}`);
    return;
  }

  if (pool.length === 0) {
    console.log('No motions to rank. Run generate_summaries.js first.');
    return;
  }

  console.log('\nStarting pairwise quicksort…\n');
  const sorted = await quicksort(pool, cache);

  // Write notabilityRank back to motions
  const rankMap = {};
  sorted.forEach((m, i) => { rankMap[m.id] = i + 1; }); // 1 = most notable

  let updated = 0;
  for (const motion of motions) {
    if (motion.id in rankMap) {
      motion.notabilityRank = rankMap[motion.id];
      updated++;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));

  console.log(`\n✅ Done — ranked ${updated} motions`);
  console.log(`   Total API calls: ${apiCalls}`);
  console.log(`   Cache entries:   ${Object.keys(cache).length}`);
  console.log('\nTop 10 most notable:');
  sorted.slice(0, 10).forEach((m, i) =>
    console.log(`  ${i + 1}. [${m.id}] ${m.title.slice(0, 70)}`)
  );
}

main().catch(err => { console.error(err); process.exit(1); });
