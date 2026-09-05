import { isAdministrativeTitle } from './topicClassification.js';

// Every city's significance score applies this same penalty, clamped to 0-100.
// Kept in one place so a city can't silently ship a formula that forgets it
// (Vancouver did, once).
export function applyAdministrativePenalty(score, title, penalty = 25) {
    const adjusted = isAdministrativeTitle(title) ? score - penalty : score;
    return Math.max(0, Math.min(100, adjusted));
}

// Badges derived from vote spread + score. Recompute this whenever score
// changes for a motion that already has flags — they're a view of the same
// significance number, not independent data.
export function computeFlags(votes, status, score) {
    const flags = [];
    const vals = Object.values(votes ?? {});
    if (vals.length === 0) return flags;

    const yes = vals.filter(v => v === 'YES').length;
    const no  = vals.filter(v => v === 'NO').length;
    const total = yes + no;
    const margin = Math.abs(yes - no);

    if (score >= 25 && total >= 15 && margin <= 5) flags.push('close-vote');
    if (score >= 25 && status === 'Lost') flags.push('defeated');
    if (score >= 25 && total >= 20 && no === 0) flags.push('unanimous');
    if (score >= 25 && status === 'Lost' && yes <= 5 && total >= 15) flags.push('landslide-defeat');

    return flags;
}
