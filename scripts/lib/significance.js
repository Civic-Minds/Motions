import { isAdministrativeTitle } from './topicClassification.js';

// Every city's significance score applies this same penalty, clamped to 0-100.
// Kept in one place so a city can't silently ship a formula that forgets it
// (Vancouver did, once).
export function applyAdministrativePenalty(score, title, penalty = 25) {
    const adjusted = isAdministrativeTitle(title) ? score - penalty : score;
    return Math.max(0, Math.min(100, adjusted));
}
