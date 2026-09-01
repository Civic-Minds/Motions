/**
 * Import Winnipeg's official council voting records into the Motions schema.
 *
 * Usage:
 *   node scripts/import_winnipeg_data.js
 *   node scripts/import_winnipeg_data.js --from=2022-11-01
 *
 * Source: City of Winnipeg Open Data (Socrata) — Council Voting Data
 * https://data.winnipeg.ca/Council-Services/Council-Voting-Data/f9mn-vti8
 *
 * Generated files stay in public/data/winnipeg, which is intentionally
 * ignored. Upload them to the Winnipeg Blob namespace separately.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/* global process */

const API_BASE = 'https://data.winnipeg.ca/resource/f9mn-vti8.json';
const SOURCE_URL = 'https://data.winnipeg.ca/Council-Services/Council-Voting-Data/f9mn-vti8';
const DMIS_URL = documentId => documentId ? `https://dmis.winnipeg.ca/ViewMeeting?documentId=${encodeURIComponent(documentId)}` : SOURCE_URL;
const DATA_DIR = path.join(process.cwd(), 'public/data/winnipeg');
const EXISTING_MOTIONS_PATH = path.join(DATA_DIR, 'motions.json');
const PAGE_SIZE = 1000;
const fromArg = process.argv.find(arg => arg.startsWith('--from='));
const fromDate = fromArg ? fromArg.slice('--from='.length) : '2022-11-01';

// The voting dataset only gives last names. Matched to the City's official
// current council roster (winnipeg.ca/city-governance/mayor-council/council-members)
// so profiles use full, stable names and the mayor is distinguishable.
const MEMBER_NAME_MAP = {
    Gillingham: 'Mayor Scott Gillingham',
    Mayes: 'Brian Mayes',
    Gilroy: 'Cindy Gilroy',
    Sharma: 'Devi Sharma',
    'Durand-Wood': 'Emma Durand-Wood',
    Duncan: 'Evan Duncan',
    Lukes: 'Janice Lukes',
    Browaty: 'Jeff Browaty',
    Orlikow: 'John Orlikow',
    Chambers: 'Markus Chambers',
    Allard: 'Matt Allard',
    Eadie: 'Ross Eadie',
    Wyatt: 'Russ Wyatt',
    Dobson: 'Shawn Dobson',
    Rollins: 'Sherri Rollins',
    Santos: 'Vivian Santos',
    // Elmwood–East Kildonan's councillor until his death on 2025-04-30;
    // Emma Durand-Wood won the resulting by-election.
    Schreyer: 'Jason Schreyer',
};
const CURRENT_COUNCIL = [
    'Mayor Scott Gillingham', 'Matt Allard', 'Jeff Browaty', 'Markus Chambers', 'Shawn Dobson',
    'Emma Durand-Wood', 'Evan Duncan', 'Ross Eadie', 'Cindy Gilroy', 'Janice Lukes', 'Brian Mayes',
    'John Orlikow', 'Sherri Rollins', 'Vivian Santos', 'Devi Sharma', 'Russ Wyatt',
];

const TOPIC_KEYWORDS = {
    Housing: ['housing', 'rental', 'tenant', 'shelter', 'zoning', 'rezoning', 'residential', 'homeless', 'affordable', 'subdivision'],
    Transit: ['transit', 'bike', 'cycling', 'pedestrian', 'traffic', 'road', 'street', 'bus', 'transportation'],
    Finance: ['budget', 'tax', 'levy', 'fee', 'financial', 'revenue', 'grant', 'contract', 'procurement', 'capital plan'],
    Parks: ['park', 'recreation', 'garden', 'tree', 'playground', 'waterfront', 'riverbank'],
    Climate: ['climate', 'environment', 'emissions', 'carbon', 'energy', 'flood', 'resilience', 'sustainability', 'waste'],
};

function classifyTopic(title) {
    const lower = title.toLowerCase();
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some(keyword => lower.includes(keyword))) return topic;
    }
    return 'General';
}

function normalizeVote(vote) {
    return {
        Yea: 'YES',
        Nay: 'NO',
        Absent: 'ABSENT',
        'Conflict Of Interest': 'CONFLICT',
    }[vote] ?? 'NO_VOTE';
}

function statusFromResult(result) {
    return result === 'Lost' ? 'Lost' : 'Adopted';
}

// Winnipeg's titles carry a leading item number ("1.\tTitle text") from the
// agenda export. Keep the source link, but present the title without it.
function cleanTitle(title) {
    return title.trim().replace(/^\d+[a-z]?[.)]\s*/i, '').trim();
}

