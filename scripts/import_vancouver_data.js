/**
 * Import Vancouver's official council voting records into the Motions schema.
 *
 * Usage:
 *   node scripts/import_vancouver_data.js
 *   node scripts/import_vancouver_data.js --from=2022-11-01
 *
 * Generated files stay in public/data/vancouver, which is intentionally
 * ignored. Upload them to the Vancouver Blob namespace separately.
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

/* global process */

const API_BASE = 'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/council-voting-records/records';
const SOURCE_URL = 'https://opendata.vancouver.ca/explore/dataset/council-voting-records/';
const RECORD_URL = (meetingId, voteNumber) =>
    `https://opendata.vancouver.ca/explore/dataset/council-voting-records/table/?refine.meeting_id=${encodeURIComponent(meetingId)}&refine.vote_number=${encodeURIComponent(voteNumber)}`;
const MEETING_URL = meetingId =>
    `https://opendata.vancouver.ca/explore/dataset/council-voting-records/table/?refine.meeting_id=${encodeURIComponent(meetingId)}`;
const AGENDA_PREFIX = {
    Council: 'regu',
    'Policy & Strategic Priorities': 'pspc',
    'City Finance & Services': 'cfsc',
    'Public Hearing': 'phea',
    'Special Council': 'spec',
    'Auditor General Committee': 'agc',
};
const AGENDA_URL = (committee, date) => {
    const prefix = AGENDA_PREFIX[committee];
    if (!prefix || !date) return null;
    const compactDate = date.replaceAll('-', '');
    return `https://council.vancouver.ca/${compactDate}/${prefix}${compactDate}ag.htm`;
};
const DATA_DIR = path.join(process.cwd(), 'public/data/vancouver');
const PAGE_SIZE = 100;
const fromArg = process.argv.find(arg => arg.startsWith('--from='));
const fromDate = fromArg ? fromArg.slice('--from='.length) : '2022-11-01';

// The public voting dataset abbreviates member names. These are matched to the
// City's official current council roster so profiles and candidate links use
// stable, human-readable names.
const MEMBER_NAME_MAP = {
    'Mayor K Sim': 'Mayor Ken Sim',
    'Councillor R Bligh': 'Rebecca Bligh',
    'Councillor L Dominato': 'Lisa Dominato',
    'Councillor P Fry': 'Pete Fry',
    'Councillor S Kirby-Yung': 'Sarah Kirby-Yung',
    'Councillor M Klassen': 'Mike Klassen',
    'Councillor L Maloney': 'Lucy Maloney',
    'Councillor P Meiszner': 'Peter Meiszner',
    'Councillor B Montague': 'Brian Montague',
    'Councillor S Orr': 'Sean Orr',
    'Councillor L Zhou': 'Lenny Zhou',
};
const CURRENT_COUNCIL = [
    'Mayor Ken Sim', 'Rebecca Bligh', 'Lisa Dominato', 'Pete Fry',
    'Sarah Kirby-Yung', 'Mike Klassen', 'Lucy Maloney', 'Peter Meiszner',
    'Brian Montague', 'Sean Orr', 'Lenny Zhou',
];

const TOPIC_KEYWORDS = {
    Housing: ['housing', 'rental', 'tenant', 'shelter', 'zoning', 'rezoning', 'residential', 'homeless', 'affordable'],
    Transit: ['transit', 'bike', 'cycling', 'pedestrian', 'traffic', 'road', 'street', 'bus', 'transportation'],
    Finance: ['budget', 'tax', 'levy', 'fee', 'financial', 'revenue', 'grant', 'contract', 'procurement', 'capital plan'],
    Parks: ['park', 'recreation', 'garden', 'tree', 'playground', 'waterfront', 'shore'],
    Climate: ['climate', 'environment', 'emissions', 'carbon', 'energy', 'flood', 'resilience', 'sustainability'],
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
        'In Favour': 'YES',
        'In Opposition': 'NO',
        Absent: 'ABSENT',
        Abstain: 'ABSTAIN',
        'Declared Conflict': 'CONFLICT',
        'No Vote': 'NO_VOTE',
        Ineligible: 'INELIGIBLE',
    }[vote] ?? 'NO_VOTE';
}

function statusFromDecision(decision) {
    return decision?.toLowerCase().includes('lost') ? 'Lost' : 'Adopted';
}

