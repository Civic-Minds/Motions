import assert from 'node:assert/strict';
import { parseMotions, parsePresentMembers } from './import_yellowknife_data.js';

const sourceUrl = 'https://events.yellowknife.ca/meetings/Detail/example';
const text = `
Present:
Mayor R. Alty,
Councillor G. Cochrane,
Councillor C. McGurk,
Councillor 5. Arden-Smith,
Councillor R. Warburton.
City Staff:
City Manager

#0001-22
6. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
That: the City approve the budget.
MOTION CARRIED UNANIMOUSLY

#0002-22
7. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
That: the City defer the item.
MOTION CARRIED (Councillor R. Warburton opposed)
8. Councillor R. Warburton returned to the meeting.

#0003-22
9. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
That: the City reject the proposal.
MOTION DEFEATED
`;

assert.deepEqual(parsePresentMembers(text), [
  'Mayor Rebecca Alty', 'Garett Cochrane', 'Cat McGurk', 'Stacie Arden-Smith', 'Rob Warburton',
]);

const motions = parseMotions(text, '2022-10-24', 'Council Meeting', sourceUrl, 'yellowknife-2022-10-24-council-meeting');
assert.equal(motions.length, 3);
assert.equal(Object.keys(motions[0].votes).length, 5);
assert.equal(motions[0].title, 'the City approve the budget');
assert.equal(motions[0].votes['Mayor Rebecca Alty'], 'YES');
assert.equal(motions[1].title, 'the City defer the item');
assert.equal(motions[1].votes['Rob Warburton'], 'NO');
assert.deepEqual(motions[2].votes, {});
assert.equal(motions[2].status, 'Not adopted');
assert.equal(motions.every(motion => motion.sourceUrl === sourceUrl), true);

console.log('Yellowknife parser fixtures passed');
