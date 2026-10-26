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
import { closePdfBrowser, fetchPdfInBrowser } from './lib/browserPdf.js';
import * as cheerio from 'cheerio';
import { isAdministrativeTitle } from './lib/topicClassification.js';
import { assertMinutesMostlyAvailable, previousAgendaItems } from './lib/minutesFallback.js';
import { cleanYellowknifeTitle, YELLOWKNIFE_TITLE_OVERRIDES } from '../src/utils/yellowknifeMotionTitle.js';


export const CALENDAR_URL = 'https://pub-yellowknife.escribemeetings.com';
const CALENDAR_API_URL = `${CALENDAR_URL}/MeetingsCalendarView.aspx/GetCalendarMeetings`;
// Every member of the current term, current or not. Minutes older than a
// departure still reference the departed member by name, so this stays the
// single list used both for parsing and for the published roster (via the
// `current` flag) -- flip it to false rather than deleting the entry.
export const COUNCIL_MEMBERS = [
  { name: 'Mayor Ben Hendriksen', current: true },
  { name: 'Garett Cochrane', current: true },
  { name: 'Ryan Fequet', current: true },
  { name: 'Rob Foote', current: true },
  { name: 'Cat McGurk', current: true },
  { name: 'Tom McLennan', current: true },
  { name: 'Stacie Arden-Smith', current: true },
  { name: 'Steve Payne', current: true },
  { name: 'Rob Warburton', current: true },
  { name: 'Mayor Rebecca Alty', current: false },
];

const DATA_DIR = path.join(process.cwd(), 'public/data/yellowknife');
const fromArg = process.argv.find(arg => arg.startsWith('--from='));
const FROM_DATE = fromArg?.slice('--from='.length) ?? '2022-10-18';
const TO_DATE = new Date().toISOString().slice(0, 10);
const PDF_REQUEST_GAP_MS = 1200;
const PDF_RETRY_LIMIT = 5;
let lastPdfRequestAt = 0;
let sourceChallenged = false;

function compact(value) { return value.replace(/\s+/g, ' ').trim(); }

function topicForTitle(title) {
  const value = title.toLowerCase();
  if (/\b(housing|homeless|shelter|affordable)\b/.test(value)) return 'Housing';
  if (/\b(transit|transportation|road|street|traffic)\b/.test(value)) return 'Transit';
  if (/\b(budget|tax|finance|financial|expenditure|procurement|contract)\b/.test(value)) return 'Finance';
  if (/\b(park|recreation|trail|playground)\b/.test(value)) return 'Parks';
  if (/\b(climate|emission|energy|waste|recycl|environment)\b/.test(value)) return 'Climate';
  return 'General';
}

function memberFromReference(reference) {
  const match = reference.match(/(?:Mayor|Deputy Mayor|Councillor)\s+([A-Z5])\.\s+([A-Za-z][A-Za-z'’-]*(?:-[A-Za-z][A-Za-z'’-]*)*)/i);
  if (!match) return null;
  const initial = ({ '5': 'S' }[match[1]] ?? match[1]).toUpperCase();
  const surname = match[2].toLowerCase();
  return COUNCIL_MEMBERS.find(member => {
    const bare = member.name.replace(/^Mayor\s+/i, '');
    const parts = bare.split(' ');
    return parts.at(-1).toLowerCase() === surname && parts[0][0].toUpperCase() === initial;
  })?.name ?? null;
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
    const outcome = body.match(OUTCOME_RE);
    if (!outcome) return null;
    const preOutcome = compact(body.slice(0, outcome.index));
    const questionText = preOutcome
      .replace(/^\d+\.\s*/, '')
      .replace(/^(?:Mayor|Councillor)\s+[^,/]+?\s+moved\s*[,/]\s*(?:Mayor|Councillor)(?:\s+[^,/]+?)?\s+(?:secon\s*d\s*ed|seco\s*nded)\s*[,/]\s*(?:\d(?!\.\s))?\s*/i, '');
    const question = questionText.match(/^That\s*[:,]?\s*([\s\S]*)/i)?.[1] ?? questionText;
    const title = compact(question)
      .replace(/-\s+/g, '-')
      .replace(/\bCounci\s+llor\b/gi, 'Councillor')
      .replace(/^DM#\d+.*?(First|Second|Third)\s+Reading/i, '$1 Reading')
      .replace(/^\d+\.\s*That\s*[:,]?\s*/i, '')
      .replace(/^\d{2}-\d{2}\s+/, '')
      .replace(/^\d+\.\s*/, '')
      .replace(/^ADOPTED MINUTES\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}\s+\d{2}-\d{2}\s+That\s*[:,]?\s*/i, '')
      .replace(/^ADOPTED MINUTES\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}\s+\d{2}-\d{2}\s+/i, '')
      .replace(/^(?:Mayor|Councillor)\s+[^,/]+?\s+moved\s*[,/]\s*(?:Mayor|Councillor)(?:\s+[^,/]+?)?\s+(?:secon\s*d\s*ed|seco\s*nded)\s*[,/]\s*(?:\d(?!\.\s))?\s*/i, '')
      .replace(/\s+As there was an equal number of votes.*$/i, '')
      .replace(/\s+Those in favour of the motion.*$/i, '')
      .replace(/\s+DM#\d+\s+Page\s+\d+\s+ADOPTED MINUTES\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}\s+\d{2}-\d{2}\s+/gi, ' ')
      .replace(/\s+ADOPTED MINUTES\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}\s+\d{2}-\d{2}\s+/gi, ' ')
      .replace(/\s+DM#\d+.*$/i, '');
    return buildMotion({ number, title, body, outcome, present, date, committee, sourceUrl, meetingReference });
  }).filter(Boolean);
}