// Vancouver's agenda descriptions include the meeting item label (for
// example "1." or "RR1."). Keep the source link/vote number, but present the
// motion title without that navigation-only prefix.
function cleanTitle(title) {
    return title.trim()
        .replace(/^(?:\d+[a-z]?[.)]|[A-Z]{1,8}\d+[a-z]?(?:[.)]|\s+))\s*/i, '')
        .trim();
}

function significanceFor(votes, decision, title) {
    const yes = Object.values(votes).filter(v => v === 'YES').length;
    const no = Object.values(votes).filter(v => v === 'NO').length;
    const total = yes + no;
    const contested = total > 0 ? Math.round((Math.min(yes, no) / total) * 30) : 0;
    const topicWeight = classifyTopic(title) === 'General' ? 10 : 25;
    const outcomeWeight = decision?.toLowerCase().includes('lost') ? 20 : 10;
    return Math.min(100, topicWeight + contested + outcomeWeight);
}

async function fetchPage(offset, startDate, endDate) {
    const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
        order_by: 'vote_date asc,meeting_id asc,vote_number asc',
        select: 'meeting_id,meeting_type,vote_date,vote_number,agenda_description,vote_start_date_time,council_member,vote,decision',
        where: `vote_date >= "${startDate}" AND vote_date < "${endDate}"`,
    });
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) throw new Error(`Vancouver voting API returned HTTP ${response.status}`);
    return response.json();
}

async function main() {
    const start = new Date(`${fromDate || '2016-01-01'}T00:00:00Z`);
    const end = new Date();
    end.setUTCDate(end.getUTCDate() + 1);
    const rows = [];

    for (let month = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); month < end; month.setUTCMonth(month.getUTCMonth() + 1)) {
        const nextMonth = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
        const startDate = month.toISOString().slice(0, 10);
        const endDate = nextMonth.toISOString().slice(0, 10);
        const first = await fetchPage(0, startDate, endDate);
        const total = first.total_count;
        rows.push(...first.results);
        for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
            const page = await fetchPage(offset, startDate, endDate);
            rows.push(...page.results);
        }
        process.stdout.write(`\rFetched ${rows.length.toLocaleString()} records through ${startDate.slice(0, 7)}`);
    }
    process.stdout.write('\n');

    const eventMap = new Map();
    for (const row of rows) {
        if (!row.meeting_id || !row.vote_number || !row.agenda_description || !row.vote_date) continue;
        if (fromDate && row.vote_date < fromDate) continue;
        const memberName = MEMBER_NAME_MAP[row.council_member] ?? row.council_member;

        const key = `${row.meeting_id}:${row.vote_number}`;
        const event = eventMap.get(key) ?? {
            id: `van-${row.meeting_id}-${row.vote_number}`,
            title: cleanTitle(row.agenda_description),
            date: row.vote_date,
            committee: row.meeting_type || 'Vancouver City Council',
            meetingId: row.meeting_id,
            meetingReference: `vancouver-${row.meeting_id}`,
            votes: {},
            decision: row.decision || '',
            sourceUrl: RECORD_URL(row.meeting_id, row.vote_number),
            agendaUrl: AGENDA_URL(row.meeting_type, row.vote_date),
        };
        event.votes[memberName] = normalizeVote(row.vote);
        if (row.decision) event.decision = row.decision;
        eventMap.set(key, event);
    }

    const motions = [...eventMap.values()].map(event => {
        const yesCount = Object.values(event.votes).filter(v => v === 'YES').length;
        const noCount = Object.values(event.votes).filter(v => v === 'NO').length;
        const significance = significanceFor(event.votes, event.decision, event.title);
        return {
            id: event.id,
            title: event.title,
            date: event.date,
            committee: event.committee,
            status: statusFromDecision(event.decision),
            votes: event.votes,
            yesCount,
            noCount,
            topic: classifyTopic(event.title),
            significance,
            trivial: significance < 25,
            sourceUrl: event.sourceUrl,
            agendaUrl: event.agendaUrl,
            meetingId: event.meetingId,
            meetingReference: event.meetingReference,
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
            isCouncil: motion.committee.toLowerCase().includes('council'),
            sourceUrl: MEETING_URL(motion.meetingId),
            agendaUrl: motion.agendaUrl,
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

    console.log(`Imported ${motions.length.toLocaleString()} Vancouver vote events from ${CURRENT_COUNCIL.length} current members across ${meetingsById.size} meetings.`);
    console.log(`Date range: ${motions[0]?.date ?? 'none'} → ${motions.at(-1)?.date ?? 'none'}`);
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
