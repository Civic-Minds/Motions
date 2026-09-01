/**
 * Import upcoming Vancouver Council meetings from the City's official calendar.
 * Voting records remain the source for completed meeting decisions; this fills
 * the gap for scheduled meetings that have not happened yet.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/vancouver/meetings.json');
const CALENDAR_URL = 'https://app.vancouver.ca/councilMeetingPublic/';

const TYPE_NAMES = {
  'Standing Committee on Policy and Strategic Priorities': 'Policy & Strategic Priorities',
  'Standing Committee on City Finance and Services': 'City Finance & Services',
};

function normalizeType(value) {
  return TYPE_NAMES[value.replace(/\s+-\s+Cancelled$/i, '').trim()] ?? value.replace(/\s+-\s+Cancelled$/i, '').trim();
}

function parseDate(value) {
  const match = value.match(/^([A-Za-z]+ \d{2}, \d{4}),\s*(\d{1,2}:\d{2} [AP]M)$/);
  if (!match) return null;
  const date = new Date(`${match[1]} ${match[2]}`);
  if (Number.isNaN(date.getTime())) return null;
  return {
    date: date.toISOString().slice(0, 10),
    displayDate: date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    startTime: match[2],
  };
}

async function scrapeUpcoming(page) {
  await page.goto(CALENDAR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByRole('button', { name: 'Upcoming meetings' }).click({ timeout: 10000 });
  await page.waitForTimeout(500);

  const meetings = [];
  for (;;) {
    const rows = await page.getByRole('grid').getByRole('row').all();
    for (const row of rows.slice(1)) {
      const cells = await row.getByRole('gridcell').allTextContents();
      const parsed = parseDate(cells[0] ?? '');
      const committee = normalizeType(cells[1] ?? '');
      if (!parsed || !committee) continue;
      const agendaLink = row.getByRole('link', { name: 'Agenda and Minutes' });
      const agendaUrl = await agendaLink.count() > 0 ? await agendaLink.getAttribute('href') : null;
      meetings.push({ ...parsed, committee, location: cells[2]?.trim() || '', agendaUrl, sourceUrl: agendaUrl || CALENDAR_URL });
    }

    const next = page.getByRole('button', { name: 'Go to the next page' });
    if (!(await next.isEnabled())) break;
    await next.click();
    await page.waitForTimeout(250);
  }
  return meetings;
}

function mergeMeetings(existing, scheduled) {
  const merged = new Map(existing.map(meeting => [meeting.meetingReference, meeting]));
  for (const meeting of scheduled) {
    const prior = existing.find(item => item.date === meeting.date && item.committee === meeting.committee);
    const reference = prior?.meetingReference ?? `vancouver-scheduled-${meeting.date.replaceAll('-', '')}-${meeting.committee.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    merged.set(reference, {
      ...prior,
      ...meeting,
      meetingReference: reference,
      meetingId: prior?.meetingId ?? null,
      meetingNumber: prior?.meetingNumber ?? null,
      isCouncil: meeting.committee.toLowerCase().includes('council'),
      agendaItems: prior?.agendaItems ?? [],
    });
  }
  return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date) || a.committee.localeCompare(b.committee));
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
try {
  const page = await browser.newPage({
    locale: 'en-CA',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const scheduled = await scrapeUpcoming(page);
  const existing = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : [];
  const merged = mergeMeetings(existing, scheduled);
  fs.writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2));
  console.log(`Imported ${scheduled.length} upcoming Vancouver meetings; total meetings: ${merged.length}.`);
} finally {
  await browser.close();
}
