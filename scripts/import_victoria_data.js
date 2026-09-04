/**
 * Import Victoria, BC council votes from the City's public voting dashboard
 * and mechanically read outcomes from official meeting minutes.
 *
 * The City publishes the records through a public Power BI report rather than
 * a downloadable table. We capture the report's public query contract, remove
 * its default "latest meeting" filter. No AI enrichment or generated text is
 * used; records without a confirmed outcome remain Recorded.
 *
 * Usage:
 *   node scripts/import_victoria_data.js
 *   node scripts/import_victoria_data.js --from=2022-11-01 --meetings=1000 --rows=10000
 */

import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { classifyByKeywords } from './lib/topicClassification.js';

/* global process, Buffer */

const DASHBOARD_PAGE = 'https://opendata.victoria.ca/pages/mayor-and-council';
const QUERYDATA_URL = 'https://wabi-canada-central-api.analysis.windows.net/public/reports/querydata?synchronous=true';
const SOURCE_URL = 'https://opendata.victoria.ca/pages/mayor-and-council';
const DATA_DIR = path.join(process.cwd(), 'public/data/victoria');
const meetingsArg = process.argv.find(arg => arg.startsWith('--meetings='));
const rowsArg = process.argv.find(arg => arg.startsWith('--rows='));
const fromArg = process.argv.find(arg => arg.startsWith('--from='));
const MEETING_LIMIT = Number(meetingsArg?.slice('--meetings='.length) || 20);
const ROW_LIMIT = Number(rowsArg?.slice('--rows='.length) || 10000);
const FROM_DATE = fromArg?.slice('--from='.length) || '2022-11-01';

const VOTE_MAP = {
    'In Favour': 'YES',
    Opposed: 'NO',
    Absent: 'ABSENT',
    Conflict: 'CONFLICT',
    Leave: 'ABSENT',
    Resigned: 'ABSENT',
};

const TOPIC_KEYWORDS = {
    Housing: ['housing', 'rental', 'tenant', 'shelter', 'zoning', 'rezoning', 'residential', 'homeless', 'affordable', 'development permit', 'official community plan'],
    Transit: ['transit', 'bike', 'cycling', 'pedestrian', 'traffic', 'road', 'street', 'bus', 'transportation', 'parking'],
    Finance: ['budget', 'tax', 'levy', 'fee', 'financial', 'revenue', 'grant', 'contract', 'procurement', 'capital', 'borrowing', 'funding'],
    Parks: ['park', 'recreation', 'garden', 'tree', 'playground', 'waterfront', 'shore', 'arena', 'community centre'],
    Climate: ['climate', 'environment', 'emissions', 'carbon', 'energy', 'flood', 'resilience', 'sustainability', 'disaster', 'weather'],
    Events: ['festival', 'event', 'celebration', 'permit', 'liquor', 'fireworks'],
};

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

