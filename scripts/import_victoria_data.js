/**
 * Import a bounded Victoria, BC sample from the City's public council voting
 * dashboard.
 *
 * The City publishes the records through a public Power BI report rather than
 * a downloadable table. We capture the report's public query contract, remove
 * its default "latest meeting" filter, and request a small sample for source
 * validation. This is deliberately not part of the refresh workflow yet.
 *
 * Usage:
 *   node scripts/import_victoria_data.js
 *   node scripts/import_victoria_data.js --meetings=20 --rows=2000
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { classifyByKeywords } from './lib/topicClassification.js';

/* global process */

const DASHBOARD_PAGE = 'https://opendata.victoria.ca/pages/mayor-and-council';
const QUERYDATA_URL = 'https://wabi-canada-central-api.analysis.windows.net/public/reports/querydata?synchronous=true';
const SOURCE_URL = 'https://opendata.victoria.ca/pages/mayor-and-council';
const DATA_DIR = path.join(process.cwd(), 'public/data/victoria');
const meetingsArg = process.argv.find(arg => arg.startsWith('--meetings='));
const rowsArg = process.argv.find(arg => arg.startsWith('--rows='));
const MEETING_LIMIT = Number(meetingsArg?.slice('--meetings='.length) || 20);
const ROW_LIMIT = Number(rowsArg?.slice('--rows='.length) || 2000);

const TOPIC_KEYWORDS = {
    Housing: ['housing', 'rental', 'tenant', 'shelter', 'zoning', 'rezoning', 'residential', 'homeless', 'affordable', 'heritage'],
    Transit: ['transit', 'bike', 'cycling', 'pedestrian', 'traffic', 'road', 'street', 'bus', 'transportation'],
    Finance: ['budget', 'tax', 'levy', 'fee', 'financial', 'revenue', 'grant', 'contract', 'procurement', 'capital plan'],
    Parks: ['park', 'recreation', 'garden', 'tree', 'playground', 'waterfront', 'shore'],
    Climate: ['climate', 'environment', 'emissions', 'carbon', 'energy', 'flood', 'resilience', 'sustainability'],
};

const VOTE_MAP = {
    'In Favour': 'YES',
    Opposed: 'NO',
    Absent: 'ABSENT',
    Conflict: 'CONFLICT',
    Leave: 'ABSENT',
    Resigned: 'ABSENT',
};

function classifyTopic(title) {
    return classifyByKeywords(title, TOPIC_KEYWORDS);
}

