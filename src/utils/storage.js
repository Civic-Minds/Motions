const WARD_KEY = 'motions_ward_id';

export function getWardId() {
  try {
    const raw = localStorage.getItem(WARD_KEY);
    return raw ? String(parseInt(raw, 10)) : null;
  } catch {
    return null;
  }
}

export function setWardId(id) {
  try {
    if (id) localStorage.setItem(WARD_KEY, id);
    else localStorage.removeItem(WARD_KEY);
  } catch {}
}
