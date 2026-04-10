/**
 * generate_summaries.js
 *
 * Reads motions with a `body` field, calls Gemini API to generate a
 * plain-language summary, and writes it back as `summary`.
 *
 * Incremental — skips motions that already have a `summary`.
 *
 * Usage:
 *   export GEMINI_API_KEY=...
 *   node scripts/generate_summaries.js
 *   node scripts/generate_summaries.js --limit=5   (test run)
 *   node scripts/generate_summaries.js --force      (re-generate existing)
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

const LIMIT = args['limit'] ? parseInt(args['limit'], 10) : Infinity;
const FORCE = !!args['force'];
const SAVE_EVERY = 10;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM = `You write plain-language summaries of Toronto City Council agenda items for a public transparency app.
Your audience is curious Toronto residents with no legal or government background.

Rules:
- 2-3 sentences max, no bullet points
- Say what the city actually decided or is deciding, and why it matters to residents
- Avoid jargon: say "property tax" not "levied rate", "approved" not "carried"
- Do not start with "The City Council" — vary the opener
- Do not mention vote counts or procedural details`;

async function summarize(motion) {
  // Trim body to first ~3000 chars — the decision text is always near the top
  const bodySnippet = motion.body.slice(0, 3000);

  const prompt = `${SYSTEM}

Summarize this Toronto City Council agenda item in 2-3 plain sentences.

Title: ${motion.title}
Date: ${motion.date}
Status: ${motion.status}

Agenda text:
${bodySnippet}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text.trim();
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌  GEMINI_API_KEY not set');
    process.exit(1);
  }

  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const targets = motions.filter(m =>
    m.body &&
    (FORCE || !m.summary)
  ).slice(0, LIMIT);

  console.log(`📝 ${targets.length} motions to summarize`);
  if (targets.length === 0) { console.log('Nothing to do.'); return; }

  let done = 0, failed = 0;

  for (const motion of targets) {
    process.stdout.write(`[${done + 1}/${targets.length}] ${motion.id} — ${motion.title.slice(0, 50)}… `);
    try {
      motion.summary = await summarize(motion);
      // Write back into the array
      const idx = motions.findIndex(m => m.id === motion.id);
      if (idx !== -1) motions[idx].summary = motion.summary;
      console.log('✓');
      done++;

      if (done % SAVE_EVERY === 0) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
        console.log(`   💾 Saved (${done} done)`);
      }

      // 10s delay → ~6 req/min, well within Gemini 2.5 Flash free tier limit
      await new Promise(r => setTimeout(r, 10000));
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
  console.log(`\n✅ Done — ${done} summarized, ${failed} failed`);
  console.log(`   Total with summary: ${motions.filter(m => m.summary).length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
