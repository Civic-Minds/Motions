/* global Buffer */

import sharp from 'sharp';

function escapeXml(value = '') {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]));
}

export default async function handler(request, response) {
  const url = new URL(request.url, 'https://motions.watch');
  const title = escapeXml(url.searchParams.get('title') || 'Toronto Council Voting Tracker');
  const context = escapeXml(url.searchParams.get('context') || 'Motions Toronto');
  const city = escapeXml(url.searchParams.get('city') || 'Toronto');
  const lines = title.match(/.{1,42}(?:\s|$)/g)?.slice(0, 4) || [title];

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8fafc"/>
  <rect x="54" y="54" width="1092" height="522" rx="32" fill="#ffffff" stroke="#dbe4ef" stroke-width="3"/>
  <rect x="54" y="54" width="12" height="522" rx="6" fill="#004a99"/>
  <text x="104" y="130" fill="#004a99" font-family="Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="3">MOTIONS ${city.toUpperCase()}</text>
  ${lines.map((line, index) => `<text x="104" y="${238 + index * 68}" fill="#0f172a" font-family="Arial, sans-serif" font-size="52" font-weight="700">${escapeXml(line.trim())}</text>`).join('')}
  <text x="104" y="510" fill="#64748b" font-family="Arial, sans-serif" font-size="28">${context}</text>
</svg>`;

  response.setHeader('Content-Type', 'image/png');
  response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  response.status(200).send(buffer);
}