function stableId(value) {
    let hash = 2166136261;
    for (const character of value) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

function cleanTitle(value) {
    return String(value || '')
        .replace(/^\s*\d+[-–]\s*/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function formatDate(value) {
    return new Date(value).toISOString().slice(0, 10);
}

function decodeRows(data) {
    const block = data?.dsr?.DS?.[0];
    const rows = block?.PH?.[0]?.DM0 ?? [];
    const dictionaries = block?.ValueDicts ?? {};
    const dictionaryByColumn = { 1: 'D0', 2: 'D1', 3: 'D2', 4: 'D3' };
    let previous = [];

    return rows.map(row => {
        const values = [];
        let valueIndex = 0;
        const repeatMask = row.R || 0;
        const nullMask = row['Ø'] || 0;
        for (let column = 0; column < 5; column++) {
            if (nullMask & (1 << column)) {
                values[column] = null;
            } else if (repeatMask & (1 << column)) {
                values[column] = previous[column];
            } else {
                values[column] = row.C?.[valueIndex++];
                const dictionary = dictionaries[dictionaryByColumn[column]];
                if (dictionary && values[column] !== undefined && values[column] !== null) {
                    values[column] = dictionary[values[column]] ?? values[column];
                }
            }
        }
        previous = values;
        return {
            date: values[0] === null ? null : formatDate(values[0]),
            title: cleanTitle(values[1]),
            agendaUrl: values[2],
            councillor: values[3],
            vote: values[4],
        };
    }).filter(row => row.date && row.title && row.councillor && row.vote);
}

function buildQuery(body) {
    const query = JSON.parse(body);
    const command = query.queries[0].Query.Commands[0].SemanticQueryDataShapeCommand;
    const column = (source, property) => ({
        Column: { Expression: { SourceRef: { Source: source } }, Property: property },
        Name: `${source}.${property}`,
    });
    command.Query.From = [
        { Name: 'm', Entity: 'Meeting Information (just votes)', Type: 0 },
        { Name: 'd', Entity: 'Distinct mayor and council members', Type: 0 },
    ];
    command.Query.Select = [
        column('m', 'Meeting Date'),
        column('m', 'ResolutionPerMtgIndexWithAgendaForSorting'),
        column('m', 'URL for Agenda'),
        column('d', 'First Name Last Name'),
        column('m', 'Value'),
    ];
    command.Query.Where = [];
    command.Binding = {
        Primary: { Groupings: [{ Projections: [0, 1, 2, 3, 4] }] },
        DataReduction: { DataVolume: 6, Primary: { Window: { Count: ROW_LIMIT } } },
        Version: 1,
    };
    return query;
}

function makeOutput(rows) {
    const dates = [...new Set(rows.map(row => row.date))].sort().slice(-MEETING_LIMIT);
    const selected = rows.filter(row => dates.includes(row.date));
    const motionMap = new Map();

    for (const row of selected) {
        const key = `${row.date}|${row.title}|${row.agendaUrl}`;
        const motion = motionMap.get(key) ?? {
            id: `vic-${stableId(key)}`,
            title: row.title,
            date: row.date,
            committee: 'Victoria City Council',
            status: 'Recorded',
            votes: {},
            yesCount: 0,
            noCount: 0,
            topic: classifyTopic(row.title),
            significance: 25,
            trivial: false,
            sourceUrl: row.agendaUrl || SOURCE_URL,
            agendaUrl: row.agendaUrl || null,
            meetingId: `vic-${stableId(`${row.date}|${row.agendaUrl}`)}`,
            meetingReference: `victoria-${stableId(`${row.date}|${row.agendaUrl}`)}`,
        };
        const vote = VOTE_MAP[row.vote] ?? 'NO_VOTE';
        motion.votes[row.councillor] = vote;
        if (vote === 'YES') motion.yesCount++;
        if (vote === 'NO') motion.noCount++;
        motionMap.set(key, motion);
    }

    const motions = [...motionMap.values()].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    const meetings = [...new Map(motions.map(motion => [motion.meetingId, {
        committee: motion.committee,
        date: motion.date,
        displayDate: new Date(`${motion.date}T12:00:00Z`).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
        meetingId: motion.meetingId,
        meetingReference: motion.meetingReference,
        meetingNumber: motion.meetingId,
        isCouncil: true,
        sourceUrl: motion.agendaUrl || SOURCE_URL,
        agendaUrl: motion.agendaUrl || null,
        agendaItems: motions.filter(item => item.meetingId === motion.meetingId).map(item => ({ reference: item.id, title: item.title, inCamera: false, url: item.sourceUrl })),
    }])).values()].sort((a, b) => a.date.localeCompare(b.date));
    const councillors = [...new Set(motions.flatMap(motion => Object.keys(motion.votes)))].sort();
    const metadata = {
        city: 'Victoria',
        source: SOURCE_URL,
        sample: true,
        lastChecked: new Date().toISOString(),
        note: 'Bounded feasibility sample from the City of Victoria public Power BI voting dashboard; not ready for public jurisdiction registration.',
    };

    return { motions, meetings, councillors, metadata };
}

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let capturedRequest;
    page.on('request', request => {
        if (!capturedRequest && request.method() === 'POST' && request.url().includes('/querydata') && request.postData()?.includes('1d6bdaf206e10ad0a92e')) {
            capturedRequest = { body: request.postData(), headers: request.headers() };
        }
    });

    await page.goto(DASHBOARD_PAGE, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);
    if (!capturedRequest) throw new Error('Could not capture the Victoria dashboard query contract.');

    const result = await page.evaluate(async ({ body, headers, querydataUrl }) => {
        const requestHeaders = {};
        for (const key of ['content-type', 'x-powerbi-resourcekey', 'origin', 'referer']) {
            if (headers[key]) requestHeaders[key] = headers[key];
        }
        const response = await fetch(querydataUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(body),
        });
        return { status: response.status, payload: await response.json() };
    }, { body: buildQuery(capturedRequest.body), headers: capturedRequest.headers, querydataUrl: QUERYDATA_URL });
    await browser.close();
    if (result.status !== 200) throw new Error(`Victoria Power BI query returned HTTP ${result.status}`);

    const rows = decodeRows(result.payload.results?.[0]?.result?.data);
    const output = makeOutput(rows);
    if (!output.motions.length || !output.meetings.length) throw new Error('Victoria query returned no usable sample records.');
    fs.mkdirSync(DATA_DIR, { recursive: true });
    for (const [file, value] of Object.entries(output)) {
        fs.writeFileSync(path.join(DATA_DIR, `${file}.json`), JSON.stringify(value, null, 2));
    }
    console.log(`Imported ${output.motions.length} motions across ${output.meetings.length} meetings from ${output.councillors.length} observed councillors.`);
    console.log(`Date range: ${output.meetings[0].date} → ${output.meetings.at(-1).date}`);
    console.log('Status values are intentionally Recorded until official decision outcomes are mapped.');
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
