export function formatElectionDate(date) {
  return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' })
    .format(new Date(`${date}T00:00:00`));
}

export function formatElectionDateLong(date) {
  return new Intl.DateTimeFormat('en-CA', { month: 'long', day: 'numeric' })
    .format(new Date(`${date}T00:00:00`));
}

export function formatElectionDateFull(date) {
  return new Intl.DateTimeFormat('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
    .format(new Date(`${date}T00:00:00`));
}

export function isOnOrAfter(date) {
  if (!date) return false;
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= target;
}

export function getElectionPhase(electionDate) {
  if (!electionDate) return null;
  return isOnOrAfter(electionDate) ? 'past' : 'upcoming';
}

// The "not affiliated with the city" clause every election page's closing
// disclaimer opens with — shared so each city doesn't restate it with
// slightly different wording. Callers append their own trailing sentence.
export function disclaimerText(jurisdiction, extraAffiliation) {
  return `Motions is an independent civic data project and is not affiliated with the City of ${jurisdiction.name}${extraAffiliation ? ` or ${extraAffiliation}` : ''}.`;
}
