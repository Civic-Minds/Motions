import assert from 'node:assert/strict';
import { groupRows } from './import_winnipeg_data.js';
import { locationsFromWinnipegTitle } from './lib/winnipegGeocoding.js';
import { normalizeWinnipegTitle } from './lib/winnipegTitle.js';

const title = normalizeWinnipegTitle('16. Subdivision and Rezoning â€“ 1390 and 1470 Dugald Road â€“ DASZ 4/2026', 'test');
assert.equal(title.title, 'Subdivision and Rezoning – 1390 and 1470 Dugald Road – DASZ 4/2026');
assert.deepEqual(locationsFromWinnipegTitle(title.title), ['1390 Dugald Road', '1470 Dugald Road']);

const motions = groupRows([
    { meeting_id: '1', meeting_date: '2026-01-01T00:00:00.000', motion_id: '10', title: '1. Housing Strategy', committee_name: 'Council', result: 'Carried', vote: 'Yea', member: 'Mayes', agenda_link: 'https://dmis.winnipeg.ca/ViewMeeting?documentId=1' },
    { meeting_id: '1', meeting_date: '2026-01-01T00:00:00.000', motion_id: '10', title: '1. Housing Strategy', committee_name: 'Council', result: 'Carried', vote: 'Nay', member: 'Gilroy', agenda_link: 'https://dmis.winnipeg.ca/ViewMeeting?documentId=1' },
]);
assert.equal(motions.length, 1);
assert.equal(motions[0].title, 'Housing Strategy');
assert.deepEqual(motions[0].votes, { 'Brian Mayes': 'YES', 'Cindy Gilroy': 'NO' });
assert.equal(motions[0].yesCount, 1);
assert.equal(motions[0].noCount, 1);

console.log('Winnipeg importer/title/location checks passed.');
