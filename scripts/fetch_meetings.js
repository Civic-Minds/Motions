/**
 * fetch_meetings.js
 *
 * Downloads the Toronto Open Data meeting schedule CSV and writes
 * public/data/meetings.json with upcoming meetings for the next 90 days.
 *
 * For each upcoming meeting, also fetches the published agenda from the
 * TMMIS API (secure.toronto.ca/council/api/) and stores agenda items.
 *
 * Usage:
 *   node scripts/fetch_meetings.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/* global process */

const DATA_PATH = path.join(process.cwd(), 'public/data/meetings.json');
const CSV_URL = 'https://ckan0.cf.opendata.inter.prod-toronto.ca/datastore/dump/08c8aedb-afba-41f5-830e-bbfb305ebbc7';
const TMMIS_BASE = 'https://secure.toronto.ca/council/api';
const LOOKAHEAD_DAYS = 180;
const LOOKBACK_DAYS  = 365;

// Headers needed to pass Akamai WAF (plain node-fetch won't work without these)
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-CA,en;q=0.9',
    'Referer': 'https://secure.toronto.ca/council/',
    'Origin': 'https://secure.toronto.ca',
    'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
};

// Term ID for current Council term (2022–2026)
const TERM_ID = 8;

// Fetches all decision bodies for the term and returns a name→id map.
// Names are normalised to lowercase for matching.
async function fetchDecisionBodyIds() {
    const res = await fetch(
        `${TMMIS_BASE}/multiple/decisionbody-list.json?termId=${TERM_ID}`,
        { headers: BROWSER_HEADERS }
    );
    if (!res.ok) throw new Error(`decision-body-list HTTP ${res.status}`);
    const data = await res.json();
    const map = {};
    (data?.Records ?? []).forEach(r => {
        if (r.decisionBodyName && r.decisionBodyId) {
            map[r.decisionBodyName.trim()] = r.decisionBodyId;
        }
    });
    console.log(`   Loaded ${Object.keys(map).length} TMMIS decision bodies`);
    return map;
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
            const obj = {};
            headers.forEach((h, j) => obj[h.trim()] = (values[j] || '').trim());
            rows.push(obj);
        }
    }
    return rows;
}

