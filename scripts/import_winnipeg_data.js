/**
 * Import Winnipeg's official Council Voting Data Socrata dataset.
 *
 * The City began recording votes in this system on 2020-09-21. Each source
 * row is one member's vote; this importer groups those rows into one Motions
 * record per motion and preserves the City's vote/result fields.
 *
 * Usage:
 *   node scripts/import_winnipeg_data.js
 *   node scripts/import_winnipeg_data.js --from=2022-01-01
 */

import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';
import { classifyWinnipegTopic } from './lib/winnipegClassification.js';
import { isAdministrativeTitle } from './lib/topicClassification.js';
import { normalizeWinnipegTitle } from './lib/winnipegTitle.js';
import { locationsFromWinnipegTitle } from './lib/winnipegGeocoding.js';

/* global process */

export const DATASET_URL = 'https://data.winnipeg.ca/resource/f9mn-vti8.json';
export const SOURCE_URL = 'https://data.winnipeg.ca/Council-Services/Council-Voting-Data/f9mn-vti8';
export const COUNCIL_URL = 'https://www.winnipeg.ca/city-governance/mayor-council/council-members';
const DATA_DIR = path.join(process.cwd(), 'public/data/winnipeg');
const PAGE_SIZE = 5000;
const fromArg = process.argv.find(arg => arg.startsWith('--from='));
const FROM_DATE = fromArg?.slice('--from='.length) ?? '2020-09-21';

// The dataset stores surnames. Keep the published roster readable while
// retaining a surname fallback for historical members not on today's page.
const MEMBER_NAMES = {
    Mayes: 'Brian Mayes', Gilroy: 'Cindy Gilroy', Sharma: 'Devi Sharma',
    'Durand-Wood': 'Emma Durand-Wood', Duncan: 'Evan Duncan', Lukes: 'Janice Lukes',
    Browaty: 'Jeff Browaty', Orlikow: 'John Orlikow', Chambers: 'Markus Chambers',
    Allard: 'Matt Allard', Eadie: 'Ross Eadie', Wyatt: 'Russ Wyatt',
    Dobson: 'Shawn Dobson', Rollins: 'Sherri Rollins', Santos: 'Vivian Santos',
    Gillingham: 'Scott Gillingham', Bowman: 'Brian Bowman',
};

export const CURRENT_COUNCIL = [
    'Scott Gillingham', 'Brian Mayes', 'Cindy Gilroy', 'Devi Sharma',
    'Emma Durand-Wood', 'Evan Duncan', 'Janice Lukes', 'Jeff Browaty',
    'John Orlikow', 'Markus Chambers', 'Matt Allard', 'Ross Eadie',
    'Russ Wyatt', 'Shawn Dobson', 'Sherri Rollins', 'Vivian Santos',
].map(name => ({ name, current: true }));

function buildCouncil(rows) {
    const currentNames = new Set(CURRENT_COUNCIL.map(member => member.name));
    const historicalNames = [...new Set(rows.map(row => memberName(row.member)))]
        .filter(name => !currentNames.has(name))
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({ name, current: false }));
    return [...CURRENT_COUNCIL, ...historicalNames];
}

function memberName(value) {
    const surname = String(value ?? '').trim();
    return MEMBER_NAMES[surname] ?? `Councillor ${surname}`;
}

function normalizeVote(value) {
    return {
        Yea: 'YES',
        Nay: 'NO',
        Absent: 'ABSENT',
        'Conflict Of Interest': 'CONFLICT',
    }[value] ?? 'NO_VOTE';
}

