/**
 * upload_to_blob.js
 *
 * Uploads motions.json and meetings.json to Vercel Blob.
 * Run after import_open_data.js and fetch_meetings.js.
 * Requires BLOB_READ_WRITE_TOKEN env var.
 */

import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const DATA_FILES = ['motions.json', 'meetings.json', 'councillors.json', 'candidates.json'];
const CACHE_FILES = ['summaries_cache.json', 'elo_scores.json', 'notability_cache.json'];

for (const filename of DATA_FILES) {
  const filePath = path.join(process.cwd(), 'public/data', filename);
  const content = fs.readFileSync(filePath);
  const { url } = await put(filename, content, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  console.log(`✅ Uploaded ${filename} → ${url}`);
}

for (const filename of CACHE_FILES) {
  const filePath = path.join(process.cwd(), 'scripts/cache', filename);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath);
  const { url } = await put(`cache/${filename}`, content, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  console.log(`✅ Uploaded cache/${filename} → ${url}`);
}
