/**
 * Import Yellowknife Council decisions from the City's public meeting calendar.
 *
 * Yellowknife has no structured voting dataset. Its official calendar links to
 * agenda/minutes PDFs, so this importer extracts numbered motions and outcomes
 * from the minutes. Individual votes are populated only for unanimous results
 * or named opposing members; a bare "carried" result gets no invented roll call.
 *
 * Usage: node scripts/import_yellowknife_data.js [--from=2022-10-18]
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/* global process, Buffer */

export const CALENDAR_URL = 'https://pub-yellowknife.escribemeetings.com';
const CALENDAR_API_URL = `${CALENDAR_URL}/MeetingsCalendarView.aspx/GetCalendarMeetings`;
export const COUNCIL_MEMBERS = [
  'Mayor Ben Hendriksen', 'Garett Cochrane', 'Ryan Fequet', 'Rob Foote',
  'Cat McGurk', 'Tom McLennan', 'Stacie Arden-Smith', 'Steve Payne', 'Rob Warburton',
];
const TERM_MEMBERS = [
  'Mayor Rebecca Alty', ...COUNCIL_MEMBERS,
];

const DATA_DIR = path.join(process.cwd(), 'public/data/yellowknife');
const fromArg = process.argv.find(arg => arg.startsWith('--from='));
const FROM_DATE = fromArg?.slice('--from='.length) ?? '2022-10-18';
const TO_DATE = new Date().toISOString().slice(0, 10);

function compact(value) { return value.replace(/\s+/g, ' ').trim(); }
function slugify(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

function memberFromReference(reference) {
  const match = reference.match(/(?:Mayor|Deputy Mayor|Councillor)\s+([A-Z5])\.\s+([A-Za-z][A-Za-z'’-]*(?:-[A-Za-z][A-Za-z'’-]*)*)/i);
  if (!match) return null;
  const initial = ({ '5': 'S' }[match[1]] ?? match[1]).toUpperCase();
  const surname = match[2].toLowerCase();
  return TERM_MEMBERS.find(member => {
    const bare = member.replace(/^Mayor\s+/i, '');
    const parts = bare.split(' ');
    return parts.at(-1).toLowerCase() === surname && parts[0][0].toUpperCase() === initial;
  }) ?? null;
}

export function parsePresentMembers(text) {
  const section = text.match(/\bPresent:\s*([\s\S]*?)(?=\n\s*(?:City Staff|Staff|Administration)\s*:)/i)?.[1] ?? '';
  const present = new Set();
  for (const match of section.matchAll(/(?:Mayor|Deputy Mayor|Councillor)\s+[A-Z5]\.\s+[A-Za-z][A-Za-z'’-]*(?:-[A-Za-z][A-Za-z'’-]*)*/gi)) {
    const member = memberFromReference(match[0]);
    if (member) present.add(member);
  }
  return [...present];
}

function normalizeText(text) {
  return text.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function parseMotions(text, date, committee, sourceUrl, meetingReference) {
  const normalized = normalizeText(text);
  const present = parsePresentMembers(normalized);
  const blocks = [...normalized.matchAll(/(^|\n)\s*#(\d{3,6})-(\d{2})\s+([\s\S]*?)(?=\n\s*#\d{3,6}-\d{2}\b|\n\s*ADJOURNMENT\b|$)/gi)];

  return blocks.map(match => {
    const number = `${match[2]}-${match[3]}`;
    const body = compact(match[4]);
    const outcome = body.match(/MOTION\s+(CARRIED|DEFEATED)(?:\s+UNANIMOUSLY)?(?:\s*\(([^)]*)\))?/i);
    if (!outcome) return null;
    const question = body.match(/\bThat\s+([\s\S]*?)(?=\s+MOTION\s+(?:CARRIED|DEFEATED)\b)/i)?.[1] ?? body;
    const title = compact(question).replace(/[.;:]$/, '').slice(0, 280);
    const opposed = [...(outcome[2] ?? '').matchAll(/(?:Mayor|Deputy Mayor|Councillor)\s+[A-Z5]\.\s+[A-Za-z][A-Za-z'’-]*(?:-[A-Za-z][A-Za-z'’-]*)*/gi)]
      .map(item => memberFromReference(item[0])).filter(Boolean);
    const unanimous = /UNANIMOUSLY/i.test(outcome[0]);
    const votes = {};
    if (unanimous) present.forEach(member => { votes[member] = 'YES'; });
    opposed.forEach(member => { votes[member] = 'NO'; });
    const yesCount = Object.values(votes).filter(vote => vote === 'YES').length;
    const noCount = Object.values(votes).filter(vote => vote === 'NO').length;
    const status = outcome[1].toUpperCase() === 'CARRIED' ? 'Adopted' : 'Not adopted';
    return {
      id: `yk-${date}-${number}`, title, date, committee, status, votes, yesCount, noCount,
      topic: 'General', significance: status === 'Adopted' ? (unanimous ? 10 : 20) : 25,
      trivial: true, sourceUrl, agendaUrl: null, meetingReference, motionNumber: number,
      body: `${body}\n\nSource: ${sourceUrl}`,
    };
  }).filter(Boolean);
}

function pdfText(buffer) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'motions-yellowknife-'));
  const pdfPath = path.join(tempDir, 'document.pdf');
  fs.writeFileSync(pdfPath, buffer);
  try { return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }); }
  finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
}

