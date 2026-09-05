/* global process */

/**
 * rescore_vancouver_significance.js
 *
 * Recomputes significance/trivial for every published Vancouver motion using
 * the current computeVancouverSignificance() formula. Fully deterministic —
 * no AI calls, no cost. Fixes already-published data after a formula change
 * (e.g. the missing administrative penalty).
 *
 * Downloads the current motions.json from Blob, recomputes, writes back
 * locally. Does NOT upload — run upload_to_blob.js --city-only=vancouver
 * separately once you've checked the diff.
 *
 * Usage:
 *   node scripts/rescore_vancouver_significance.js
 */

import fs from 'fs';
import path from 'path';
import { computeVancouverSignificance, computeFlags } from './lib/significance.js';

const DATA_PATH = path.join(process.cwd(), 'public/data/vancouver/motions.json');
const BLOB_URL = 'https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com/vancouver/motions.json';

async function main() {
  const response = await fetch(BLOB_URL);
  if (!response.ok) throw new Error(`Failed to fetch ${BLOB_URL}: HTTP ${response.status}`);
  const motions = await response.json();

  let changed = 0;
  for (const motion of motions) {
    const newScore = computeVancouverSignificance(motion.votes ?? {}, motion.status, motion.title);
    if (newScore !== motion.significance) changed++;
    motion.significance = newScore;
    motion.trivial = newScore < 25;
    motion.flags = computeFlags(motion.votes, motion.status, newScore);
  }

  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));
  console.log(`Recomputed ${motions.length} motions, ${changed} scores changed. Wrote ${DATA_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
