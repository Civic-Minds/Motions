/* global process */

/**
 * rescore_significance.js
 *
 * Re-scores `significance` only (not summary/keyAmounts) for motions that
 * already have a summary, using the same rubric generate_summaries.js uses —
 * but a much smaller prompt (title + existing summary, no 3000-char body),
 * since the summary already exists.
 *
 * Recovers the real AI significance score for motions whose score was
 * overwritten by the fallback heuristic before the PRESERVE fix.
 *
 * Writes a preview file by default — does NOT touch motions.json unless
 * --write is passed. Preview results accumulate across runs (by id), so
 * increasing --limit only scores the newly-added motions, not ones already
 * reviewed. Pass --force to rescore everything again anyway.
 *
 * --tail samples from the oldest end of the pool instead of the newest
 * (motions.json is sorted newest-first) — use it to spot-check that older
 * records score sensibly too before trusting a pattern seen only in recent
 * motions.
 *
 * Usage:
 *   node --env-file=.env scripts/rescore_significance.js --limit=50
 *   node --env-file=.env scripts/rescore_significance.js --limit=200 --write
 *   node --env-file=.env scripts/rescore_significance.js --limit=20 --tail
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { computeFlags } from './lib/significance.js';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

const DATA_PATH    = path.join(process.cwd(), 'public/data/motions.json');
const PREVIEW_PATH = path.join(process.cwd(), 'scripts/cache/rescore_preview.json');
const LIMIT = args['limit'] ? parseInt(args['limit'], 10) : 50;
const WRITE = !!args['write'];
const FORCE = !!args['force'];
const TAIL  = !!args['tail'];
const DELAY_MS = 4000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SIGNIFICANCE_RULES = `significance rules:
- Return a single integer 0-100 reflecting the motion's civic impact on Toronto residents
- Use these bands as a guide:
  - 0-5:   Pure procedural (by-law confirmations, call to order, order paper, minor commemorations)
  - 6-15:  Hyper-local single property (tree removals, fence exemptions, one traffic signal, lane naming)
  - 16-30: Routine local (single-property zoning, OLT settlements, minor contracts, heritage listings)
  - 31-50: Moderate (multi-property rezonings, ward-level infrastructure, program updates)
  - 51-65: City-wide moderate (notable policy changes, new programs, transit priority lanes)
  - 66-80: High (major policy shifts, large budgets $50M+, significant transit, provincial relations)
  - 81-100: Critical (City Budget, subway agreements, fundamental governance changes)`;

async function scoreMotion(motion) {
  const prompt = `${SIGNIFICANCE_RULES}

Respond with ONLY a single integer, no other text.

Title: ${motion.title}
Status: ${motion.status}
Summary: ${motion.summary}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const raw = response.text.trim();
  const parsed = parseInt(raw.match(/\d+/)?.[0] ?? '', 10);
  if (Number.isNaN(parsed)) throw new Error(`Unparseable response: "${raw}"`);
  return Math.min(100, Math.max(0, parsed));
}

function loadPreview() {
  if (!fs.existsSync(PREVIEW_PATH)) return new Map();
  try {
    const prior = JSON.parse(fs.readFileSync(PREVIEW_PATH, 'utf8'));
    return new Map(prior.map(r => [r.id, r]));
  } catch {
    return new Map();
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not set');
    process.exit(1);
  }

  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const pool = motions.filter(m => m.summary);
  const ordered = TAIL ? [...pool].reverse() : pool;

  const previewMap = loadPreview();
  const candidates = FORCE ? ordered : ordered.filter(m => !previewMap.has(m.id));
  const targets = candidates.slice(0, LIMIT);

  console.log(`Rescoring ${targets.length} of ${pool.length} already-summarized motions${TAIL ? ' (from the oldest end)' : ''}${WRITE ? ' (writing to motions.json)' : ' (preview only, not writing)'}\n`);

  for (const motion of targets) {
    process.stdout.write(`[${previewMap.size + 1}] ${motion.id} — ${motion.title.slice(0, 55)}… `);
    try {
      const newScore = await scoreMotion(motion);
      previewMap.set(motion.id, { id: motion.id, title: motion.title, oldScore: motion.significance ?? null, newScore });
      console.log(`${motion.significance ?? '?'} -> ${newScore}`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  fs.mkdirSync(path.dirname(PREVIEW_PATH), { recursive: true });
  const allResults = [...previewMap.values()];
  fs.writeFileSync(PREVIEW_PATH, JSON.stringify(allResults, null, 2));

  const changed = allResults.filter(r => r.oldScore !== r.newScore);
  console.log(`\nDone. ${changed.length}/${allResults.length} scores changed across all runs so far. Preview written to ${PREVIEW_PATH}`);

  if (WRITE) {
    const motionsById = new Map(motions.map(m => [m.id, m]));
    let updated = 0;
    for (const result of allResults) {
      const motion = motionsById.get(result.id);
      if (!motion) continue;
      motion.significance = result.newScore;
      motion.trivial = result.newScore < 25;
      motion.flags = computeFlags(motion.votes, motion.status, result.newScore);
      updated++;
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
    console.log(`Wrote ${updated} updated scores (and flags) to ${DATA_PATH}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
