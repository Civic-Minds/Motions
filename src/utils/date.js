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
