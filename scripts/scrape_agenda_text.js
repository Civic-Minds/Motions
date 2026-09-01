/**
 * scrape_agenda_text.js
 *
 * Uses Playwright to scrape agenda item text from city agenda pages for each motion.
 * Stores the result in a `body` field on each motion in motions.json.
 * Incremental — skips motions that already have a `body` field or a `summary` (already processed).
 *
 * Targets all primary motions (no parentId). Significance filter removed —
 * pairwise notability scoring requires summaries for all motions.
 *
 * Usage:
 *   npm install playwright-core --save-dev   (first time only, no browser download)
 *   node scripts/scrape_agenda_text.js
 *   node scripts/scrape_agenda_text.js --limit=10     (test run)
 */

import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; })
);

const IS_VANCOUVER = !!args.vancouver;
const DATA_PATH = path.join(process.cwd(), IS_VANCOUVER ? 'public/data/vancouver/motions.json' : 'public/data/motions.json');
const LIMIT   = args['limit'] ? parseInt(args['limit'], 10) : Infinity;
const DELAY_MS = 1200; // be polite

async function extractTorontoAgendaText(page) {
  return page.evaluate(() => {
    // TMMIS pages are old-school HTML — grab the main content area
    const selectors = [
      '#content',
      '.content',
      'main',
      '#mainContent',
      '.agenda-item',
      'table.agenda',
      // Fallback: everything inside body minus nav/header/footer
      'body',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        // Strip scripts, styles, nav elements
        const clone = el.cloneNode(true);
        clone.querySelectorAll('script, style, nav, header, footer, [role="navigation"]').forEach(n => n.remove());
        const text = clone.innerText || clone.textContent || '';
        const cleaned = text
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0)
          .join('\n');
        if (cleaned.length > 100) return { text: cleaned, selector: sel };
      }
    }
    return null;
  });
}

async function extractVancouverAgendaText(page, targetTitle) {
  return page.evaluate(({ targetTitle }) => {
    const normalize = value => value
      .toLowerCase()
      .replace(/[–—−]/g, '-')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const wanted = normalize(targetTitle);
    if (!wanted) return null;

    const candidates = [...document.querySelectorAll('h2, h3, h4, p')]
      .map(el => ({ el, text: (el.innerText || '').trim(), normalized: normalize(el.innerText || '') }))
      .filter(candidate => candidate.text && candidate.normalized)
      .filter(candidate => candidate.normalized.includes(wanted) || wanted.includes(candidate.normalized))
      .sort((a, b) => Math.abs(a.normalized.length - wanted.length) - Math.abs(b.normalized.length - wanted.length));
    const match = candidates[0];
    if (!match) return null;

    const level = Number(match.el.tagName.slice(1));
    const chunks = [match.text];
    let node = match.el.nextElementSibling;
    while (node) {
      if (/^H[1-6]$/.test(node.tagName) && Number(node.tagName.slice(1)) <= level) break;
      const text = (node.innerText || '').trim();
      if (text) chunks.push(text);
      node = node.nextElementSibling;
    }

    const text = chunks.join('\n');
    // A heading followed only by “Report”/“Presentation” is not source text.
    const substantive = chunks.slice(1).some(chunk =>
      chunk.split(/\s+/).some(word => !/^(report|presentation|motion|pdf)$/i.test(word))
    );
    if (!substantive || text.length < 80) return null;
    return { text, selector: match.el.tagName.toLowerCase() };
  }, { targetTitle });
}

async function main() {
  const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const targets = motions.filter(m =>
    !m.parentId &&
    (IS_VANCOUVER ? m.agendaUrl : m.url) &&
    !m.body &&
    !m.summary  // already summarized (body was stripped) — no need to re-scrape
  );

  const queue = targets.slice(0, LIMIT);

  console.log(`\n🎯 ${targets.length} motions need scraping`);
  if (LIMIT < Infinity) console.log(`   Running first ${queue.length} (--limit=${LIMIT})`);
  console.log(`   ${motions.filter(m => m.body).length} already have body text\n`);

  if (queue.length === 0) {
    console.log('✅ Nothing to do.');
    return;
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'en-CA',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Build a lookup for quick update
  const motionMap = new Map(motions.map(m => [m.id, m]));

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i++) {
    const m = queue[i];
    const agendaUrl = IS_VANCOUVER ? m.agendaUrl : m.url;
    process.stdout.write(`[${i + 1}/${queue.length}] ${m.id} — ${m.title.slice(0, 60)}… `);

    try {
      await page.goto(agendaUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800); // let JS settle

      // Check for access denied
      const pageTitle = await page.title();
      if (pageTitle.toLowerCase().includes('access denied') ||
          pageTitle.toLowerCase().includes('attention required') ||
          pageTitle.toLowerCase().includes('error') ||
          pageTitle.toLowerCase().includes("can't be found")) {
        console.log(`⛔ blocked (${pageTitle})`);
        failed++;
        continue;
      }

      const result = IS_VANCOUVER
        ? await extractVancouverAgendaText(page, m.title)
        : await extractTorontoAgendaText(page);
      if (result && result.text.length > 50) {
        motionMap.get(m.id).body = result.text;
        console.log(`✓ (${result.text.length} chars, via ${result.selector})`);
        succeeded++;

        // Save incrementally every 10 motions
        if (succeeded % 10 === 0) {
          fs.writeFileSync(DATA_PATH, JSON.stringify([...motionMap.values()], null, 2));
          console.log(`   💾 saved progress (${succeeded} done)`);
        }
      } else {
        console.log('⚠️  no content extracted');
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 60)}`);
      failed++;
    }

    if (i < queue.length - 1) await page.waitForTimeout(DELAY_MS);
  }

  await browser.close();

  // Final save
  fs.writeFileSync(DATA_PATH, JSON.stringify([...motionMap.values()], null, 2));

  console.log(`\n✅ Done — ${succeeded} scraped, ${failed} failed`);
  console.log(`   Total motions with body: ${[...motionMap.values()].filter(m => m.body).length}`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