async function fetchRows() {
    const rows = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
        const url = new URL(DATASET_URL);
        url.searchParams.set('$limit', String(PAGE_SIZE));
        url.searchParams.set('$offset', String(offset));
        url.searchParams.set('$order', 'meeting_date ASC, motion_id ASC, vote_id ASC');
        url.searchParams.set('$where', `meeting_date >= '${FROM_DATE}'`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Winnipeg voting API returned HTTP ${response.status}`);
        const page = await response.json();
        rows.push(...page);
        process.stdout.write(`\rFetched ${rows.length.toLocaleString()} Winnipeg vote rows`);
        if (page.length < PAGE_SIZE) break;
    }
    process.stdout.write('\n');
    return rows;
}

export function groupRows(rows) {
    const groups = new Map();
    for (const row of rows) {
        if (!row.meeting_id || !row.motion_id || !row.meeting_date || !row.member) continue;
        const key = String(row.motion_id);
        const normalizedTitle = normalizeWinnipegTitle(row.title || row.heading || `Motion ${row.motion_id}`, row.motion_id);
        const group = groups.get(key) ?? {
            id: `wpg-${row.motion_id}`,
            sourceTitle: normalizedTitle.sourceTitle,
            title: normalizedTitle.title,
            date: row.meeting_date.slice(0, 10),
            committee: row.committee_name || row.committee || 'Winnipeg City Council',
            meetingId: row.meeting_id,
            meetingReference: `winnipeg-${row.meeting_id}`,
            motionNumber: row.motion_number,
            votes: {},
            result: row.result || '',
            sourceUrl: row.agenda_link || SOURCE_URL,
            agendaUrl: row.agenda_link || null,
            voteDescription: row.vote_description || '',
        };
        group.votes[memberName(row.member)] = normalizeVote(row.vote);
        if (row.result) group.result = row.result;
        groups.set(key, group);
    }

    return [...groups.values()].map(group => {
        const yesCount = Object.values(group.votes).filter(vote => vote === 'YES').length;
        const noCount = Object.values(group.votes).filter(vote => vote === 'NO').length;
        const status = /lost|defeated/i.test(group.result) ? 'Not adopted' : 'Adopted';
        const administrative = isAdministrativeTitle(group.title);
        return {
            id: group.id,
            title: group.title,
            date: group.date,
            committee: group.committee,
            status,
            sourceTitle: group.sourceTitle,
            votes: group.votes,
            yesCount,
            noCount,
            topic: classifyWinnipegTopic(group.title),
            administrative,
            sourceUrl: group.sourceUrl,
            agendaUrl: group.agendaUrl,
            meetingId: group.meetingId,
            meetingReference: group.meetingReference,
            motionNumber: group.motionNumber,
            voteDescription: group.voteDescription,
            ...(locationsFromWinnipegTitle(group.title).length
                ? { locationCandidates: locationsFromWinnipegTitle(group.title) }
                : {}),
        };
    }).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

function buildMeetings(motions) {
    const meetings = new Map();
    for (const motion of motions) {
        const meeting = meetings.get(motion.meetingId) ?? {
            committee: motion.committee,
            date: motion.date,
            displayDate: new Date(`${motion.date}T12:00:00`).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            meetingId: motion.meetingId,
            meetingReference: motion.meetingReference,
            meetingNumber: motion.meetingId,
            isCouncil: /council/i.test(motion.committee),
            sourceUrl: motion.sourceUrl,
            agendaUrl: motion.agendaUrl,
            agendaItems: [],
        };
        meeting.agendaItems.push({ reference: motion.id, title: motion.title, inCamera: false, url: motion.sourceUrl, motionId: motion.id });
        meetings.set(motion.meetingId, meeting);
    }
    return [...meetings.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function main() {
    const rows = await fetchRows();
    const motions = groupRows(rows);
    const meetings = buildMeetings(motions);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, 'motions.json'), `${JSON.stringify(motions, null, 2)}\n`);
    fs.writeFileSync(path.join(DATA_DIR, 'meetings.json'), `${JSON.stringify(meetings, null, 2)}\n`);
    fs.writeFileSync(path.join(DATA_DIR, 'councillors.json'), `${JSON.stringify(buildCouncil(rows), null, 2)}\n`);
    fs.writeFileSync(path.join(DATA_DIR, 'metadata.json'), `${JSON.stringify({ lastChecked: new Date().toISOString(), source: SOURCE_URL }, null, 2)}\n`);
    console.log(`Imported ${motions.length.toLocaleString()} Winnipeg motions across ${meetings.length} meetings.`);
    console.log(`Date range: ${motions[0]?.date ?? 'none'} → ${motions.at(-1)?.date ?? 'none'}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch(error => { console.error(error); process.exitCode = 1; });
