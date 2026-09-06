/**
 * Import Victoria, BC council votes from the City's public eSCRIBE meeting
 * calendar (pub-victoria.escribemeetings.com) — the same platform
 * Yellowknife's importer already reads. This replaces the old Power BI
 * dashboard importer: that public report froze at 2026-01-22 and this
 * project's own validator correctly refused to publish stale data, leaving
 * Victoria with zero live records. eSCRIBE is updated weekly and current
 * through the present, so this importer has no staleness problem to guard.
 *
 * Like Yellowknife, Victoria has no structured voting dataset — only agenda
 * and minutes PDFs. Individual votes are populated only for named opposed/
 * absent members (minutes read "OPPOSED (2): Councillor X, Councillor Y" on
 * its own line, not inline with the outcome); a bare "CARRIED UNANIMOUSLY"
 * gets every present member marked YES, no invented roll call otherwise.
 *
 * Format notes (see CHANGELOG / commit message for the full writeup):
 *  - Agenda items use lettered/nested codes ("F.1", "F.1.a.c"), not numbers.
 *    Unlike Yellowknife's source, each item's own heading text IS a clean,
 *    human title, so titles come from there rather than being carved out of
 *    "That Council ..." resolution text.
 *  - Committee of the Whole recommendations get formally ratified by Council
 *    roughly two weeks later, at a different meeting/date — not a same-day
 *    duplicate. Both stages are real, distinct recorded votes, so both are
 *    imported flat with no dedup/link, matching how Yellowknife's importer
 *    treats every meeting's motions independently.
 *  - A "Consent Agenda" block can bundle several lettered items behind one
 *    shared CARRIED/DEFEATED line — those items are pulled out and each
 *    gets its own motion sharing that one outcome; later restatements of the
 *    same items elsewhere in the minutes ("This item was approved on the
 *    Consent Agenda.") have no outcome marker of their own and are dropped.
 *  - Only the current council term (2022-11-01 onward) is in scope by
 *    default: minutes name councillors by surname only ("Councillor
 *    Coleman"), and going further back pulls in past-term names this
 *    importer's fixed 9-member roster (and the validator's councillor
 *    checks) would reject. Older minutes (pre-2021ish) also use a
 *    different, unstructured prose format this parser doesn't attempt.
 *
 * Usage: node scripts/import_victoria_data.js [--from=2022-11-01]
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import fetch from 'node-fetch';
import { classifyVictoriaTopic } from './lib/victoriaClassification.js';
import { isAdministrativeTitle } from './lib/topicClassification.js';

/* global process, Buffer */

export const CALENDAR_URL = 'https://pub-victoria.escribemeetings.com';
const CALENDAR_API_URL = `${CALENDAR_URL}/MeetingsCalendarView.aspx/GetCalendarMeetings`;

// Current council term (took office November 2022). Minutes reference
// members by surname only ("Mayor Alto", "Councillor Coleman") — this list
// resolves those surnames while parsing. Update after the 2026-10-17
// election once the new council is seated.
export const COUNCIL_MEMBERS = [
  'Marianne Alto', 'Jeremy Caradonna', 'Chris Coleman', 'Matt Dell',
  'Marg Gardiner', 'Stephen Hammond', 'Susan Kim', 'Krista Loughton', 'Dave Thompson',
];

const DATA_DIR = path.join(process.cwd(), 'public/data/victoria');
const fromArg = process.argv.find(arg => arg.startsWith('--from='));
const FROM_DATE = fromArg?.slice('--from='.length) ?? '2022-11-01';
const TO_DATE = new Date().toISOString().slice(0, 10);

// Real recorded-vote bodies only. The same calendar also lists non-decision
// items (By Election, Citizens' Assembly Council Committee, Lunch Time
// Lecture Series, Public Lectures and Events, Town Hall Meetings) and two
// committees retired before this importer's date floor (Governance &
// Priorities Committee, Planning and Land Use Committee — both 2014-only).
const DECISION_BODY_RE = /^(?:Special\s+)?(?:Council(?:\s*\(to follow COTW\))?|Committee of the Whole(?:\s+Meeting)?)$/i;

function compact(value) { return String(value ?? '').replace(/\s+/g, ' ').trim(); }

function memberFromSurname(surname) {
  const lower = surname.trim().toLowerCase();
  return COUNCIL_MEMBERS.find(member => member.split(' ').at(-1).toLowerCase() === lower) ?? null;
}

