import { promisify } from 'node:util';
import { gzip as gzipCallback } from 'node:zlib';
import { JURISDICTIONS } from '../src/constants/jurisdictions.js';

const gzip = promisify(gzipCallback);
const BLOB_BASE = 'https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com';
const ALLOWED_FILES = new Set(['motions.json', 'meetings.json', 'councillors.json']);

export default async function handler(request, response) {
  const url = new URL(request.url, 'https://motions.watch');
  const file = url.searchParams.get('file');
  const jurisdiction = url.searchParams.get('jurisdiction') || 'toronto';

  if (!ALLOWED_FILES.has(file) || !JURISDICTIONS[jurisdiction]) {
    response.status(400).json({ error: 'Invalid data request' });
    return;
  }

  const prefix = jurisdiction === 'toronto' ? '' : `${jurisdiction}/`;
  const upstream = await fetch(`${BLOB_BASE}/${prefix}${file}`);
  if (!upstream.ok) {
    response.status(upstream.status).send('Data unavailable');
    return;
  }

  const compressed = await gzip(Buffer.from(await upstream.arrayBuffer()));
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Content-Encoding', 'gzip');
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  response.setHeader('Vary', 'Accept-Encoding');
  response.status(200).send(compressed);
}
