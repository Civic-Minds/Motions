/**
 * generate_summaries.js
 *
 * Reads motions with a `body` field, calls Gemini API to generate a
 * plain-language summary and extract key financial figures, then writes
 * them back as `summary` and `keyAmounts`.
 *
 * Incremental — skips motions that already have both fields set.
 *
 * Usage:
 *   node --env-file=.env scripts/generate_summaries.js
 *   node --env-file=.env scripts/generate_summaries.js --limit=5
 *   node --env-file=.env scripts/generate_summaries.js --force
 *   node --env-file=.env scripts/generate_summaries.js --fill-amounts
 *     (backfill keyAmounts only for motions that already have a summary)
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const DATA_PATH  = path.join(process.cwd(), 'public/data/motions.json');
const CACHE_PATH = path.join(process.cwd(), 'scripts/cache/summaries_cache.json');

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

const LIMIT       = args['limit']        ? parseInt(args['limit'], 10) : Infinity;
const FORCE       = !!args['force'];
const FILL_AMOUNTS = !!args['fill-amounts'];
const SAVE_EVERY  = 10;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SUMMARY_RULES = `You write plain-language summaries of Toronto City Council agenda items for a public transparency app.
Your audience is curious Toronto residents with no legal or government background.

Summary rules:
- 2-3 sentences max, no bullet points
- Say what the city actually decided or is deciding, and why it matters to residents
- Avoid jargon: say "property tax" not "levied rate", "approved" not "carried"
- Do not start with "The City Council" — vary the opener
- Do not mention vote counts or procedural details`;

const AMOUNTS_RULES = `keyAmounts rules:
- Return at most 2 entries — the most meaningful financial figures only
- Each entry has shape: { "label": "...", "value": <number>, "unit": "...", "type": "..." }
- Label: 3-5 words, plain language (e.g. "Projected annual revenue", "Capital investment", "Property tax increase")
- Value + unit:
  · Dollar amounts → value is integer dollars, unit is "$" (e.g. 138000000 / "$")
  · Percentage changes (tax rate, fee increase) → value is the number, unit is "%" (e.g. 2.9 / "%")
  · Pick whichever unit makes the figure most immediately understandable to a resident
- Type: one of "cost" | "revenue" | "investment" | "grant" | "tax_rate" | "threshold" | "other"
  · cost = money the city spends on a program or service
  · revenue = money the city collects or receives
  · investment = one-time capital spend (infrastructure, construction)
  · grant = money given to or received from another government level
  · tax_rate = a percentage change to a tax or fee
  · threshold = a dollar cutoff (property price, income limit)
  · other = anything else
- If there are no meaningful financial figures, return an empty array []
- Do NOT include incidental numbers, minor fees, or figures already captured by another entry`;

async function summarizeAndExtract(motion) {
  const bodySnippet = motion.body.slice(0, 3000);

  const prompt = `${SUMMARY_RULES}

${AMOUNTS_RULES}

Respond with ONLY valid JSON in this exact shape — no markdown, no extra text:
{
  "summary": "...",
  "keyAmounts": [
    { "label": "Property tax increase", "value": 2.9, "unit": "%", "type": "tax_rate" },
    { "label": "Capital investment", "value": 450000000, "unit": "$", "type": "investment" }
  ]
}

Title: ${motion.title}
Date: ${motion.date}
Status: ${motion.status}

Agenda text:
${bodySnippet}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const raw = response.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(raw);

  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : null,
    keyAmounts: Array.isArray(parsed.keyAmounts) ? parsed.keyAmounts : [],
  };
}

async function extractAmountsOnly(motion) {
  // Use body if available; fall back to summary (body is stripped after pipeline runs)
  const context = motion.body
    ? `Agenda text:\n${motion.body.slice(0, 3000)}`
    : `Plain-language summary (full agenda text not available):\n${motion.summary}`;

  const prompt = `${AMOUNTS_RULES}

Respond with ONLY valid JSON — an array, no markdown, no extra text:
[
  { "label": "Property tax increase", "value": 2.9, "unit": "%", "type": "tax_rate" },
  { "label": "Capital investment", "value": 450000000, "unit": "$", "type": "investment" }
]

Title: ${motion.title}

${context}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const raw = response.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function saveCache(motions) {
  const existing = fs.existsSync(CACHE_PATH)
    ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    : {};
  for (const m of motions) {
    if (m.summary !== undefined || m.keyAmounts !== undefined) {
      existing[m.id] = { summary: m.summary, keyAmounts: m.keyAmounts };
    }
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(existing, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌  GEMINI_API_KEY not set');
    process.exit(1);
  }

  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const targets = FILL_AMOUNTS
    ? motions.filter(m => m.summary && (FORCE || m.keyAmounts === undefined))
    : motions.filter(m => m.body && (FORCE || (!m.summary || m.keyAmounts === undefined)));

  const limited = targets.slice(0, LIMIT);

  const mode = FILL_AMOUNTS ? 'fill-amounts' : 'summarize+extract';
  console.log(`📝 ${limited.length} motions to process (mode: ${mode})`);
  if (limited.length === 0) { console.log('Nothing to do.'); return; }

  let done = 0, failed = 0;

  for (const motion of limited) {
    process.stdout.write(`[${done + 1}/${limited.length}] ${motion.id} — ${motion.title.slice(0, 50)}… `);
    try {
      const idx = motions.findIndex(m => m.id === motion.id);

      if (FILL_AMOUNTS) {
        const keyAmounts = await extractAmountsOnly(motion);
        motions[idx].keyAmounts = keyAmounts;
      } else {
        const { summary, keyAmounts } = await summarizeAndExtract(motion);
        if (summary) motions[idx].summary = summary;
        motions[idx].keyAmounts = keyAmounts;
      }

      console.log('✓');
      done++;

      if (done % SAVE_EVERY === 0) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
        saveCache(motions);
        console.log(`   💾 Saved (${done} done)`);
      }

      // 10s delay → ~6 req/min, within Gemini 2.5 Flash free tier limit
      await new Promise(r => setTimeout(r, 10000));
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
  saveCache(motions);
  console.log(`\n✅ Done — ${done} processed, ${failed} failed`);
  console.log(`   With summary:    ${motions.filter(m => m.summary).length}`);
  console.log(`   With keyAmounts: ${motions.filter(m => m.keyAmounts !== undefined).length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
