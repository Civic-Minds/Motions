/**
 * fetch_meetings.js
 *
 * Downloads the Toronto Open Data meeting schedule CSV and writes
 * public/data/meetings.json with upcoming meetings for the next 90 days.
 *
 * Only includes committees relevant to the app — filters out purely
 * administrative bodies (licensing panels, property standards, etc.).
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
const LOOKAHEAD_DAYS = 90;

// Committees to include — everything else is filtered out
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
    const d = new Date(isoDate + 'T12:00:00'); // noon to avoid timezone shift
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function cleanLocation(raw) {
    // Strip video conference suffix for brevity
    return raw.replace(/\/Video Conference/i, '').replace(/,\s*$/, '').trim();
}

async function main() {
    console.log('📥 Downloading meeting schedule...');
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();

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

    // Sort by date then start time
    meetings.sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.startTime.localeCompare(b.startTime);
    });

    fs.writeFileSync(DATA_PATH, JSON.stringify(meetings, null, 2));

    const councilCount = meetings.filter(m => m.isCouncil).length;
    console.log(`\n✅ Written ${meetings.length} upcoming meetings to ${DATA_PATH}`);
    console.log(`   ${councilCount} City Council meeting(s) in the next ${LOOKAHEAD_DAYS} days`);
    console.log('\n📅 Next 5:');
    meetings.slice(0, 5).forEach(m => console.log(`   ${m.date} ${m.startTime} — ${m.committee}`));
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
