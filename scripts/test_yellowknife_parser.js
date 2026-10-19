import assert from 'node:assert/strict';
import { parseHtmlMinutes, parseMotions, parsePresentMembers } from './import_yellowknife_data.js';

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
That, the City defer the item.
MOTION CARRIED (Councillor R. Warburton opposed)
8. Councillor R. Warburton returned to the meeting.

#0003-22
9. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
That: the City reject the proposal.
MOTION DEFEATED

#0004-22
10. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
First Reading of By-law No. 5063.
MOTION CARRIED UNANIMOUSLY
11. There was no deferred business.

#0005-22
12. Councillor G. Cochrane moved/ Councillor C. McGurk seco nded/
Second Reading of By-law No. 5063.
MOTION CARRIED UNANIMOUSLY

#0006-22
13. Councillor G. Cochrane moved, Councillor C. McGurk second ed,
Third Reading of By-law No. 5063.
MOTION CARRIED UNANIMOUSLY

#0007-22
DM#812161 Page 3 ADOPTED MINUTES October 24, 2022 14. First Reading of By-law No. 5064.
MOTION CARRIED UNANIMOUSLY
`;

assert.deepEqual(parsePresentMembers(text), [
  'Mayor Rebecca Alty', 'Garett Cochrane', 'Cat McGurk', 'Stacie Arden-Smith', 'Rob Warburton',
]);

const motions = parseMotions(text, '2022-10-24', 'Council Meeting', sourceUrl, 'yellowknife-2022-10-24-council-meeting');
assert.equal(motions.length, 7);
assert.equal(Object.keys(motions[0].votes).length, 5);
assert.equal(motions[0].title, 'the City approve the budget.');
assert.equal(motions[0].votes['Mayor Rebecca Alty'], 'YES');
assert.equal(motions[1].title, 'the City defer the item.');
assert.equal(motions[1].votes['Rob Warburton'], 'NO');
assert.deepEqual(motions[2].votes, {});
assert.equal(motions[2].status, 'Not adopted');
assert.equal(motions[3].title, 'First Reading of By-law No. 5063.');
assert.equal(motions[4].title, 'Second Reading of By-law No. 5063.');
assert.equal(motions[5].title, 'Third Reading of By-law No. 5063.');
assert.equal(motions[6].title, 'First Reading of By-law No. 5064.');
assert.equal(motions.every(motion => motion.sourceUrl === sourceUrl), true);

const embeddedThat = parseMotions(`#0008-22
15. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
Whereas residents should understand how they vote; Therefore, the City should publish the record.
MOTION CARRIED UNANIMOUSLY`, '2022-10-24', 'Council Meeting', sourceUrl, 'yellowknife-2022-10-24-council-meeting');
assert.equal(embeddedThat[0].title, 'Whereas residents should understand how they vote; Therefore, the City should publish the record.');

const embeddedHeader = parseMotions(`#0009-22
16. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
That the City continue the program; DM#123456 Page 2 ADOPTED MINUTES March 4, 2026 05-26 2. the program be reviewed.
MOTION CARRIED UNANIMOUSLY`, '2022-10-24', 'Council Meeting', sourceUrl, 'yellowknife-2022-10-24-council-meeting');
assert.equal(embeddedHeader[0].title, 'the City continue the program; 2. the program be reviewed.');

const leadingHeader = parseMotions(`#0011-22
18. Councillor G. Cochrane moved, Councillor C. McGurk seconded,
ADOPTED MINUTES June 24, 2025 15-25 That: the City appoint the officer.
MOTION CARRIED UNANIMOUSLY`, '2022-10-24', 'Council Meeting', sourceUrl, 'yellowknife-2022-10-24-council-meeting');
assert.equal(leadingHeader[0].title, 'the City appoint the officer.');

const missingSeconder = parseMotions(`#0010-22
17. Councillor G. Cochrane moved, Councillor seconded,
That the City approve the recommendation.
MOTION CARRIED UNANIMOUSLY`, '2022-10-24', 'Council Meeting', sourceUrl, 'yellowknife-2022-10-24-council-meeting');
assert.equal(missingSeconder[0].title, 'the City approve the recommendation.');

// Trimmed from eSCRIBE's HTML minutes (Meeting.aspx?...&Agenda=PostMinutes).
const htmlMinutes = `<h1 id="AgendaHeaderTitle"><p><span>CITY COUNCIL MINUTES</span></p>
<p><span style="font-weight: bold;">Present: </span><span style="display: block;">Mayor B. Hendriksen (Chair)</span><span style="display: block;">Councillor G. Cochrane</span><span style="display: block;">Councillor S. Arden-Smith</span></p>
<p><span style="font-weight: bold;">Absent: </span><span style="display: block;">Councillor S. Payne</span></p></h1>
<ul class="AgendaItemMotions">
<li class="AgendaItemMotion"><div class="Number"><span class="Label">#</span><span class="Value">0181-26</span></div><div class="MovedBy"><span class="Label">Moved by</span><span class="Value">Councillor G. Cochrane</span></div><div class="SecondedBy"><span class="Label">Seconded by</span><span class="Value">Councillor S. Arden-Smith</span></div><div class="MotionText RichText"><p><span>&#8203;That Council:</span></p><ol><li><span>Confirm the role;</span></li><li><span>Confirm the position.</span></li></ol></div><table class="MotionVoters"></table><div class="MotionResult"><br>MOTION CARRIED UNANIMOUSLY</div></li>
<li class="AgendaItemMotion"><div class="Number"><span class="Value">0182-26</span></div><div class="MotionText RichText"><p>That Council reject the proposal.</p></div><div class="MotionResult">MOTION DEFEATED (Councillor G. Cochrane opposed)</div></li>
<li class="AgendaItemMotion"><div class="Number"><span class="Value">0183-26</span></div><div class="MotionText RichText"><p>That the meeting be adjourned.</p></div><div class="MotionResult"></div></li>
</ul>`;
const htmlMotions = parseHtmlMinutes(htmlMinutes, '2026-08-26', 'Council Meeting', sourceUrl, 'yk-2026-08-26-4321455b');
assert.equal(htmlMotions.length, 2);
assert.equal(htmlMotions[0].id, 'yk-2026-08-26-0181-26');
assert.equal(htmlMotions[0].title, 'Council: 1. Confirm the role; 2. Confirm the position.');
assert.deepEqual(Object.keys(htmlMotions[0].votes), ['Mayor Ben Hendriksen', 'Garett Cochrane', 'Stacie Arden-Smith']);
assert.equal(htmlMotions[0].status, 'Adopted');
assert.match(htmlMotions[0].body, /^#0181-26 Moved by Councillor G\. Cochrane, seconded by Councillor S\. Arden-Smith\. That Council:/);
assert.equal(htmlMotions[1].status, 'Not adopted');
assert.deepEqual(htmlMotions[1].votes, { 'Garett Cochrane': 'NO' });
assert.equal(parseHtmlMinutes('<html><title>Just a moment...</title></html>', '2026-08-26', 'Council Meeting', sourceUrl, 'r'), null);

console.log('Yellowknife parser fixtures passed');
