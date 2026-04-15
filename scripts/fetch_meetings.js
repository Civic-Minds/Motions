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
const LOOKAHEAD_DAYS = 90;

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

// Committees to include from CSV
const INCLUDED_COMMITTEES = new Set([
    'City Council',
    'Executive Committee',
    'Planning and Housing Committee',
    'General Government Committee',
    'Infrastructure and Environment Committee',
    'Economic and Community Development Committee',
    'Budget Committee',
    'Board of Health',
    'Toronto Transit Commission',
    'Toronto and East York Community Council',
    'North York Community Council',
    'Etobicoke York Community Council',
    'Scarborough Community Council',
    'Toronto Preservation Board',
    'Audit Committee',
    'Civic Appointments Committee',
    'FIFA World Cup 2026 Subcommittee',
    'Service Excellence Committee',
]);

// TMMIS decisionBodyId for each included committee
// Source: secure.toronto.ca/council/api/multiple/decisionbody-list.json?termId=8
const DECISION_BODY_IDS = {
    'City Council':                              2462,
    'Executive Committee':                       2468,
    'Planning and Housing Committee':            2565,
    'General Government Committee':              2542,
    'Infrastructure and Environment Committee':  2566,
    'Economic and Community Development Committee': 2563,
    'Budget Committee':                          2562,
    'Board of Health':                           2564,
    'Toronto Transit Commission':                2944,
    'Toronto and East York Community Council':   2466,
    'North York Community Council':              2465,
    'Etobicoke York Community Council':          2464,
    'Scarborough Community Council':             2467,
    'Toronto Preservation Board':                2511,
    'Audit Committee':                           2582,
    'Civic Appointments Committee':              2583,
    'FIFA World Cup 2026 Subcommittee':          2904,
    'Service Excellence Committee':              2784,
};

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
        .filter(i => i.publishTypeCd === 'MAIN') // skip procedural/consent items
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
    console.log('📥 Downloading meeting schedule CSV...');
    const csvResponse = await fetch(CSV_URL);
    if (!csvResponse.ok) throw new Error(`HTTP ${csvResponse.status}`);
    const text = await csvResponse.text();

    const rows = parseCSV(text);
    console.log(`   ${rows.length.toLocaleString()} total meeting rows`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + LOOKAHEAD_DAYS);

    const meetings = [];

    for (const row of rows) {
        const committee = row['Committee'] || '';
        if (!INCLUDED_COMMITTEES.has(committee)) continue;

        const dateStr = row['Date'] || '';
        if (!dateStr) continue;

        const date = new Date(dateStr + 'T12:00:00');
        if (isNaN(date.getTime())) continue;
        if (date < today || date > cutoff) continue;

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

    // ── Enrich with TMMIS agenda items ───────────────────────────────────────

    console.log(`\n📋 Fetching agendas for ${meetings.length} upcoming meetings...`);

    for (const meeting of meetings) {
        const decisionBodyId = DECISION_BODY_IDS[meeting.committee];
        if (!decisionBodyId || !meeting.meetingNumber) continue;

        process.stdout.write(`   ${meeting.committee} #${meeting.meetingNumber}… `);
        try {
            const meta = await getMeetingMeta(decisionBodyId, meeting.meetingNumber);
            if (!meta) { console.log('no meetingId'); continue; }

            meeting.meetingId = meta.meetingId;
            meeting.meetingReference = meta.meetingReference;
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
    const councilCount = meetings.filter(m => m.isCouncil).length;
    console.log(`\n✅ Written ${meetings.length} upcoming meetings (${withAgenda} with agendas)`);
    console.log(`   ${councilCount} City Council meeting(s) in the next ${LOOKAHEAD_DAYS} days`);
    console.log('\n📅 Next 5:');
    meetings.slice(0, 5).forEach(m => console.log(`   ${m.date} — ${m.committee} (${m.agendaItems?.length ?? 0} agenda items)`));
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
