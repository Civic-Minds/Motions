/**
 * import_open_data.js
 *
 * Downloads the Toronto Open Data City Council voting record CSV and converts
 * it to the motions.json schema used by the frontend.
 *
 * Significance score (0–100) is computed per motion from five signals:
 *   1. Vote margin       — how contested was the vote?
 *   2. Outcome           — defeated/referred score higher than unanimous adopted
 *   3. Motion complexity — number of distinct motion types (amendments, referrals)
 *   4. Multi-day         — item spanned multiple meeting dates (deferred/recessed)
 *   5. Time spent        — gap to next item within the same meeting session
 *
 * trivial: true when score < 25 (replaces keyword-only boolean classifier)
 *
 * Usage:
 *   node scripts/import_open_data.js [--term=2022-2026]
 *
 * Terms: 2022-2026 (default), 2018-2022, 2014-2018, 2010-2014, 2006-2010
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/* global process */

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');

const TERM_URLS = {
    '2022-2026': 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/c4feb78c-c867-42a9-b803-7c6d859df969/download/member-voting-record-2022-2026.csv',
    '2018-2022': 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/373390e9-af88-4b58-a6a4-6863e3606a4b/download/member-voting-record-2018-2022.csv',
    '2014-2018': 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/11d89d61-24c3-4241-8194-04b22098745e/download/member-voting-record-2014-2018.csv',
    '2010-2014': 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/6c7dd98b-08d0-4f68-bee7-a0ba77a7da92/download/member-voting-record-2010-2014.csv',
    '2006-2010': 'https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/7f5232d6-0d2a-4f95-864a-417cbf341cc4/resource/01655cbd-dc66-4339-9f27-891e64413cbf/download/member-voting-record-2006-2010.csv',
};

// ---------------------------------------------------------------------------
// CSV parser
// ---------------------------------------------------------------------------

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
            headers.forEach((h, j) => obj[h.trim()] = values[j] || '');
            rows.push(obj);
        }
    }
    return rows;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

const TOPIC_KEYWORDS = {
    Housing:  [
        'housing', 'rental', 'tenant', 'shelter', 'demolition', 'affordable',
        'eviction', 'residential', 'zoning', 'official plan', 'secondary plan',
        'rentsafeto', 'renter', 'laneway', 'alterations to a', 'heritage',
        'community benefits charge', 'infill', 'inclusionary', 'rent-geared',
        'modular', 'encampment', 'supportive housing', 'development application',
    ],
    Transit:  [
        'ttc', 'transit', 'bus', 'lrt', 'subway', 'cycling', 'bike lane', 'bixi',
        'pedestrian', 'traffic', 'road', 'ontario line', 'eglinton', 'crosstown',
        'go train', 'go expansion', 'metrolinx', 'streetcar', 'fare', 'station',
        'speed enforcement', 'car-share', 'carshare', 'automated speed',
        'vision zero', 'active transportation', 'e-bike', 'micromobility',
    ],
    Finance:  [
        'budget', 'capital', 'operating', 'tax', 'levy', 'fee', 'financial',
        'revenue', 'expenditure', 'reserve fund', 'collective bargaining',
        'labour', 'sponsorship', 'procurement', 'contract ', 'grant', 'subsidy',
        'debenture', 'borrowing', 'insurance', 'assessment', 'variance report',
        'remuneration', 'compensation',
    ],
    Parks:    [
        'park', 'recreation', 'garden', 'trail', 'green space', 'tree canopy',
        'tree maintenance', 'urban forest', 'arena', 'community centre',
        'splash pad', 'ravine', 'waterfront', 'shoreline', 'conservation',
    ],
    Events:   [
        'festival', 'event ', 'celebration', 'permit', 'alcohol', 'liquor',
        'olympic', 'world cup', 'film', 'fireworks', 'closure of',
    ],
    Climate:  [
        'climate', 'net zero', 'transformto', 'heat relief', 'environment',
        'emissions', 'carbon', 'green building', 'energy retrofit', 'flood',
        'stormwater', 'resilience', 'sustainability', 'clean energy',
        'tree planting', 'urban heat', 'electrification',
    ],
};

