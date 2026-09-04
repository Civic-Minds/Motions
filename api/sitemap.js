const BLOB_BASE = 'https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com';
const SITE_URL = 'https://motions.watch';

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char]));
}

async function loadJson(path) {
  const response = await fetch(`${BLOB_BASE}/${path}`);
  return response.ok ? response.json() : [];
}

export default async function handler(request, response) {
  const [torontoMotions, torontoCouncillors, torontoMeetings, vancouverMotions, vancouverCouncillors, vancouverMeetings, yellowknifeMotions, yellowknifeCouncillors, yellowknifeMeetings] = await Promise.all([
    loadJson('motions.json'),
    loadJson('councillors.json'),
    loadJson('meetings.json'),
    loadJson('vancouver/motions.json'),
    loadJson('vancouver/councillors.json'),
    loadJson('vancouver/meetings.json'),
    loadJson('yellowknife/motions.json'),
    loadJson('yellowknife/councillors.json'),
    loadJson('yellowknife/meetings.json'),
  ]);
  const paths = new Set(['/']);
  const addCityPaths = (city, motions, councillors, meetings, hasWards = false) => {
    for (const suffix of ['/cities', '/sources', '/privacy', '/terms', '/councillors', '/committees', '/meetings', '/map', '/learn', '/transparency']) paths.add(`/${city}${suffix}`);
    paths.add(`/${city}`);
    if (city === 'toronto') {
      paths.add('/toronto/council-voting-records');
      paths.add('/toronto/ward-voting-records');
      paths.add('/toronto/councillor-voting-records');
    }
    if (hasWards) {
      paths.add(`/${city}/wards`);
      for (let ward = 1; ward <= 25; ward++) paths.add(`/${city}/wards/${ward}`);
    }
    for (const motion of motions) if (motion.id && !motion.parentId) paths.add(`/${city}/motions/${motion.id}`);
    for (const councillor of councillors) {
      const name = typeof councillor === 'string' ? councillor : councillor.name;
      if (name) paths.add(`/${city}/councillors/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
    }
    for (const meeting of meetings) if (meeting.meetingReference) paths.add(`/${city}/meetings/${meeting.meetingReference}`);
  };
  addCityPaths('toronto', torontoMotions, torontoCouncillors, torontoMeetings, true);
  addCityPaths('vancouver', vancouverMotions, vancouverCouncillors, vancouverMeetings);
  addCityPaths('yellowknife', yellowknifeMotions, yellowknifeCouncillors, yellowknifeMeetings);

  const body = [...paths].map(path => `<url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`).join('');
  response.setHeader('Content-Type', 'application/xml; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
}
