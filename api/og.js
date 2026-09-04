import sharp from 'sharp';
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dirname = path.dirname(fileURLToPath(import.meta.url));

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

// Literal paths (not passed through a helper) so Vercel's function bundler can
// statically trace and include these files in the deployed function.
const regularFont = opentype.parse(toArrayBuffer(readFileSync(path.join(dirname, 'fonts/Inter-Regular.ttf'))));
const boldFont = opentype.parse(toArrayBuffer(readFileSync(path.join(dirname, 'fonts/Inter-Bold.ttf'))));

// Converts text to vector outlines at request time instead of asking the SVG
// renderer to resolve a font by name — sharp's bundled librsvg doesn't reliably
// support @font-face on Vercel's runtime, so this avoids relying on it at all.
// Builds glyphs directly from the cmap (charToGlyph) instead of font.getPath's
// text-shaping pipeline — that pipeline runs Inter's ccmp/GSUB tables
// unconditionally, which use a lookup format opentype.js doesn't implement
// and throws. Plain per-character lookup skips shaping entirely.
function textPathData(font, text, x, y, fontSize, letterSpacing = 0) {
  const scale = fontSize / font.unitsPerEm;
  let cursor = x;
  const parts = [];
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    parts.push(glyph.getPath(cursor, y, fontSize).toPathData(2));
    cursor += (glyph.advanceWidth || 0) * scale + letterSpacing;
  }
  return parts.join(' ');
}

export default async function handler(request, response) {
  const url = new URL(request.url, 'https://motions.watch');
  const title = (url.searchParams.get('title') || 'Toronto Council Voting Tracker').trim();
  const context = (url.searchParams.get('context') || 'Motions Toronto').trim();
  const city = (url.searchParams.get('city') || 'Toronto').trim();
  const lines = title.match(/.{1,42}(?:\s|$)/g)?.slice(0, 4) || [title];

  const headerPath = textPathData(boldFont, `MOTIONS ${city.toUpperCase()}`, 104, 130, 28, 3);
  const titlePath = lines.map((line, index) => textPathData(boldFont, line.trim(), 104, 238 + index * 68, 52)).join(' ');
  const contextPath = textPathData(regularFont, context, 104, 510, 28);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8fafc"/>
  <rect x="54" y="54" width="1092" height="522" rx="32" fill="#ffffff" stroke="#dbe4ef" stroke-width="3"/>
  <rect x="54" y="54" width="12" height="522" rx="6" fill="#004a99"/>
  <path d="${headerPath}" fill="#004a99"/>
  <path d="${titlePath}" fill="#0f172a"/>
  <path d="${contextPath}" fill="#64748b"/>
</svg>`;

  response.setHeader('Content-Type', 'image/png');
  response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  response.status(200).send(buffer);
}