const ROUTINE_KEYWORDS = [
    'by-law', 'confirmatory', 'order paper', 'declarations of interest',
    'minutes', 'routine', 'enactment', 'administrative', 'appointment',
    'ceremonial', 'petitions', 'call to order', 'nomination', 'recess',
    'in-camera', 'procedural', 'request for city solicitor to attend',
    'request for staff report', 'city solicitor to attend',
];

const WARD_KEYWORDS = {
    '1':  ['Etobicoke North', 'Rexdale', 'Thistletown'],
    '2':  ['Etobicoke Centre', 'Islington', 'Kingsway'],
    '3':  ['Etobicoke-Lakeshore', 'Mimico', 'Long Branch', 'Humber Bay'],
    '4':  ['Parkdale-High Park', 'Roncesvalles', 'Sunnyside'],
    '5':  ['York South-Weston', 'Mount Dennis', 'Weston'],
    '8':  ['Eglinton-Lawrence', 'Lawrence Park'],
    '9':  ['Davenport', 'Corso Italia'],
    '10': ['Spadina-Fort York', 'Front Street', 'Liberty Village', 'Harbourfront'],
    '11': ['University-Rosedale', 'Annex', 'Yorkville', 'Rosedale'],
    '12': ["Toronto-St. Paul's", 'Deer Park', 'Casa Loma'],
    '13': ['Toronto Centre', 'Dundas', 'Sherbourne', 'Cabbagetown', 'St. Lawrence', 'Regent Park'],
    '14': ['Toronto-Danforth', 'Leslieville', 'Riverdale', 'Greektown'],
    '15': ['Don Valley West', 'Redpath', 'Leaside', 'Thorncliffe Park'],
    '16': ['Don Valley East', 'Flemingdon Park'],
    '18': ['Willowdale', 'North York Centre'],
    '19': ['Beaches-East York', 'The Beach'],
    '23': ['Scarborough North', 'Milliken', 'Agincourt'],
    '25': ['Scarborough-Rouge Park', 'Rouge', 'Malvern'],
};

function classifyTopic(title) {
    const lower = title.toLowerCase();
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(k => lower.includes(k))) return topic;
    }
    return 'General';
}

function classifyWard(title) {
    for (const [w, keywords] of Object.entries(WARD_KEYWORDS)) {
        if (keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) return w;
    }
    return 'City';
}

function parseStatus(result) {
    if (!result) return 'Adopted';
    const lower = result.toLowerCase();
    if (lower.includes('carried') || lower.includes('adopted')) return 'Adopted';
    if (lower.includes('lost') || lower.includes('defeated') || lower.includes('failed')) return 'Defeated';
    if (lower.includes('referred')) return 'Referred';
    return 'Adopted';
}

function parseTimestamp(dateStr) {
    // "2022-11-23 15:17 PM" or "2022-11-23 09:05 AM"
    return new Date(dateStr.replace(/ [AP]M$/, ''));
}

