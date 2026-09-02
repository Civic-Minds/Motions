export function trackGoogleEvent(name, parameters = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, parameters);
  }
}