function namesFromList(text) {
  const names = [];
  for (const match of String(text ?? '').matchAll(/(?:Mayor|Councillor)\s+([A-Z][A-Za-z'’-]*)/g)) {
    const member = memberFromSurname(match[1]);
    if (member) names.push(member);
  }
  return [...new Set(names)];
}

function parsePresentMembers(text) {
  // Spans both "PRESENT:" and any "PRESENT ELECTRONICALLY:" sub-section —
  // both fall inside this window, before the staff block. Some years label
  // that "STAFF PRESENT:", others just "STAFF:" — matching only the former
  // left the whole PRESENT section unmatched (and every vote in the meeting
  // silently empty) for minutes using the shorter label.
  const section = text.match(/\bPRESENT:?\s*([\s\S]*?)(?=\n\s*STAFF\b)/i)?.[1] ?? '';
  // An "ABSENT:" (sometimes "REGRETS:") sub-list can appear in this same
  // window, before STAFF — without excluding it, an absent member's name
  // still matches the plain Mayor/Councillor pattern and gets counted as
  // present, defaulting them to a phantom YES on every vote that meeting.
  const absentSection = section.match(/\b(?:ABSENT|REGRETS):?\s*([\s\S]*)$/i)?.[1] ?? '';
  const absentNames = new Set(namesFromList(absentSection));
  return namesFromList(section).filter(name => !absentNames.has(name));
}

// Addresses/named places mentioned in a title — carried over unchanged from
// the old Power BI importer; still applies to eSCRIBE titles the same way,
// and feeds geocode_victoria_data.js + VictoriaMiniMap.
function locationsFromTitle(title) {
  const matches = title.match(/\b\d{1,5}(?:\s*(?:and|&)\s*\d{1,5})?\s+[A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*){0,3}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy)\b/gi) ?? [];
  const namedPlaces = [
    'Topaz Park', 'Crystal Pool and Fitness Centre', 'Centennial Square', 'Bastion Square',
    'Victoria City Hall', 'Victoria Harbour', 'Inner Harbour', 'Songhees Nation',
    'James Bay', 'North Park', 'Fernwood', 'Fairfield', 'Victoria West', 'Downtown Victoria',
    'Caledonia Place', 'Vancouver Island Brewing', 'Victoria Curling Club', 'Royal Theatre',
    'Capital Regional District', 'Greater Victoria Harbour Authority',
  ].filter(place => title.toLowerCase().includes(place.toLowerCase()));
  return [...new Set([...matches.map(address => compact(address)), ...namedPlaces])];
}

// ─── Minutes parsing ──────────────────────────────────────────────────────

// A lettered/nested agenda-item heading: "F.1", "F.1.a", "F.1.a.c", bare "C".
// Requires the code to be followed by whitespace then genuine title text
// (starting upper-case or a digit) — excludes ALL-CAPS run-on words like
// "STAFF PRESENT:" and lower-case resolution sub-bullets ("a.", "b.").
// The trailing period is captured (group 2), not just consumed, because a
// bare letter's period is sometimes dropped by the source formatting (e.g.
// "C        APPROVAL OF AGENDA") — but making it unconditionally optional
// also matches the indefinite article "A" starting an ordinary sentence
// ("A Council Member Motion dated..."), so bare-letter matches need an
// extra check below (see firstWordAllCaps) that a suffixed code doesn't.
const HEADING_RE = /^([A-Z](?:\.\d+)?(?:\.[a-z]+)*)(\.)?\s+(?=[A-Z0-9])(.*)$/;

function firstWordAllCaps(text) {
  const word = text.trim().split(/\s+/)[0] ?? '';
  return word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word);
}
const BODY_START_RE = /^(?:Moved and Seconded|Moved By|Amendment|Amendment to the amendment|Main motion|Council discussed|Committee discussed|This item was approved)/i;
// Anchored to the WHOLE line on purpose — resolution text routinely uses
// these same words in an ordinary sentence ("...after adoption of the
// zoning bylaw amendment, if it is adopted..."), which a plain \b word
// search would misfire on. A real outcome announcement is always its own
// standalone line with nothing else on it.
const OUTCOME_LINE_RE = /^(CARRIED|ADOPTED|DEFEATED|LOST|REFERRED|DEFERRED)\b(?:\s+(UNANIMOUSLY))?(?:\s*\(\s*(\d+)\s*(?:to|TO)\s*(\d+)\s*\))?\.?$/i;
const NAMED_VOTE_LINE_RE = /^(FOR|OPPOSED|Absent|Conflict)\s*\(\s*(\d+)\s*\)\s*:\s*(.*)$/i;

function outcomeFromMatch(match) {
  const word = match[1].toUpperCase();
  const status = ['CARRIED', 'ADOPTED'].includes(word) ? 'Adopted'
    : ['DEFEATED', 'LOST'].includes(word) ? 'Lost'
      : 'Referred';
  const tally = match[3] && match[4] ? { yes: Number(match[3]), no: Number(match[4]) } : null;
  return { status, tally, resultText: compact(match[0]) };
}

// Reads the outcome, plus any named OPPOSED/Absent votes, out of an item's
// body lines. Multiple motions (an original, an amendment, the
// amended-final vote) can appear inside one item — the LAST outcome line is
// the one that actually happened to the item, so named-vote lines are only
// read back to the *previous* outcome line (or the start of the body),
// keeping an earlier amendment's dissent from bleeding into the final vote.
function extractOutcome(bodyLines) {
  const outcomeIdxs = [];
  bodyLines.forEach((line, i) => { if (OUTCOME_LINE_RE.test(line)) outcomeIdxs.push(i); });
  if (!outcomeIdxs.length) return null;
  const lastIdx = outcomeIdxs.at(-1);
  const prevIdx = outcomeIdxs.length > 1 ? outcomeIdxs.at(-2) : -1;

  const forNamed = new Set();
  const opposed = new Set();
  const absent = new Set();
  const conflict = new Set();
  let sawForLine = false;
  for (let i = prevIdx + 1; i < lastIdx; i++) {
    const named = bodyLines[i].match(NAMED_VOTE_LINE_RE);
    if (!named) continue;
    const label = named[1].toUpperCase();
    const declaredCount = Number(named[2]);
    let namesText = named[3];
    let j = i + 1;
    // A long name list can wrap onto the next physical line(s).
    while (j < lastIdx && bodyLines[j] && !NAMED_VOTE_LINE_RE.test(bodyLines[j]) && !OUTCOME_LINE_RE.test(bodyLines[j])) {
      namesText += ' ' + bodyLines[j];
      j++;
    }
    const names = namesFromList(namesText);
    if (names.length !== declaredCount) {
      console.warn(`Vote name count mismatch (declared ${declaredCount}, parsed ${names.length}): ${compact(namesText).slice(0, 140)}`);
    }
    if (label === 'FOR') { sawForLine = true; names.forEach(name => forNamed.add(name)); }
    else if (label === 'OPPOSED') names.forEach(name => opposed.add(name));
    else if (label === 'ABSENT') names.forEach(name => absent.add(name));
    else if (label === 'CONFLICT') names.forEach(name => conflict.add(name));
    i = j - 1;
  }

  return {
    ...outcomeFromMatch(bodyLines[lastIdx].match(OUTCOME_LINE_RE)),
    forNamed: [...forNamed], opposed: [...opposed], absent: [...absent], conflict: [...conflict],
    // Some years name both sides explicitly ("FOR (4): ... OPPOSED (4):
    // ..."), and the two lists don't always add up to everyone present --
    // a member can go unmentioned on a specific vote without an explicit
    // Absent/Conflict tag. When that FOR line exists, it's the authoritative
    // yes-list, so anyone missing from every list is genuinely unaccounted
    // for rather than assumed YES (which is the right default when only
    // OPPOSED/Absent are ever named, the far more common era/format).
    forIsAuthoritative: sawForLine,
  };
}

function buildVotes(present, outcome) {
  const votes = {};
  for (const member of present) {
    votes[member] = outcome.absent.includes(member) ? 'ABSENT'
      : outcome.conflict.includes(member) ? 'CONFLICT'
      : outcome.opposed.includes(member) ? 'NO'
      : outcome.forNamed.includes(member) ? 'YES'
      : outcome.forIsAuthoritative ? 'NO_VOTE' : 'YES';
  }
  return votes;
}

function finalizeWithOutcome(item, outcome, date, committee, sourceUrl, meetingReference, present) {
  if (!outcome) return null;
  const title = compact(item.titleLines.join(' '));
  if (!title) return null;
  const bodyText = compact(item.bodyLines.join('\n'));
  const votes = buildVotes(present, outcome);
  const yesCount = Object.values(votes).filter(vote => vote === 'YES').length;
  const noCount = Object.values(votes).filter(vote => vote === 'NO').length;
  if (outcome.tally && (outcome.tally.yes !== yesCount || outcome.tally.no !== noCount)) {
    console.warn(`Tally mismatch for ${date} ${item.code} "${title}": parsed ${yesCount}-${noCount}, minutes say ${outcome.tally.yes}-${outcome.tally.no}`);
  }
  const locationCandidates = locationsFromTitle(title);
  return {
    // Scoped to the specific meeting, not just the date -- Committee of the
    // Whole and Council both use the same A-N lettering, and can both sit on
    // the same calendar day (Council follows COTW, or an evening Council
    // session runs alongside a daytime one), so date+code alone can collide.
    id: `${meetingReference}-${item.code}`,
    title, date, committee, status: outcome.status, votes, yesCount, noCount,
    topic: classifyVictoriaTopic(title),
    // The shared topic-classification pattern doesn't recognize these two
    // Victoria-specific procedural labels: some years give the "Consent
    // Agenda" container its own blanket vote (redundant with the individual
    // items' own votes right below it), and every meeting's agenda approval
    // is itself a real recorded vote worth keeping, just a routine one.
    administrative: isAdministrativeTitle(title) || /^(?:consent agenda|approval of agenda)$/i.test(title),
    sourceUrl, agendaUrl: null, meetingReference, motionNumber: item.code,
    ...(locationCandidates.length ? { locationCandidates } : {}),
    backgroundFiles: [{ label: `${committee} minutes`, url: sourceUrl }],
    body: `${bodyText}\n\nSource: ${sourceUrl}`,
  };
}

function finalizeItem(item, date, committee, sourceUrl, meetingReference, present) {
  const outcome = extractOutcome(item.bodyLines);
  return finalizeWithOutcome(item, outcome, date, committee, sourceUrl, meetingReference, present);
}

export function parseMotions(text, date, committee, sourceUrl, meetingReference) {
  // Every page break repeats a "<title ending in 'Minutes'> / <Month DD,
  // YYYY> / <page number>" footer/header trio mid-document (the title
  // varies -- "Committee of the Whole Meeting Minutes" in some years,
  // abbreviated to "COTW Meeting Minutes" in others) -- strip it so it
  // can't get swept into a title or body split across a page boundary.
  // Replacing with a blank line (not nothing) preserves the paragraph break
  // that would otherwise be there, which the heading-gating below depends on.
  const footerRe = /\n\s*[A-Za-z][A-Za-z .()'-]*\bMinutes\s*\n\s*[A-Za-z]+ \d{1,2}, \d{4}\s*\n\s*\d{1,3}\s*\n/g;
  // A page break can fall in the middle of a paragraph, leaving a bare
  // form-feed with no surrounding blank line at all -- collapsing it to a
  // blank line keeps the title/body split below (see "A blank line ends
  // the current item's title") working the same way regardless.
  const prepared = text.replace(/\xa0/g, ' ').replace(/\f/g, '\n\n').replace(footerRe, '\n\n').replace(/\n{3,}/g, '\n\n');
  // Indentation is the load-bearing signal below (see MAX_HEADING_INDENT)
  // that tells a genuine section heading (flush left, or lightly indented
  // under a nested code) apart from a deeply-indented lettered/roman-numeral
  // sub-bullet inside a long resolution's conditions list that would
  // otherwise look identical to one ("I." can even BE a lowercase roman
  // numeral "i." that a PDF's font rendered as uppercase). So indentation is
  // measured per raw line here, before per-line internal-space collapsing
  // (which would otherwise destroy it) produces the normalized line text
  // used for matching.
  const rawLines = prepared.split('\n');
  const present = parsePresentMembers(rawLines.map(l => l.replace(/[ \t]+/g, ' ')).join('\n'));
  const lines = rawLines.map(rawLine => ({
    indent: rawLine.length - rawLine.trimStart().length,
    text: rawLine.replace(/[ \t]+/g, ' ').trim(),
  }));
  const motions = [];

  let current = null;
  let consentQueue = null;
  // Top-level bare letters (no digit/lowercase suffix) only ever advance
  // through the document -- A, B, C, ... -- never repeating or going
  // backward. A resolution's own lettered recommendation sub-list ("A. ...
  // B. Direct staff to amend...") can otherwise pass every other check (it's
  // shallow enough, and it has a period), so this is the deciding signal for
  // bare letters specifically: reject one that doesn't advance past the
  // last section actually accepted.
  let lastTopLevelLetter = '';

  function flushCurrent() {
    if (!current) return;
    if (consentQueue) consentQueue.push(current);
    else {
      const motion = finalizeItem(current, date, committee, sourceUrl, meetingReference, present);
      if (motion) motions.push(motion);
    }
    current = null;
  }

  // Real section headings sit at a shallow indentation -- top-level letters
  // are flush left through most of a document but shift to ~9 spaces once a
  // closed-session sub-agenda starts, and nested codes ("F.1.a.c") run
  // 5-31 spaces deep across every sample seen (2021-2026, several distinct
  // minutes-formatting eras). A long resolution's own numbered/lettered
  // conditions list can coincidentally contain what LOOKS like a heading --
  // a run of bare letters as its own sub-list, or a lowercase roman numeral
  // "i." rendered by the source PDF's font as an indistinguishable
  // uppercase "I." -- but those sit far deeper (40+ spaces), so gating on
  // indentation alone filters them out without needing a blank-line
  // requirement too (blank-line-before-heading turned out to NOT hold
  // consistently across minutes-formatting eras: some years run a
  // section's first nested item on with no blank line at all).
  const MAX_HEADING_INDENT = 35;
  // Bare letters get a much tighter cap: real top-level sections sit at 0
  // (most of a document) or ~9 (once a closed-session sub-agenda starts),
  // while a "P. Carroll" staff-list entry ("Initial. Surname" in the
  // STAFF PRESENT block) or a resolution's own lettered sub-list ("A. ...
  // B. Direct staff to amend...") sit at 16-19+ -- shallow enough to clear
  // MAX_HEADING_INDENT, but well past any real bare-letter section.
  const MAX_BARE_LETTER_INDENT = 10;
  for (const { indent, text: line } of lines) {
    if (!line) {
      // A blank line ends the current item's title — everything after
      // belongs to its resolution/body text. Titles can wrap onto a second
      // physical line with no blank line between them (a heading that's
      // just long), so this only closes the title once a blank line has
      // actually been seen; BODY_START_RE below is a secondary net for the
      // rare case where body content starts with no blank-line separator at
      // all (e.g. a consent-agenda item's "That the minutes ... be
      // approved." runs straight on from the heading).
      if (current) current.titleDone = true;
      continue;
    }
    const candidate = indent <= MAX_HEADING_INDENT ? line.match(HEADING_RE) : null;
    const isBareLetter = candidate && !candidate[1].includes('.');
    const heading = candidate && (!isBareLetter
      ? true
      : indent <= MAX_BARE_LETTER_INDENT && (candidate[2] === '.' || firstWordAllCaps(candidate[3])) && candidate[1] > lastTopLevelLetter)
      ? candidate : null;
    if (heading) {
      if (isBareLetter) lastTopLevelLetter = heading[1];
      flushCurrent();
      current = { code: heading[1], titleLines: [heading[3]], bodyLines: [] };
      continue;
    }
    if (!current) continue;
    if (consentQueue && current && OUTCOME_LINE_RE.test(line)) {
      // Any FOR/OPPOSED/Absent lines naming how the shared vote actually
      // went sit between the last queued item's heading and this outcome
      // line -- they've been accumulating in `current.bodyLines` (nothing
      // queues `current` until flushCurrent below), so include them or a
      // contested consent-agenda vote silently looks unanimous.
      const outcome = extractOutcome([...current.bodyLines, line]);
      flushCurrent();
      for (const queued of consentQueue) {
        const motion = finalizeWithOutcome(queued, outcome, date, committee, sourceUrl, meetingReference, present);
        if (motion) motions.push(motion);
      }
      consentQueue = null;
      continue;
    }
    if (!consentQueue && /that the following consent agenda items?\s+be approved/i.test(line)) {
      // Everything from here to the shared outcome belongs to the listed
      // items, not to this "D. CONSENT AGENDA" container itself -- it never
      // has a vote of its own, so reset it to an empty placeholder (an
      // empty title makes finalize discard it) and start queuing.
      current = { code: current.code, titleLines: [], bodyLines: [] };
      consentQueue = [];
      continue;
    }
    if (!current.titleDone && current.bodyLines.length === 0 && !BODY_START_RE.test(line) && !/^That\b/i.test(line)) {
      current.titleLines.push(line);
    } else {
      current.titleDone = true;
      current.bodyLines.push(line);
    }
  }
  flushCurrent();
  return motions;
}

// ─── PDF + calendar fetch ─────────────────────────────────────────────────

function pdfText(buffer) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'motions-victoria-'));
  const pdfPath = path.join(tempDir, 'minutes.pdf');
  fs.writeFileSync(pdfPath, buffer);
  try { return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }); }
  finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
}

