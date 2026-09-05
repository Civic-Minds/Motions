export function formatMotionDate(date) {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  return date.split(',')[0].trim();
}

// "April 21, 2026" instead of a raw ISO date like "2026-04-21" — used where
// the date is the main piece of info shown (not a compact card), since a raw
// ISO string reads ambiguously to people unfamiliar with the format.
export function formatFullDate(date) {
  if (!date) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return date;
}