const OUTCOME_RE = /MOTION\s+(CARRIED|DEFEATED)(?:\s+UNANIMOUSLY)?(?:\s*\(([^)]*)\))?/i;

function buildMotion({ number, title, body, outcome, present, date, committee, sourceUrl, meetingReference }) {
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
    topic: topicForTitle(title),
    administrative: isAdministrativeTitle(title) || /^(?:approve the agenda|adopt the agenda)\b/i.test(title) || /pursuant to s\.\s?\d+.*?time allowed.*?be extended/i.test(title),
    sourceUrl, agendaUrl: null, meetingReference, motionNumber: number,
    body: `${body}\n\nSource: ${sourceUrl}`,
  };
}

// eSCRIBE's HTML minutes (Meeting.aspx?...&Agenda=PostMinutes) mark up each
// motion's number, mover, seconder, text and result separately, so titles
// come straight from the motion text with no "moved/seconded" carving.
// Attendance lists one member per display:block span after a bold label.
function attendanceFromHtml($, label) {
  const paragraph = $('#AgendaHeaderTitle p').filter((_, el) => new RegExp(`^\\s*${label}:`, 'i').test($(el).find('span').first().text())).first();
  return paragraph.find('span').slice(1).toArray()
    .map(el => memberFromReference(compact($(el).text())))
    .filter(Boolean);
}

function motionTextFromHtml($, element) {
  const copy = $(element).clone();
  copy.find('li').each((_, li) => {
    const list = $(li).parent();
    const index = list.children('li').index(li);
    const lettered = /^a$/i.test(list.attr('type') ?? '') || list.parents('ol').length > 0;
    const marker = lettered ? `${String.fromCharCode(97 + index)}.` : `${index + 1}.`;
    $(li).prepend(`${marker} `).append(' ');
  });
  copy.find('p, br, div').append(' ');
  return compact(copy.text().replace(/[\u200b\u00a0]/g, ' '));
}

