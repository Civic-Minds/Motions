/**
 * Guards for eSCRIBE importers when a meeting's minutes can't be downloaded
 * (e.g. the source puts documents behind a browser check and returns 403).
 *
 * Each refresh rebuilds every fetched meeting from scratch, so without these a
 * blocked download would publish that meeting with no motion links even
 * though its motions are still in the data.
 */

/* global process */

// Fail the import when more than this share of minutes downloads were blocked.
export const MAX_BLOCKED_MINUTES_RATIO = 0.5;

/**
 * Motion links to keep for a meeting whose minutes couldn't be read: the
 * previous run's links if it had any, otherwise links rebuilt from existing
 * motions recorded against the same meeting.
 */
export function previousAgendaItems(priorMeeting, existingMotions, meetingReference) {
  if (priorMeeting?.agendaItems?.length) return priorMeeting.agendaItems;
  return existingMotions
    .filter(motion => motion.meetingReference === meetingReference)
    .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }))
    .map(motion => ({ reference: motion.id, title: motion.title, inCamera: false, url: motion.sourceUrl, motionId: motion.id }));
}

/** Throws (so the run exits non-zero before anything is written) when most minutes were blocked. */
export function assertMinutesMostlyAvailable(city, attempted, blocked) {
  const ratio = attempted ? blocked / attempted : 0;
  console.log(`${city} minutes downloads: ${attempted - blocked}/${attempted} read, ${blocked} blocked or unreadable.`);
  if (ratio > MAX_BLOCKED_MINUTES_RATIO && !process.argv.includes('--allow-blocked')) {
    throw new Error(`${city} import aborted: ${blocked} of ${attempted} minutes downloads were blocked (${Math.round(ratio * 100)}%). Nothing was written.`);
  }
}
