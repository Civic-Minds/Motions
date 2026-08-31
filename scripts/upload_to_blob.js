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

/* global process */

// Local runs can use the repo's ignored .env; CI continues to provide secrets
// through the workflow environment.
try { process.loadEnvFile?.('.env'); } catch { console.warn('Could not load .env; using the existing environment.'); }

const DATA_FILES = ['motions.json', 'meetings.json', 'councillors.json', 'candidates.json', 'tenure.json', 'expenses.json', 'wards.geojson', 'metadata.json'];
const CACHE_FILES = ['summaries_cache.json', 'elo_scores.json', 'notability_cache.json'];

async function uploadDataDirectory(directory, prefix = '') {
  for (const filename of DATA_FILES) {
    const filePath = path.join(process.cwd(), directory, filename);
    if (!fs.existsSync(filePath)) { console.log(`⏭️  Skipped ${prefix}${filename} (not found)`); continue; }
    const content = fs.readFileSync(filePath);
    const contentType = filename.endsWith('.geojson') ? 'application/geo+json' : 'application/json';
    const { url } = await put(`${prefix}${filename}`, content, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    });
    console.log(`✅ Uploaded ${prefix}${filename} → ${url}`);
  }
}

const vancouverOnly = process.argv.includes('--vancouver-only');
if (!vancouverOnly) await uploadDataDirectory('public/data');
if (process.argv.includes('--vancouver') || vancouverOnly) await uploadDataDirectory('public/data/vancouver', 'vancouver/');

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
