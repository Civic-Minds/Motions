const BLOB_BASE = 'https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com';

function escapeHtml(value = '') {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

async function loadJson(name) {
  const response = await fetch(`${BLOB_BASE}/${name}`);
  return response.ok ? response.json() : null;
}

export default async function handler(request, response) {
  const requestUrl = new URL(request.url, 'https://motions.watch');
  const route = requestUrl.searchParams.get('path') || '/toronto';
  let title = 'Motions Toronto';
  let description = "See every vote. Know every decision. It's your city.";
  let context = 'Toronto Council Voting Tracker';

  const motionMatch = route.match(/\/motions\/([^/]+)/);
  if (motionMatch) {
    const motions = await loadJson('motions.json');
    const motion = motions?.find(item => item.id === motionMatch[1]);
    if (motion) {
      title = motion.title;
      description = motion.summary || `${motion.status || 'Council decision'} · ${motion.committee || 'Toronto Council'}`;
      context = `${motion.status || 'Motion'} · ${motion.committee || 'Toronto Council'}`;
    }
  } else if (route.includes('/election')) {
    title = 'Toronto Election 2026';
    description = 'Review Toronto candidates, wards, voting dates, and registration information.';
    context = 'Toronto Election 2026';
  } else if (route.match(/\/councillors\/([^/]+)/)) {
    const slug = route.match(/\/councillors\/([^/]+)/)[1];
    const councillors = await loadJson('councillors.json');
    const councillor = councillors?.find(item => item.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
    if (councillor) {
      title = councillor.name;
      context = `Toronto City Councillor · Ward ${councillor.ward}`;
      description = `See ${councillor.name}'s voting record and council activity.`;
    }
  } else if (route.match(/\/wards\/([^/]+)/)) {
    const ward = route.match(/\/wards\/([^/]+)/)[1];
    title = `Ward ${ward} · Toronto`; context = `Toronto Ward ${ward}`;
    description = `See motions and council activity for Toronto Ward ${ward}.`;
  }

  const canonical = `https://motions.watch${route}`;
  const image = `https://motions.watch/api/og?title=${encodeURIComponent(title)}&context=${encodeURIComponent(context)}`;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  response.status(200).send(`<!doctype html><html><head>
    <title>${escapeHtml(title)} | Motions Toronto</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="website"><meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:site_name" content="Motions Toronto"><meta property="og:image" content="${escapeHtml(image)}">
    <meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(image)}">
    <meta name="twitter:image:alt" content="${escapeHtml(title)}">
  </head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></body></html>`);
}