/** Returns null when the page isn't a minutes document (e.g. a browser-check page). */
export function parseHtmlMinutes(html, date, committee, sourceUrl, meetingReference) {
  const $ = cheerio.load(html);
  if (!/MINUTES/i.test($('#AgendaHeaderTitle').text())) return null;
  const present = attendanceFromHtml($, 'Present');
  return $('.AgendaItemMotion').toArray().map(element => {
    const item = $(element);
    const number = compact(item.find('.Number .Value').first().text()).replace(/^#/, '');
    const result = compact(item.find('.MotionResult').first().text());
    const outcome = result.match(OUTCOME_RE);
    if (!/^\d{3,6}-\d{2}$/.test(number) || !outcome) return null;
    if (compact(item.find('.MotionVoters').text())) console.warn(`Yellowknife motion ${number} on ${date} has a recorded vote table; only the result line is parsed.`);
    const text = motionTextFromHtml($, item.find('.MotionText').first());
    const title = compact(text.match(/^That\s*[:,]?\s*([\s\S]*)/i)?.[1] ?? text);
    const movedBy = compact(item.find('.MovedBy .Value').text());
    const secondedBy = compact(item.find('.SecondedBy .Value').text());
    const body = compact(`#${number} Moved by ${movedBy}, seconded by ${secondedBy}. ${text} ${result}`);
    return buildMotion({ number, title, body, outcome, present, date, committee, sourceUrl, meetingReference });
  }).filter(Boolean);
}

async function readHtml(url) {
  let response;
  for (let attempt = 1; attempt <= PDF_RETRY_LIMIT; attempt += 1) {
    const waitForGap = Math.max(0, PDF_REQUEST_GAP_MS - (Date.now() - lastPdfRequestAt));
    if (waitForGap) await new Promise(resolve => setTimeout(resolve, waitForGap));
    lastPdfRequestAt = Date.now();
    response = await fetch(url, { headers: { 'User-Agent': 'Motions civic data importer/1.0' } });
    if (response.status !== 429 && response.status < 500) break;
    if (attempt === PDF_RETRY_LIMIT) break;
    await new Promise(resolve => setTimeout(resolve, Math.min(120000, 15000 * 2 ** (attempt - 1))));
  }
  if (!response.ok) {
    console.warn(`Yellowknife HTML minutes returned HTTP ${response.status}: ${url}`);
    return null;
  }
  return response.text();
}

function pdfText(buffer) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'motions-yellowknife-'));
  const pdfPath = path.join(tempDir, 'document.pdf');
  fs.writeFileSync(pdfPath, buffer);
  try { return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }); }
  finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
}