async function readPdf(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Victoria document returned HTTP ${response.status}: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.subarray(0, 4).toString() !== '%PDF') {
    console.warn(`Skipped non-PDF Victoria minutes document: ${url}`);
    return null;
  }
  return pdfText(buffer);
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
    if (!response.ok) throw new Error(`Victoria calendar returned HTTP ${response.status}`);
    const payload = await response.json();
    calendarMeetings.push(...(payload.d ?? []));
  }

  const motions = [];
  const meetings = [];
  const existingMotions = fs.existsSync(path.join(DATA_DIR, 'motions.json')) ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'motions.json'), 'utf8')) : [];
  const existingMeetings = fs.existsSync(path.join(DATA_DIR, 'meetings.json')) ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'meetings.json'), 'utf8')) : [];
  const existingById = new Map(existingMotions.map(motion => [motion.id, motion]));
  const fetchedMeetingIds = new Set();

  for (const item of [...new Map(calendarMeetings.map(meeting => [meeting.ID, meeting])).values()]) {
    const date = item.StartDate?.slice(0, 10).replaceAll('/', '-');
    if (!date || date < FROM_DATE || date > TO_DATE) continue;
    if (!DECISION_BODY_RE.test(item.MeetingType ?? '')) continue;
    const committee = item.MeetingType;
    const meetingId = item.ID;
    const meetingReference = `vic-${date}-${meetingId.slice(0, 8)}`;
    const detailUrl = `${CALENDAR_URL}/Meeting?Id=${meetingId}`;
    const documents = (item.MeetingDocumentLink ?? []).map(document => ({
      type: document.Type,
      label: compact(document.Title),
      href: new URL(document.Url, CALENDAR_URL).href,
    }));
    const minutesLink = documents.find(link => link.type === 'PostMinutes') ?? documents.find(link => /minutes/i.test(link.label));
    const agendaLink = documents.find(link => /agenda/i.test(link.label));
    const meeting = {
      date, startTime: item.StartDate.slice(11, 16).replace(':', ''), committee, meetingId,
      meetingNumber: meetingId, meetingReference, isCouncil: /^(?:Special\s+)?Council/i.test(committee),
      sourceUrl: detailUrl, agendaUrl: agendaLink?.href ?? null, agendaItems: [],
    };
    fetchedMeetingIds.add(meetingId);
    if (minutesLink) {
      const minutesText = await readPdf(minutesLink.href);
      for (const motion of minutesText ? parseMotions(minutesText, date, committee, minutesLink.href, meetingReference) : []) {
        const prior = existingById.get(motion.id);
        motions.push({
          ...prior, ...motion,
          summary: prior?.summary, keyAmounts: prior?.keyAmounts, amounts: prior?.amounts,
          locations: prior?.locations,
          locationCandidates: motion.locationCandidates ?? prior?.locationCandidates,
        });
        meeting.agendaItems.push({ reference: motion.id, title: motion.title, inCamera: false, url: motion.sourceUrl, motionId: motion.id });
      }
    }
    meetings.push(meeting);
    console.log(`Processed ${date} ${committee}: ${meeting.agendaItems.length} motions`);
  }

  // A handful of source documents genuinely restate the same lettered/nested
  // item elsewhere in the same meeting's minutes (observed rarely -- well
  // under 1% of motions) in a way this parser doesn't otherwise catch;
  // collapsing same-id duplicates from this run to the first occurrence is
  // a safety net so a duplicate motion id never reaches the published data,
  // whatever its root cause.
  const dedupedMotions = [...new Map(motions.map(motion => [motion.id, motion])).values()];
  const mergedMotions = [...existingMotions.filter(motion => !dedupedMotions.some(next => next.id === motion.id)), ...dedupedMotions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const mergedMeetings = [...existingMeetings.filter(meeting => !fetchedMeetingIds.has(meeting.meetingId)), ...meetings]
    .sort((a, b) => a.date.localeCompare(b.date) || a.committee.localeCompare(b.committee));
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'motions.json'), JSON.stringify(mergedMotions, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'meetings.json'), JSON.stringify(mergedMeetings, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'councillors.json'), JSON.stringify(COUNCIL_MEMBERS, null, 2));
  console.log(`Imported ${motions.length} Victoria motions across ${meetings.length} meetings (${mergedMotions.length} total motions).`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error.message); process.exitCode = 1; });
