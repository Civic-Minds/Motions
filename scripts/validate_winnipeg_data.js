/** Validate Winnipeg's generated data before it can be published. */

import fs from 'node:fs';
import path from 'node:path';
import { findWinnipegTitleIssues } from './lib/winnipegTitle.js';

/* global process */

const DATA_DIR = path.join(process.cwd(), 'public/data/winnipeg');
const motions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'motions.json'), 'utf8'));
const meetings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'meetings.json'), 'utf8'));
const councillors = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'councillors.json'), 'utf8'));
const metadata = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'metadata.json'), 'utf8'));
const validVotes = new Set(['YES', 'NO', 'ABSENT', 'CONFLICT', 'ABSTAIN', 'NO_VOTE']);
const validStatuses = new Set(['Adopted', 'Not adopted']);
const validTopics = new Set(['Housing', 'Transit', 'Finance', 'Planning & Development', 'Parks', 'Climate', 'Governance', 'Public Safety', 'General']);
const councilNames = new Set(councillors.map(member => member.name));
const errors = [];
const ids = new Set();
const meetingIds = new Set(meetings.map(meeting => String(meeting.meetingId)));

if (!motions.length) errors.push('no motions imported');
if (!meetings.length) errors.push('no meetings imported');
if (councillors.filter(member => member.current !== false).length < 1) errors.push('no current councillors');
if (!metadata.lastChecked) errors.push('metadata.lastChecked missing');

for (const motion of motions) {
    if (ids.has(motion.id)) errors.push(`duplicate motion id: ${motion.id}`);
    ids.add(motion.id);
    if (!motion.id || !/^wpg-[\w.-]+$/.test(motion.id)) errors.push(`invalid motion id: ${motion.id}`);
    if (!motion.title || !motion.date || !/^\d{4}-\d{2}-\d{2}$/.test(motion.date)) errors.push(`invalid title/date: ${motion.id}`);
    const titleIssues = findWinnipegTitleIssues(motion.sourceTitle ?? motion.title, motion.title).filter(issue => issue !== 'leading-number');
    if (titleIssues.length) errors.push(`title requires repair: ${motion.id} (${titleIssues.join(', ')})`);
    if (!validStatuses.has(motion.status)) errors.push(`invalid status ${motion.status}: ${motion.id}`);
    if (!validTopics.has(motion.topic)) errors.push(`invalid topic ${motion.topic}: ${motion.id}`);
    if (!motion.sourceUrl?.startsWith('https://')) errors.push(`missing source URL: ${motion.id}`);
    if (!meetingIds.has(String(motion.meetingId))) errors.push(`missing meeting: ${motion.id}`);
    const votes = Object.entries(motion.votes ?? {});
    if (!votes.length) errors.push(`missing votes: ${motion.id}`);
    for (const [member, vote] of votes) {
        if (!councilNames.has(member)) errors.push(`unknown councillor ${member}: ${motion.id}`);
        if (!validVotes.has(vote)) errors.push(`invalid vote ${vote}: ${motion.id}`);
    }
    const yesCount = votes.filter(([, vote]) => vote === 'YES').length;
    const noCount = votes.filter(([, vote]) => vote === 'NO').length;
    if (motion.yesCount !== yesCount || motion.noCount !== noCount) errors.push(`vote totals do not reconcile: ${motion.id}`);
    for (const candidate of motion.locationCandidates ?? []) {
        if (typeof candidate !== 'string' || !candidate.trim()) errors.push(`invalid location candidate: ${motion.id}`);
    }
    for (const location of motion.locations ?? []) {
        if (!location.address || !Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lng))) errors.push(`invalid location: ${motion.id}`);
    }
}

for (const meeting of meetings) {
    if (!meeting.meetingId || !meeting.date || !meeting.meetingReference || !meeting.sourceUrl) errors.push(`invalid meeting: ${meeting.meetingId}`);
}

const latestDate = motions.map(motion => motion.date).sort().at(-1);
const maxAgeDays = Number(process.env.WINNIPEG_MAX_SOURCE_AGE_DAYS ?? 120);
const ageDays = Math.floor((Date.now() - new Date(`${latestDate}T23:59:59Z`).getTime()) / 86400000);
if (!latestDate || ageDays > maxAgeDays) errors.push(`source is stale: latest ${latestDate}, ${ageDays} days old (maximum ${maxAgeDays})`);

if (errors.length) {
    console.error(`Winnipeg validation failed with ${errors.length} error(s):`);
    errors.slice(0, 40).forEach(error => console.error(`- ${error}`));
    if (errors.length > 40) console.error(`- ...and ${errors.length - 40} more`);
    process.exitCode = 1;
} else {
    console.log(`Validated ${motions.length.toLocaleString()} Winnipeg motions across ${meetings.length} meetings.`);
    console.log(`Latest source date: ${latestDate} (${ageDays} days old).`);
}
