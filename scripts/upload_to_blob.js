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

const FILES = ['motions.json', 'meetings.json', 'councillors.json'];

for (const filename of FILES) {
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