async function readPdf(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Yellowknife document returned HTTP ${response.status}: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    console.warn(`Skipped non-PDF Yellowknife minutes document: ${url}`);
    return null;
  }
  return pdfText(buffer);
}

function decodeHtml(value) {
  return compact(cheerio.load(`<span>${value ?? ''}</span>`)('span').text());
}

function dateWindows(fromDate, toDate) {
  const windows = [];
  const cursor = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  while (cursor <= end) {
    const windowStart = cursor.toISOString().slice(0, 10);
    const windowEndDate = new Date(cursor);
    windowEndDate.setUTCDate(windowEndDate.getUTCDate() + 364);
    const windowEnd = new Date(Math.min(windowEndDate.getTime(), end.getTime())).toISOString().slice(0, 10);
    windows.push([windowStart, windowEnd]);
    cursor.setUTCDate(cursor.getUTCDate() + 365);
  }
  return windows;
}

async function main() {
  const calendarMeetings = [];
  for (const [startDate, endDate] of dateWindows(FROM_DATE, TO_DATE)) {
    const response = await fetch(CALENDAR_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendarStartDate: startDate, calendarEndDate: endDate }),
    });
    if (!response.ok) throw new Error(`Yellowknife calendar returned HTTP ${response.status}`);
    const payload = await response.json();
    calendarMeetings.push(...(payload.d ?? []));
  }
  const motions = [];
  const meetings = [];
  const existingMotions = fs.existsSync(path.join(DATA_DIR, 'motions.json')) ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'motions.json'), 'utf8')) : [];
  const existingMeetings = fs.existsSync(path.join(DATA_DIR, 'meetings.json')) ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'meetings.json'), 'utf8')) : [];
  const existingById = new Map(existingMotions.map(motion => [motion.id, motion]));
  const fetchedMeetingRefs = new Set();

  for (const item of [...new Map(calendarMeetings.map(meeting => [meeting.ID, meeting])).values()]) {
    const date = item.StartDate?.slice(0, 10).replaceAll('/', '-');
    if (!date || date < FROM_DATE || date > TO_DATE) continue;
    const committee = decodeHtml(item.MeetingName);
    const meetingId = item.ID;
    const meetingReference = `yellowknife-${date}-${slugify(committee)}-${meetingId}`;
    const detailUrl = `${CALENDAR_URL}/Meeting?Id=${meetingId}`;
    const documents = (item.MeetingDocumentLink ?? []).map(document => ({
      type: document.Type,
      label: decodeHtml(document.Title),
      href: new URL(document.Url, CALENDAR_URL).href,
    }));
    const minutesLink = documents.find(link => /minutes|postminutes/i.test(`${link.type} ${link.label}`));
    const agendaLink = documents.find(link => /agenda/i.test(`${link.type} ${link.label}`));
    const meeting = { date, startTime: item.StartDate.slice(11, 16).replace(':', ''), committee, meetingId, meetingNumber: meetingId, meetingReference, isCouncil: /council/i.test(committee), sourceUrl: detailUrl, agendaUrl: agendaLink?.href ?? null, agendaItems: [] };
    fetchedMeetingRefs.add(meetingReference);
    if (minutesLink) {
      const minutesText = await readPdf(minutesLink.href);
      for (const motion of minutesText ? parseMotions(minutesText, date, committee, minutesLink.href, meetingReference) : []) {
        const prior = existingById.get(motion.id);
        motions.push({ ...prior, ...motion, summary: prior?.summary, keyAmounts: prior?.keyAmounts });
        meeting.agendaItems.push({ reference: motion.id, title: motion.title, inCamera: false, url: motion.sourceUrl });
      }
    }
    meetings.push(meeting);
    console.log(`Processed ${date} ${committee}: ${meeting.agendaItems.length} motions`);
  }

  const mergedMotions = [...existingMotions.filter(motion => !motions.some(next => next.id === motion.id)), ...motions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const mergedMeetings = [...existingMeetings.filter(meeting => !fetchedMeetingRefs.has(meeting.meetingReference)), ...meetings]
    .sort((a, b) => a.date.localeCompare(b.date) || a.committee.localeCompare(b.committee));
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'motions.json'), JSON.stringify(mergedMotions, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'meetings.json'), JSON.stringify(mergedMeetings, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'councillors.json'), JSON.stringify(COUNCIL_MEMBERS, null, 2));
  console.log(`Imported ${motions.length} Yellowknife motions across ${meetings.length} meetings (${mergedMotions.length} total motions).`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error.message); process.exitCode = 1; });