function formatDate(dateStr) {
    const d = parseTimestamp(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatId(agendaItemNum) {
    const parts = agendaItemNum.split('.');
    if (parts.length >= 2 && /^\d{4}$/.test(parts[0])) return parts.slice(1).join('.');
    return agendaItemNum;
}

// ---------------------------------------------------------------------------
// Significance score
// ---------------------------------------------------------------------------

/**
 * Compute a 0–100 significance score from five observable signals.
 *
 * @param {object} votes         - { "Name": "YES"|"NO"|"ABSENT" }
 * @param {string} status        - "Adopted" | "Defeated" | "Referred"
 * @param {number} motionTypes   - count of distinct motion types voted on
 * @param {boolean} multiDay     - item spanned multiple calendar dates
 * @param {number|null} minutes  - estimated time spent (null if unknown)
 * @param {string} title         - motion title (for routine keyword check)
 */
function computeSignificance(votes, status, motionTypes, multiDay, minutes, title) {
    const vals = Object.values(votes);
    const yes = vals.filter(v => v === 'YES').length;
    const no  = vals.filter(v => v === 'NO').length;
    const total = yes + no;

    let score = 0;

    // 1. Vote margin (0–25 pts) — how contested?
    if (total >= 5) {
        const contestRatio = 1 - (Math.abs(yes - no) / total); // 1 = tied, 0 = unanimous
        score += Math.round(contestRatio * 25);
    }

    // 2. Outcome (0–20 pts)
    if (status === 'Defeated') score += 20;
    else if (status === 'Referred') score += 10;
    else if (no > 0) score += 5; // adopted but contested

    // 3. Motion complexity (0–20 pts) — amendments/referrals = more debate
    if (motionTypes >= 3) score += 20;
    else if (motionTypes === 2) score += 12;
    // 1 type = 0 pts

    // 4. Multi-day (0–15 pts) — deferred or recessed across meeting dates
    if (multiDay) score += 15;

    // 5. Time spent (0–20 pts)
    if (minutes !== null) {
        if (minutes >= 45) score += 20;
        else if (minutes >= 20) score += 14;
        else if (minutes >= 10) score += 8;
        else if (minutes >= 3) score += 3;
        // < 3 min = 0 pts
    }

    // Routine keyword penalty
    const lower = title.toLowerCase();
    if (ROUTINE_KEYWORDS.some(k => lower.includes(k))) score -= 25;

    return Math.max(0, Math.min(100, score));
}

function computeFlags(votes, status, score) {
    const flags = [];
    const vals = Object.values(votes);
    if (vals.length === 0) return flags;

    const yes = vals.filter(v => v === 'YES').length;
    const no  = vals.filter(v => v === 'NO').length;
    const total = yes + no;
    const margin = Math.abs(yes - no);

    if (score >= 25 && total >= 15 && margin <= 5) flags.push('close-vote');
    if (score >= 25 && status === 'Defeated') flags.push('defeated');
    if (score >= 25 && total >= 20 && no === 0) flags.push('unanimous');
    if (score >= 25 && status === 'Defeated' && yes <= 5 && total >= 15) flags.push('landslide-defeat');

    return flags;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const termArg = process.argv.find(a => a.startsWith('--term='))?.split('=')[1] || '2022-2026';
    const url = TERM_URLS[termArg];
    if (!url) {
        console.error(`Unknown term "${termArg}". Valid: ${Object.keys(TERM_URLS).join(', ')}`);
        process.exit(1);
    }

    console.log(`📥 Downloading voting records for ${termArg}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    const text = await response.text();

    console.log('🔍 Parsing CSV...');
    const rows = parseCSV(text);
    console.log(`   ${rows.length.toLocaleString()} vote records`);

    const councilRows = rows.filter(r => r['Committee'] === 'City Council');
    console.log(`   ${councilRows.length.toLocaleString()} City Council votes`);

    // -----------------------------------------------------------------------
    // Pass 1: Build item map with full signal data
    // -----------------------------------------------------------------------
    const itemMap = new Map();

    for (const row of councilRows) {
        const key = row['Agenda Item #'];
        if (!itemMap.has(key)) {
            itemMap.set(key, {
                meta: row,
                councillorVotes: new Map(),
                motionTypesSeen: new Set(),
                meetingDates: new Set(),
                timestamps: [],
            });
        }
        const entry = itemMap.get(key);

        // Prefer "Adopt Item" metadata for title/result/date
        const rowType = row['Motion Type'] || '';
        if (rowType === 'Adopt Item' && entry.meta['Motion Type'] !== 'Adopt Item') {
            entry.meta = row;
        }

        // Last vote per councillor wins (amendment → adoption sequence)
        const name = `${row['First Name']} ${row['Last Name']}`.trim();
        entry.councillorVotes.set(name, row['Vote']);

        // Track signal data
        entry.motionTypesSeen.add(rowType);
        const dateOnly = (row['Date/Time'] || '').split(' ')[0];
        if (dateOnly) entry.meetingDates.add(dateOnly);

        const ts = parseTimestamp(row['Date/Time']);
        if (!isNaN(ts.getTime())) entry.timestamps.push(ts);
    }

    console.log(`   ${itemMap.size.toLocaleString()} unique agenda items`);

    // -----------------------------------------------------------------------
    // Pass 2: Compute time-spent per item using within-session timestamp gaps
    // -----------------------------------------------------------------------
    // Group items by their earliest meeting date, sort by earliest timestamp,
    // then assign each item the gap to the next item (capped at 90 min).
    const byDate = new Map();
    for (const [key, entry] of itemMap) {
        const dates = [...entry.meetingDates].sort();
        const sessionDate = dates[0] || 'unknown';
        if (!byDate.has(sessionDate)) byDate.set(sessionDate, []);
        const earliestTs = entry.timestamps.length
            ? new Date(Math.min(...entry.timestamps.map(t => t.getTime())))
            : null;
        byDate.get(sessionDate).push({ key, earliestTs });
    }

    const timeSpentMap = new Map(); // key → minutes
    for (const items of byDate.values()) {
        const sorted = items
            .filter(i => i.earliestTs)
            .sort((a, b) => a.earliestTs - b.earliestTs);

        for (let i = 0; i < sorted.length; i++) {
            const next = sorted[i + 1];
            if (next) {
                const diffMs = next.earliestTs - sorted[i].earliestTs;
                const diffMin = diffMs / 60000;
                // Cap at 90 min to ignore session breaks / lunch
                timeSpentMap.set(sorted[i].key, Math.min(diffMin, 90));
            }
            // Last item of the day: no gap available
        }
    }

    // -----------------------------------------------------------------------
    // Pass 3: Build motion objects with significance scores
    // -----------------------------------------------------------------------
    const motions = [];

    for (const [itemNum, { meta, councillorVotes, motionTypesSeen, meetingDates }] of itemMap) {
        const title = (meta['Agenda Item Title'] || '').trim() || 'Untitled';

        const votes = {};
        for (const [name, vote] of councillorVotes) {
            if (vote === 'Yes') votes[name] = 'YES';
            else if (vote === 'No') votes[name] = 'NO';
            else if (vote === 'Absent') votes[name] = 'ABSENT';
        }

        const status   = parseStatus(meta['Result']);
        const multiDay = meetingDates.size > 1;
        const minutes  = timeSpentMap.get(itemNum) ?? null;

        const significance = computeSignificance(
            votes,
            status,
            motionTypesSeen.size,
            multiDay,
            minutes,
            title
        );

        const trivial = significance < 25;

        motions.push({
            id: formatId(itemNum),
            date: formatDate(meta['Date/Time']),
            title,
            mover: '',
            seconder: '',
            status,
            topic: classifyTopic(title),
            trivial,
            significance,
            ward: classifyWard(title),
            url: `https://secure.toronto.ca/council/agenda-item.do?item=${itemNum}`,
            votes,
            flags: computeFlags(votes, status, significance),
        });
    }

    // Sort newest first
    motions.sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(DATA_PATH, JSON.stringify(motions, null, 2));

    // Stats
    const trivialCount  = motions.filter(m => m.trivial).length;
    const adoptedCount  = motions.filter(m => m.status === 'Adopted').length;
    const scores        = motions.map(m => m.significance).sort((a, b) => a - b);
    const median        = scores[Math.floor(scores.length / 2)];
    const highSig       = motions.filter(m => m.significance >= 60).length;

    console.log(`\n✅ Written ${motions.length.toLocaleString()} motions to ${DATA_PATH}`);
    console.log(`   ${adoptedCount.toLocaleString()} adopted · ${(motions.length - adoptedCount).toLocaleString()} defeated/referred`);
    console.log(`   ${trivialCount.toLocaleString()} trivial (score < 25) · ${highSig.toLocaleString()} high-significance (score ≥ 60)`);
    console.log(`   Significance — median: ${median} · min: ${scores[0]} · max: ${scores[scores.length - 1]}`);
    console.log(`\n   Note: mover/seconder not in Open Data CSV.`);
    console.log(`         Run fetch_motions.js to enrich individual items from TMMIS.\n`);

    // Show top 10 most significant motions
    const top10 = [...motions].sort((a, b) => b.significance - a.significance).slice(0, 10);
    console.log('🔥 Top 10 by significance:');
    top10.forEach(m => console.log(`   [${m.significance}] ${m.date} — ${m.title.slice(0, 65)}`));
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