function formatDisplayDate(isoDate) {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function cleanLocation(raw) {
    return raw.replace(/\/Video Conference/i, '').replace(/,\s*$/, '').trim();
}

// ─── TMMIS agenda helpers ──────────────────────────────────────────────────────

async function tmmisGet(path) {
    const res = await fetch(`${TMMIS_BASE}${path}`, { headers: BROWSER_HEADERS });
    if (!res.ok) return null;
    return res.json();
}

// Returns { meetingId, meetingReference } for a given committee + meetingNumber, or null
async function getMeetingMeta(decisionBodyId, meetingNumber) {
    const data = await tmmisGet(`/multiple/meeting.json?decisionBodyId=${decisionBodyId}`);
    const match = data?.Records?.find(r => r.meetingNumber === meetingNumber);
    if (!match) return null;
    return { meetingId: match.meetingId, meetingReference: match.meetingReference };
}

// Returns agenda items for a meetingId, or []
async function getAgendaItems(meetingId) {
    const data = await tmmisGet(`/individual/meeting/${meetingId}.json`);
    const items = data?.Record?.sections?.flatMap(s => s.agendaItems ?? []) ?? [];

    return items
        .map(i => ({
            reference: `${i.nativeTermYear}.${i.referenceNumber}`,
            title: i.agendaItemTitle,
            wards: i.wards || null,
            inCamera: i.inCamera === 'Y',
            url: `https://secure.toronto.ca/council/agenda-item.do?item=${i.nativeTermYear}.${i.referenceNumber}`,
        }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    // ── Load existing data for merging ───────────────────────────────────────
    let existingByKey = {};
    if (fs.existsSync(DATA_PATH)) {
        try {
            const existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            existing.forEach(m => {
                // Key: meetingReference if we have it, else committee+date+meetingNumber
                const key = m.meetingReference ?? `${m.committee}|${m.date}|${m.meetingNumber}`;
                existingByKey[key] = m;
            });
            console.log(`📂 Loaded ${Object.keys(existingByKey).length} existing meetings to merge against`);
        } catch { /* ignore parse errors, start fresh */ }
    }

    // ── Decision bodies ───────────────────────────────────────────────────────
    console.log('\n🏛  Fetching TMMIS decision body list...');
    const decisionBodyIds = await fetchDecisionBodyIds();

    // ── CSV download ──────────────────────────────────────────────────────────
    console.log('\n📥 Downloading meeting schedule CSV...');
    const csvResponse = await fetch(CSV_URL);
    if (!csvResponse.ok) throw new Error(`HTTP ${csvResponse.status}`);
    const text = await csvResponse.text();

    const rows = parseCSV(text);
    console.log(`   ${rows.length.toLocaleString()} total meeting rows`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + LOOKAHEAD_DAYS);
    const earliest = new Date(today);
    earliest.setDate(earliest.getDate() - LOOKBACK_DAYS);

    const meetings = [];

    for (const row of rows) {
        const committee = row['Committee'] || '';
        // Include any committee that exists in TMMIS (covers all boards/committees)
        if (!committee) continue;

        const dateStr = row['Date'] || '';
        if (!dateStr) continue;

        const date = new Date(dateStr + 'T12:00:00');
        if (isNaN(date.getTime())) continue;
        if (date < earliest || date > cutoff) continue;

        meetings.push({
            committee,
            date: dateStr,
            displayDate: formatDisplayDate(dateStr),
            startTime: row['Start Time'] || '',
            endTime: row['End Time'] || '',
            location: cleanLocation(row['Location'] || ''),
            meetingNumber: parseInt(row['MTG #']) || null,
            isCouncil: committee === 'City Council',
        });
    }

    meetings.sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
    });

    // ── Enrich with TMMIS agenda items (skip if already fetched) ─────────────

    console.log(`\n📋 Fetching agendas for ${meetings.length} meetings (past ${LOOKBACK_DAYS}d → next ${LOOKAHEAD_DAYS}d)...`);

    for (const meeting of meetings) {
        const decisionBodyId = decisionBodyIds[meeting.committee];
        if (!decisionBodyId || !meeting.meetingNumber) continue;

        // Try to find an existing record we can reuse
        // (we don't have meetingReference yet, so key by committee+date+number)
        const tempKey = `${meeting.committee}|${meeting.date}|${meeting.meetingNumber}`;
        const prior = existingByKey[tempKey];

        // Carry forward existing agenda items for past meetings — no need to re-fetch
        if (prior?.agendaItems?.length > 0 && meeting.date < todayStr) {
            meeting.meetingId        = prior.meetingId;
            meeting.meetingReference = prior.meetingReference;
            meeting.agendaItems      = prior.agendaItems;
            process.stdout.write(`   ${meeting.committee} #${meeting.meetingNumber} [cached ${prior.agendaItems.length} items]\n`);
            continue;
        }

        process.stdout.write(`   ${meeting.committee} #${meeting.meetingNumber}… `);
        try {
            const meta = await getMeetingMeta(decisionBodyId, meeting.meetingNumber);
            if (!meta) { console.log('no meetingId'); continue; }

            meeting.meetingId = meta.meetingId;
            meeting.meetingReference = meta.meetingReference;

            // Also rekey the prior lookup now that we have the reference
            const refKey = meta.meetingReference;
            const refPrior = existingByKey[refKey];
            if (refPrior?.agendaItems?.length > 0 && meeting.date < todayStr) {
                meeting.agendaItems = refPrior.agendaItems;
                console.log(`[cached ${refPrior.agendaItems.length} items]`);
                continue;
            }

            const items = await getAgendaItems(meta.meetingId);
            meeting.agendaItems = items;
            console.log(`${items.length} items`);
        } catch (err) {
            console.log(`✗ ${err.message}`);
        }

        // Be polite
        await new Promise(r => setTimeout(r, 500));
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(meetings, null, 2));

    const withAgenda = meetings.filter(m => m.agendaItems?.length > 0).length;
    const upcomingCount = meetings.filter(m => m.date >= todayStr).length;
    const pastCount = meetings.length - upcomingCount;
    console.log(`\n✅ Written ${meetings.length} meetings (${pastCount} past, ${upcomingCount} upcoming, ${withAgenda} with agendas)`);
    console.log('\n📅 Next 5 upcoming:');
    meetings.filter(m => m.date >= todayStr).slice(0, 5)
      .forEach(m => console.log(`   ${m.date} — ${m.committee} (${m.agendaItems?.length ?? 0} agenda items)`));
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
