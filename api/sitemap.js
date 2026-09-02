const BLOB_BASE = 'https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com';
const SITE_URL = 'https://motions.watch';

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]));
}

async function loadJson(path) {
  const response = await fetch(`${BLOB_BASE}/${path}`);
  return response.ok ? response.json() : [];
}

export default async function handler(request, response) {
  const [motions, councillors, meetings] = await Promise.all([
    loadJson('motions.json'),
    loadJson('councillors.json'),
    loadJson('meetings.json'),
  ]);
  const paths = new Set([
    '/',
    '/toronto',
    '/toronto/cities',
    '/toronto/sources',
    '/toronto/privacy',
    '/toronto/terms',
    '/toronto/council-voting-records',
    '/toronto/ward-voting-records',
    '/toronto/councillor-voting-records',
    '/toronto/councillors',
    '/toronto/wards',
    '/toronto/committees',
    '/toronto/meetings',
  ]);
  for (let ward = 1; ward <= 25; ward++) paths.add(`/toronto/wards/${ward}`);
  for (const motion of motions) if (motion.id && !motion.parentId) paths.add(`/toronto/motions/${motion.id}`);
  for (const councillor of councillors) {
    const name = typeof councillor === 'string' ? councillor : councillor.name;
    if (name) paths.add(`/toronto/councillors/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  }
  for (const meeting of meetings) if (meeting.meetingReference) paths.add(`/toronto/meetings/${meeting.meetingReference}`);

  const body = [...paths].map(path => `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`).join('');
  response.setHeader('Content-Type', 'application/xml; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
}
