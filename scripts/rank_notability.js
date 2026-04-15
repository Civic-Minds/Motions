/**
 * rank_notability.js
 *
 * Elo-based notability ranking for Toronto City Council motions.
 * Each API call is a strict 1v1 matchup — Gemini picks the more notable motion.
 * Elo scores update after each matchup. Handles inconsistency gracefully.
 *
 * Scores and matchup history are persisted so runs can be resumed or extended.
 * New motions can be added at any time — they start at 1000 and play catch-up.
 *
 * Writes `eloScore` to motions.json after each save.
 *
 * Usage:
 *   node --env-file=.env scripts/rank_notability.js
 *   node --env-file=.env scripts/rank_notability.js --limit=50      (test on 50 motions)
 *   node --env-file=.env scripts/rank_notability.js --matchups=500  (run N matchups)
 *   node --env-file=.env scripts/rank_notability.js --dry-run
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const DATA_PATH  = path.join(process.cwd(), 'public/data/motions.json');
const ELO_PATH   = path.join(process.cwd(), 'scripts/cache/elo_scores.json');
const DELAY_MS   = 7000; // ~8 req/min — within Gemini 2.5 Flash free tier
const K          = 32;   // Elo K-factor — how much each result shifts scores
const DEFAULT_ELO = 1000;

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

const LIMIT    = args['limit']    ? parseInt(args['limit'], 10)    : Infinity;
const MATCHUPS = args['matchups'] ? parseInt(args['matchups'], 10) : 200;
const DRY_RUN  = !!args['dry-run'];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Elo state ─────────────────────────────────────────────────────────────────

function loadElo() {
  if (!fs.existsSync(ELO_PATH)) return { scores: {}, played: [] };
  try { return JSON.parse(fs.readFileSync(ELO_PATH, 'utf8')); } catch { return { scores: {}, played: [] }; }
}

function saveElo(state) {
  fs.mkdirSync(path.dirname(ELO_PATH), { recursive: true });
  fs.writeFileSync(ELO_PATH, JSON.stringify(state, null, 2));
}

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateElo(scores, winnerId, loserId) {
  const rA = scores[winnerId] ?? DEFAULT_ELO;
  const rB = scores[loserId]  ?? DEFAULT_ELO;
  const eA = expectedScore(rA, rB);
  const eB = expectedScore(rB, rA);
  scores[winnerId] = Math.round(rA + K * (1 - eA));
  scores[loserId]  = Math.round(rB + K * (0 - eB));
}

// ─── Gemini matchup ────────────────────────────────────────────────────────────

let apiCalls = 0;

async function runMatchup(a, b) {
  const prompt = `You are judging Toronto City Council motions by civic notability — how much impact, public interest, or consequence the decision has for Toronto residents.

Motion A:
Title: ${a.title}
Summary: ${a.summary ?? '(no summary)'}

Motion B:
Title: ${b.title}
Summary: ${b.summary ?? '(no summary)'}

Which motion is MORE notable for Toronto residents?
Respond with ONLY one letter: "A" or "B".`;

  process.stdout.write(`  [${++apiCalls}] ${a.id} vs ${b.id}… `);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const winner = response.text.trim().toUpperCase().startsWith('A') ? 'A' : 'B';
    console.log(`✓ ${winner} wins`);
    await new Promise(r => setTimeout(r, DELAY_MS));
    return winner;
  } catch (err) {
    console.log(`✗ ${err.message}`);
    return null;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!DRY_RUN && !process.env.GEMINI_API_KEY) {
    console.error('❌  GEMINI_API_KEY not set');
    process.exit(1);
  }

  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const state   = loadElo();

  const pool = motions
    .filter(m => !m.parentId && m.summary)
    .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
    .slice(0, LIMIT);

  // Init scores for any new motions
  for (const m of pool) {
    if (!(m.id in state.scores)) state.scores[m.id] = DEFAULT_ELO;
  }

  const played = new Set(state.played.map(([a, b]) => `${a}:${b}`));

  console.log(`📊 Pool: ${pool.length} motions`);
  console.log(`   Elo scores loaded: ${Object.keys(state.scores).length}`);
  console.log(`   Matchups played:   ${state.played.length}`);
  console.log(`   Running:           ${MATCHUPS} new matchups\n`);

  if (DRY_RUN) return;

  let ran = 0;
  while (ran < MATCHUPS) {
    // Pick two random motions that haven't played each other yet
    let a, b, key;
    let attempts = 0;
    do {
      const i = Math.floor(Math.random() * pool.length);
      let j   = Math.floor(Math.random() * pool.length);
      while (j === i) j = Math.floor(Math.random() * pool.length);
      a = pool[i]; b = pool[j];
      key = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
      attempts++;
      if (attempts > 1000) { console.log('⚠️  Pool exhausted — all pairs played'); break; }
    } while (played.has(key));

    if (attempts > 1000) break;

    const winner = await runMatchup(a, b);
    if (winner) {
      const winnerId = winner === 'A' ? a.id : b.id;
      const loserId  = winner === 'A' ? b.id : a.id;
      updateElo(state.scores, winnerId, loserId);
      state.played.push([a.id, b.id]);
      played.add(key);
      saveElo(state);
      ran++;
    }
  }

  // Write eloScore back to motions.json
  let updated = 0;
  for (const motion of motions) {
    if (motion.id in state.scores) {
      motion.eloScore = state.scores[motion.id];
      updated++;
    }
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));

  // Print leaderboard
  const ranked = pool
    .filter(m => m.id in state.scores)
    .sort((a, b) => (state.scores[b.id] ?? DEFAULT_ELO) - (state.scores[a.id] ?? DEFAULT_ELO));

  console.log(`\n✅ Done — ${ran} matchups, ${updated} motions scored`);
  console.log(`   Total API calls: ${apiCalls}`);
  console.log('\nTop 15 most notable:');
  ranked.slice(0, 15).forEach((m, i) =>
    console.log(`  ${i + 1}. [${state.scores[m.id]}] ${m.id} — ${m.title.slice(0, 65)}`)
  );
}

main().catch(err => { console.error(err); process.exit(1); });