function significanceFor(votes, result, title) {
    const yes = Object.values(votes).filter(v => v === 'YES').length;
    const no = Object.values(votes).filter(v => v === 'NO').length;
    const total = yes + no;
    const contested = total > 0 ? Math.round((Math.min(yes, no) / total) * 30) : 0;
    const topicWeight = classifyTopic(title) === 'General' ? 10 : 25;
    const outcomeWeight = result === 'Lost' ? 20 : 10;
    return Math.min(100, topicWeight + contested + outcomeWeight);
}

async function fetchPage(offset, startDate, endDate) {
    const params = new URLSearchParams({
        $limit: String(PAGE_SIZE),
        $offset: String(offset),
        $order: 'meeting_date asc, motion_id asc',
        $select: 'meeting_id,meeting_date,agenda_link,heading,title,committee_name,member,vote,result,motion_id,dmis_id',
        $where: `meeting_date >= "${startDate}" AND meeting_date < "${endDate}"`,
    });
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) throw new Error(`Winnipeg voting API returned HTTP ${response.status}`);
    return response.json();
}

async function main() {
    const start = new Date(`${fromDate || '2022-11-01'}T00:00:00Z`);
    const end = new Date();
    end.setUTCDate(end.getUTCDate() + 1);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);
    const rows = [];

    for (let offset = 0; ; offset += PAGE_SIZE) {
        const page = await fetchPage(offset, startDate, endDate);
        rows.push(...page);
        process.stdout.write(`\rFetched ${rows.length.toLocaleString()} rows`);
        if (page.length < PAGE_SIZE) break;
    }
    process.stdout.write('\n');

    const existingMotions = fs.existsSync(EXISTING_MOTIONS_PATH)
        ? JSON.parse(fs.readFileSync(EXISTING_MOTIONS_PATH, 'utf8'))
        : [];
    const existingLocations = new Map(existingMotions.map(motion => [motion.id, motion.locations]).filter(([, locations]) => locations?.length));

    const eventMap = new Map();
    for (const row of rows) {
        if (!row.motion_id || !row.title || !row.meeting_date || !row.member) continue;
        const memberName = MEMBER_NAME_MAP[row.member] ?? row.member;
        const date = row.meeting_date.slice(0, 10);

        const key = row.motion_id;
        const event = eventMap.get(key) ?? {
            id: `wpg-${row.motion_id}`,
            title: cleanTitle(row.title),
            date,
            committee: row.committee_name || 'Winnipeg City Council',
            meetingId: row.meeting_id,
            meetingReference: `winnipeg-${row.meeting_id}`,
            votes: {},
            result: row.result || '',
            sourceUrl: DMIS_URL(row.dmis_id),
        };
        event.votes[memberName] = normalizeVote(row.vote);
        if (row.result) event.result = row.result;
        eventMap.set(key, event);
    }

    const motions = [...eventMap.values()].map(event => {
        const yesCount = Object.values(event.votes).filter(v => v === 'YES').length;
        const noCount = Object.values(event.votes).filter(v => v === 'NO').length;
        const significance = significanceFor(event.votes, event.result, event.title);
        return {
            id: event.id,
            title: event.title,
            date: event.date,
            committee: event.committee,
            status: statusFromResult(event.result),
            votes: event.votes,
            yesCount,
            noCount,
            topic: classifyTopic(event.title),
            significance,
            trivial: significance < 25,
            sourceUrl: event.sourceUrl,
            meetingId: event.meetingId,
            meetingReference: event.meetingReference,
            ...(existingLocations.has(event.id) ? { locations: existingLocations.get(event.id) } : {}),
        };
    }).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

    const meetingsById = new Map();
    for (const motion of motions) {
        const meeting = meetingsById.get(motion.meetingId) ?? {
            committee: motion.committee,
            date: motion.date,
            displayDate: new Date(`${motion.date}T12:00:00`).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            meetingId: motion.meetingId,
            meetingReference: motion.meetingReference,
            meetingNumber: motion.meetingId,
            isCouncil: motion.committee.toLowerCase() === 'council',
            sourceUrl: motion.sourceUrl,
            agendaItems: [],
        };
        meeting.agendaItems.push({
            reference: motion.id,
            title: motion.title,
            inCamera: false,
            url: motion.sourceUrl,
        });
        meetingsById.set(motion.meetingId, meeting);
    }

    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, 'motions.json'), JSON.stringify(motions, null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'meetings.json'), JSON.stringify([...meetingsById.values()], null, 2));
    fs.writeFileSync(path.join(DATA_DIR, 'councillors.json'), JSON.stringify(CURRENT_COUNCIL, null, 2));

    console.log(`Imported ${motions.length.toLocaleString()} Winnipeg vote events from ${CURRENT_COUNCIL.length} current members across ${meetingsById.size} meetings.`);
    console.log(`Date range: ${motions[0]?.date ?? 'none'} → ${motions.at(-1)?.date ?? 'none'}`);
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
