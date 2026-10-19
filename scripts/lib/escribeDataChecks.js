/**
 * Publication checks shared by the eSCRIBE-sourced cities (Victoria,
 * Yellowknife). They catch the failure where the source blocks minutes
 * downloads: meetings lose their motion links and no new motions arrive.
 */

export const MAX_MOTION_AGE_DAYS = 90;
const MAX_UNLINKED_MEETING_RATIO = 0.05;

export function linkAndFreshnessErrors(motions, meetings, today = new Date()) {
  const errors = [];
  const motionRefs = new Set(motions.map(motion => motion.meetingReference).filter(Boolean));
  const withMotions = meetings.filter(meeting => motionRefs.has(meeting.meetingReference));
  const unlinked = withMotions.filter(meeting => !meeting.agendaItems?.some(item => item.motionId));
  if (withMotions.length && unlinked.length / withMotions.length > MAX_UNLINKED_MEETING_RATIO) {
    errors.push(`${unlinked.length} of ${withMotions.length} meetings with motions have no motion links (e.g. ${unlinked[0].meetingReference})`);
  }
  const latest = motions.map(motion => motion.date).filter(Boolean).sort().at(-1);
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - MAX_MOTION_AGE_DAYS);
  if (latest && latest < cutoff.toISOString().slice(0, 10)) {
    errors.push(`newest motion is from ${latest}, more than ${MAX_MOTION_AGE_DAYS} days old; minutes are probably not being read`);
  }
  return errors;
}
