import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://motions.watch';
const DEFAULT_TITLE = 'Motions — City Council Voting Records Across Canada';
const DEFAULT_DESCRIPTION = 'Explore city council motions, voting records, and plain-language explanations of local decisions across Canada.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

function setMeta(attribute, value, content) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function PageMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE }) {
  const { pathname } = useLocation();
  const canonical = `${SITE_URL}${pathname}`;

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:site_name', 'Motions');
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [canonical, description, image, title]);

  return null;
}
