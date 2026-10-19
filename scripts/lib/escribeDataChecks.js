/**
 * Publication checks shared by the eSCRIBE-sourced cities (Victoria,
 * Yellowknife). They catch the failure where the source blocks minutes
 * downloads: meetings lose their motion links and no new motions arrive.
 */

const MAX_UNLINKED_MEETING_RATIO = 0.05;
// Posted minutes newer than the newest motion that produced no motions. A
// couple can be legitimate (a meeting with no recorded votes); a run of them
// means the minutes aren't being read.
const MAX_UNREAD_RECENT_MINUTES = 3;

export function linkAndFreshnessErrors(motions, meetings) {
  const errors = [];
  const motionRefs = new Set(motions.map(motion => motion.meetingReference).filter(Boolean));
  const withMotions = meetings.filter(meeting => motionRefs.has(meeting.meetingReference));
  const unlinked = withMotions.filter(meeting => !meeting.agendaItems?.some(item => item.motionId));
  if (withMotions.length && unlinked.length / withMotions.length > MAX_UNLINKED_MEETING_RATIO) {
    errors.push(`${unlinked.length} of ${withMotions.length} meetings with motions have no motion links (e.g. ${unlinked[0].meetingReference})`);
  }
  // Freshness is measured against posted minutes, not the calendar date:
  // Victoria can go months without publishing minutes.
  const latest = motions.map(motion => motion.date).filter(Boolean).sort().at(-1) ?? '';
  const unread = meetings.filter(meeting => meeting.minutesUrl && meeting.date > latest
    && !meeting.agendaItems?.some(item => item.motionId));
  if (unread.length >= MAX_UNREAD_RECENT_MINUTES) {
    errors.push(`${unread.length} meetings with posted minutes after the newest motion (${latest || 'none'}) have no motions; minutes are probably not being read (e.g. ${unread[0].meetingReference})`);
  }
  return errors;
}