async function readPdf(url) {
  // Once the source has answered with its browser check, every direct request
  // will too; go straight to the browser so each PDF is requested only once.
  if (sourceChallenged) {
    const buffer = await fetchPdfInBrowser(url);
    if (buffer) return pdfText(buffer);
    console.warn(`Skipped non-PDF Yellowknife minutes document: ${url}`);
    return null;
  }
  let response;
  for (let attempt = 1; attempt <= PDF_RETRY_LIMIT; attempt += 1) {
    const waitForGap = Math.max(0, PDF_REQUEST_GAP_MS - (Date.now() - lastPdfRequestAt));
    if (waitForGap) await new Promise(resolve => setTimeout(resolve, waitForGap));
    lastPdfRequestAt = Date.now();
    response = await fetch(url, {
      headers: { 'User-Agent': 'Motions civic data importer/1.0' },
    });
    if (response.status !== 429 && response.status < 500) break;
    if (attempt === PDF_RETRY_LIMIT) break;
    const retryAfter = Number(response.headers.get('retry-after'));
    const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(120000, 15000 * 2 ** (attempt - 1));
    console.warn(`Yellowknife document returned HTTP ${response.status}; retrying in ${Math.round(delayMs / 1000)}s: ${url}`);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  if (response.headers.get('cf-mitigated') === 'challenge') sourceChallenged = true;
  let buffer = response.ok ? Buffer.from(await response.arrayBuffer()) : null;
  if (buffer?.subarray(0, 4).toString() !== '%PDF') buffer = await fetchPdfInBrowser(url);
  if (buffer?.subarray(0, 4).toString() !== '%PDF') {
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
  const existingMeetingsById = new Map(existingMeetings.map(meeting => [meeting.meetingId, meeting]));
  const fetchedMeetingIds = new Set();
  let htmlAttempted = 0;
  let htmlBlocked = 0;
  let pdfBlocked = 0;

  for (const item of [...new Map(calendarMeetings.map(meeting => [meeting.ID, meeting])).values()]) {
    const date = item.StartDate?.slice(0, 10).replaceAll('/', '-');
    if (!date || date < FROM_DATE || date > TO_DATE) continue;
    const committee = decodeHtml(item.MeetingName);
    const meetingId = item.ID;
    // meetingId is a full eSCRIBE GUID (e.g. "a46df837-b515-..."); the city
    // name and full committee slug are redundant here (both already shown
    // elsewhere on the page), so keep this short like other cities'
    // references ("2026.RG6", "van-18838-11541") instead of the ~90-char
    // string a plain concatenation produced.
    const meetingReference = `yk-${date}-${meetingId.slice(0, 8)}`;
    const detailUrl = `${CALENDAR_URL}/Meeting?Id=${meetingId}`;
    const documents = (item.MeetingDocumentLink ?? []).map(document => ({
      type: document.Type,
      format: document.Format,
      label: decodeHtml(document.Title),
      href: new URL(document.Url, CALENDAR_URL).href,
    }));
    // Newer meetings (May 2026 on) also publish HTML minutes, which the
    // City's browser check doesn't block; older ones only have PDFs.
    const htmlMinutesLink = documents.find(link => link.type === 'PostMinutes' && /html/i.test(link.format ?? ''));
    const minutesLink = htmlMinutesLink ?? documents.find(link => /minutes|postminutes/i.test(`${link.type} ${link.label}`));
    const agendaLink = documents.find(link => /agenda/i.test(`${link.type} ${link.label}`));
    const meeting = { date, startTime: item.StartDate.slice(11, 16).replace(':', ''), committee, meetingId, meetingNumber: meetingId, meetingReference, isCouncil: /council/i.test(committee), sourceUrl: detailUrl, agendaUrl: agendaLink?.href ?? null, minutesUrl: minutesLink?.href ?? null, agendaItems: [] };
    fetchedMeetingIds.add(meetingId);
    if (minutesLink) {
      let parsed;
      if (htmlMinutesLink) {
        const html = await readHtml(htmlMinutesLink.href);
        parsed = html ? parseHtmlMinutes(html, date, committee, htmlMinutesLink.href, meetingReference) : null;
        // The block-ratio gate covers the HTML minutes only: older meetings'
        // PDFs are blocked indefinitely, but their motions are already stored.
        htmlAttempted += 1;
        if (!parsed) htmlBlocked += 1;
      } else {
        const minutesText = await readPdf(minutesLink.href);
        parsed = minutesText ? parseMotions(minutesText, date, committee, minutesLink.href, meetingReference) : null;
        if (!parsed) pdfBlocked += 1;
      }
      if (!parsed) {
        // Blocked or unreadable: keep this meeting's existing motion links
        // instead of publishing it with none.
        meeting.agendaItems = previousAgendaItems(existingMeetingsById.get(meetingId), existingMotions, meetingReference);
      }
      for (const motion of parsed ?? []) {
        const prior = existingById.get(motion.id);
        motions.push({ ...prior, ...motion, summary: prior?.summary, keyAmounts: prior?.keyAmounts });
        meeting.agendaItems.push({ reference: motion.id, title: motion.title, inCamera: false, url: motion.sourceUrl, motionId: motion.id });
      }
    }
    meetings.push(meeting);
    console.log(`Processed ${date} ${committee}: ${meeting.agendaItems.length} motions`);
  }
  if (pdfBlocked) console.warn(`${pdfBlocked} older Yellowknife PDF minutes were blocked or unreadable; kept their existing motion links.`);
  assertMinutesMostlyAvailable('Yellowknife HTML', htmlAttempted, htmlBlocked);

  const mergedMotions = [...existingMotions.filter(motion => !motions.some(next => next.id === motion.id)), ...motions]
    .map(motion => ({
      ...motion,
      title: cleanYellowknifeTitle(compact(YELLOWKNIFE_TITLE_OVERRIDES[motion.id] ?? motion.title ?? ''), motion.id)
        .replace(/-\s+/g, '-')
        .replace(/^DM#\d+.*?(First|Second|Third)\s+Reading/i, '$1 Reading')
        .replace(/^DM#\d+.*?(?=\d+\.\s+[A-Z])/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\bCounci\s+llor\b/gi, 'Councillor')
        .replace(/\s+DM#\d+.*$/i, ''),
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const mergedMeetings = [...existingMeetings.filter(meeting => !fetchedMeetingIds.has(meeting.meetingId)), ...meetings]
    .sort((a, b) => a.date.localeCompare(b.date) || a.committee.localeCompare(b.committee));
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'motions.json'), JSON.stringify(mergedMotions, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'meetings.json'), JSON.stringify(mergedMeetings, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'councillors.json'), JSON.stringify(COUNCIL_MEMBERS, null, 2));
  console.log(`Imported ${motions.length} Yellowknife motions across ${meetings.length} meetings (${mergedMotions.length} total motions).`);
}

if (import.meta.url === `file://${process.argv[1]}`) main()
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(closePdfBrowser);
