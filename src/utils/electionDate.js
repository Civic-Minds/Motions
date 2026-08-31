export function formatElectionDate(date) {
  return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' })
    .format(new Date(`${date}T00:00:00`));
}