function pdfText(buffer) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'motions-victoria-'));
    const pdfPath = path.join(tempDir, 'minutes.pdf');
    fs.writeFileSync(pdfPath, buffer);
    try {
        return execFileSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' });
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

function compact(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function locationsFromTitle(title) {
    const matches = title.match(/\b\d{1,5}(?:\s*(?:and|&)\s*\d{1,5})?\s+[A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*){0,3}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy)\b/gi) ?? [];
    return [...new Set(matches.map(address => ({ address: compact(address) })))] ;
}

export function outcomeFromMinutes(text, title) {
    const normalized = String(text || '').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ');
    const words = compact(title).split(/\s+/).filter(word => word.length > 3).slice(0, 6);
    const escaped = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const anchor = escaped.length >= 3 ? new RegExp(escaped.join('[\\s\\S]{0,24}'), 'i') : null;
    const start = anchor?.exec(normalized)?.index ?? -1;
    const block = start >= 0 ? normalized.slice(start, start + 5000) : normalized;
    const match = block.match(/\b(CARRIED|ADOPTED|DEFEATED|LOST|REFERRED|DEFERRED)\b(?:\s+(?:UNANIMOUSLY|AS AMENDED))?/i);
    if (!match) return { status: 'Recorded', resultText: null };
    const word = match[1].toUpperCase();
    return {
        status: ['CARRIED', 'ADOPTED'].includes(word) ? 'Adopted'
            : ['DEFEATED', 'LOST'].includes(word) ? 'Lost'
                : ['REFERRED', 'DEFERRED'].includes(word) ? 'Referred' : 'Recorded',
        resultText: compact(match[0]),
    };
}

function minutesLink(html, pageUrl) {
    const $ = cheerio.load(html);
    return $('a[href]').map((_, element) => ({
        label: compact($(element).text()),
        title: compact($(element).attr('data-original-title')),
        href: new URL($(element).attr('href'), pageUrl).href,
    })).get().find(link => link.href.startsWith('http') && /minutes|post[- ]meeting/i.test(`${link.label} ${link.title} ${link.href}`)) ?? null;
}

async function enrichOutcomes(motions) {
    const byAgenda = new Map();
    for (const motion of motions) {
        if (!byAgenda.has(motion.agendaUrl)) byAgenda.set(motion.agendaUrl, []);
        byAgenda.get(motion.agendaUrl).push(motion);
    }
    for (const [agendaUrl, agendaMotions] of byAgenda) {
        if (!agendaUrl) continue;
        try {
            const agendaResponse = await fetch(agendaUrl);
            if (!agendaResponse.ok) throw new Error(`agenda HTTP ${agendaResponse.status}`);
            const link = minutesLink(await agendaResponse.text(), agendaUrl);
            if (!link) continue;
            const minutesResponse = await fetch(link.href);
            if (!minutesResponse.ok) throw new Error(`minutes HTTP ${minutesResponse.status}`);
            const text = pdfText(Buffer.from(await minutesResponse.arrayBuffer()));
            for (const motion of agendaMotions) {
                const outcome = outcomeFromMinutes(text, motion.title);
                motion.status = outcome.status;
                motion.resultText = outcome.resultText;
                motion.decisionSourceUrl = link.href;
            }
        } catch (error) {
            console.warn(`Could not read minutes for ${agendaUrl}: ${error.message}`);
        }
    }
    return motions;
}

async function makeOutput(rows, sourceLastRefreshed) {
    const dates = [...new Set(rows.map(row => row.date).filter(date => date >= FROM_DATE))].sort().slice(-MEETING_LIMIT);
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
            significance: 0,
            trivial: true,
            sourceUrl: row.agendaUrl || SOURCE_URL,
            agendaUrl: row.agendaUrl || null,
            meetingId: `vic-${stableId(`${row.date}|${row.agendaUrl}`)}`,
            meetingReference: `victoria-${stableId(`${row.date}|${row.agendaUrl}`)}`,
            topic: classifyByKeywords(row.title, TOPIC_KEYWORDS),
        };
        const vote = VOTE_MAP[row.vote] ?? 'NO_VOTE';
        motion.votes[row.councillor] = vote;
        if (vote === 'YES') motion.yesCount++;
        if (vote === 'NO') motion.noCount++;
        motionMap.set(key, motion);
    }

    const motions = [...motionMap.values()].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    await enrichOutcomes(motions);
    for (const motion of motions) {
        const locations = locationsFromTitle(motion.title);
        if (locations.length) motion.locationCandidates = locations.map(location => location.address);
        motion.backgroundFiles = [
            motion.agendaUrl && { label: 'Council agenda', url: motion.agendaUrl },
            motion.decisionSourceUrl && { label: 'Council minutes', url: motion.decisionSourceUrl },
        ].filter(Boolean);
    }
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
        sample: MEETING_LIMIT < 1000,
        fromDate: FROM_DATE,
        sourceLastRefreshed,
        lastChecked: new Date().toISOString(),
        note: 'Source-only Victoria council vote records. Titles, votes, meeting links, and outcomes come from official City records; unconfirmed outcomes remain Recorded.',
    };

    return { motions, meetings, councillors, metadata };
}

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    let capturedRequest;
    let sourceLastRefreshed;
    page.on('response', async response => {
        if (!sourceLastRefreshed && response.url().includes('modelsAndExploration')) {
            const model = await response.json();
            sourceLastRefreshed = model.models?.['0']?.LastRefreshTime ?? null;
        }
    });
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
    const output = await makeOutput(rows, sourceLastRefreshed);
    if (!output.motions.length || !output.meetings.length) throw new Error('Victoria query returned no usable sample records.');
    fs.mkdirSync(DATA_DIR, { recursive: true });
    for (const [file, value] of Object.entries(output)) {
        fs.writeFileSync(path.join(DATA_DIR, `${file}.json`), JSON.stringify(value, null, 2));
    }
    console.log(`Imported ${output.motions.length} motions across ${output.meetings.length} meetings from ${output.councillors.length} observed councillors.`);
    console.log(`Date range: ${output.meetings[0].date} → ${output.meetings.at(-1).date}`);
    console.log(`Dashboard last refreshed: ${sourceLastRefreshed ?? 'unknown'}`);
    console.log(`Outcome statuses mapped from official minutes where available; ${output.motions.filter(motion => motion.status === 'Recorded').length} remain Recorded.`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
