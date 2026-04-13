const WARD_KEY = 'motions_ward_id';
const COMMITTEE_KEY = 'motions_followed_committee';

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

export function getFollowedCommittees() {
  try {
    const raw = localStorage.getItem('motions_followed_committees');
    if (raw) return JSON.parse(raw);
    
    // Legacy migration
    const old = localStorage.getItem(COMMITTEE_KEY);
    return old ? [old] : [];
  } catch {
    return [];
  }
}

export function setFollowedCommittees(names) {
  try {
    localStorage.setItem('motions_followed_committees', JSON.stringify(names));
  } catch {}
}
