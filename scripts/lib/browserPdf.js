/**
 * Browser fallback for eSCRIBE minutes PDFs that Cloudflare puts behind a
 * "Verifying your browser" check (HTTP 403 with cf-mitigated: challenge).
 *
 * Tested 2026-10-19: headless Chromium is always challenged, but a headed
 * one (xvfb-run in CI) is let through. Navigating straight to a PDF only
 * yields Chromium's PDF-viewer wrapper page, not the file, so the bytes are
 * fetched from inside an ordinary same-site page instead -- that request uses
 * the browser's own network stack, cookies and fingerprint.
 */

import { chromium } from 'playwright';


const ATTEMPTS = 5;
const REQUEST_GAP_MS = 1500;
let lastRequestAt = 0;
let browser;
let page;
let pageOrigin;

export async function fetchPdfInBrowser(url) {
  const origin = new URL(url).origin;
  if (!page || pageOrigin !== origin) {
    browser ??= await chromium.launch({ headless: false });
    page ??= await browser.newPage();
    await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(error => {
      console.warn(`Browser could not open ${origin}: ${error.message}`);
    });
    pageOrigin = origin;
  }
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const waitForGap = Math.max(0, REQUEST_GAP_MS - (Date.now() - lastRequestAt));
    if (waitForGap) await page.waitForTimeout(waitForGap);
    lastRequestAt = Date.now();
    const result = await page.evaluate(async documentUrl => {
      const response = await fetch(documentUrl, { credentials: 'include' });
      if (response.status === 429) return { status: 429, retryAfter: response.headers.get('retry-after') };
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { status: response.status, base64: btoa(binary) };
    }, url).catch(error => ({ status: 0, error: error.message }));
    const buffer = result.base64 ? Buffer.from(result.base64, 'base64') : null;
    if (buffer?.subarray(0, 4).toString() === '%PDF') return buffer;
    if (attempt < ATTEMPTS) {
      // The source rate-limits (HTTP 429); back off like the direct fetch does.
      const retryAfter = Number(result.retryAfter);
      const delayMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : Math.min(120000, 15000 * 2 ** (attempt - 1));
      if (result.status === 429) console.warn(`Browser PDF fetch rate-limited; retrying in ${Math.round(delayMs / 1000)}s: ${url}`);
      await page.waitForTimeout(result.status === 429 ? delayMs : 5000);
    } else console.warn(`Browser PDF fetch returned HTTP ${result.status}${result.error ? ` (${result.error})` : ''}: ${url}`);
  }
  return null;
}

export async function closePdfBrowser() {
  await browser?.close();
  browser = undefined;
  page = undefined;
}
