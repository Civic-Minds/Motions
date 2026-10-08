/* global process */

/**
 * Rewrite the tracked Toronto archive summaries into the same short,
 * plain-language style used by the rest of the app.
 *
 * This is intentionally a local, deterministic rewrite. It does not call
 * Gemini or any other summarization service. The underlying facts and motion
 * outcomes remain unchanged.
 */

import fs from 'fs';
import path from 'path';

const SUMMARY_PATH = path.join(process.cwd(), 'scripts/data/toronto_2019_2022_summaries.json');
const summaries = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'));

const replacements = [
  [/^This item concerns /, 'Toronto considered '],
  [/^This item reviews /, 'Toronto reviewed '],
  [/^This item provided /, 'Toronto received '],
  [/^This item reports on /, 'Toronto reviewed '],
  [/^This item updated /, 'Toronto updated '],
  [/^This item addressed /, 'Toronto addressed '],
  [/^This item examined /, 'Toronto examined '],
  [/^This item proposed /, 'Toronto proposed '],
  [/^This item set out /, 'Toronto set out '],
  [/^The item concerns /, 'Toronto considered '],
  [/^The item considered /, 'Toronto considered '],
  [/^The item provided /, 'Toronto received '],
  [/^The item reports on /, 'Toronto reviewed '],
  [/^The item reviewed /, 'Toronto reviewed '],
  [/^The item addressed /, 'Toronto addressed '],
  [/^The item examined /, 'Toronto examined '],
  [/^The item proposed /, 'Toronto proposed '],
  [/^The item set out /, 'Toronto set out '],
  [/The adopted decision/g, 'The decision'],
  [/The request was not adopted\./g, 'The request did not pass.'],
  [/The proposal was not adopted\./g, 'The proposal did not pass.'],
  [/This amendment concerns /g, 'The amendment covers '],
  [/This amendment concerned /g, 'The amendment covered '],
  [/It was adopted as part of /g, 'The amendment passed as part of '],
];

let changed = 0;
for (const [id, original] of Object.entries(summaries)) {
  let rewritten = original
    .replace(/Â/g, "'")
    .replace(/Â·/g, '·')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [pattern, replacement] of replacements) rewritten = rewritten.replace(pattern, replacement);

  if (rewritten !== original) {
    summaries[id] = rewritten;
    changed++;
  }
}

fs.writeFileSync(SUMMARY_PATH, `${JSON.stringify(summaries, null, 2)}\n`);
console.log(`Rewrote ${changed} of ${Object.keys(summaries).length} Toronto historical summaries locally.`);
