const SITE_URL = 'https://motions.watch';

export function previewImage(title, context) {
  const params = new URLSearchParams({ title, context });
  return `${SITE_URL}/api/og?${params}`;
}
