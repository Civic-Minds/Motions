import { isAdministrativeTitle } from './topicClassification.js';
import { classifyVancouverTopic } from './vancouverClassification.js';

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

export function computeVancouverSignificance(votes, decision, title) {
    const yes = Object.values(votes).filter(v => v === 'YES').length;
    const no = Object.values(votes).filter(v => v === 'NO').length;
    const total = yes + no;
    const contested = total > 0 ? Math.round((Math.min(yes, no) / total) * 30) : 0;
    const topicWeight = classifyVancouverTopic(title) === 'General' ? 10 : 25;
    const outcomeWeight = decision?.toLowerCase().includes('lost') ? 20 : 10;
    return applyAdministrativePenalty(topicWeight + contested + outcomeWeight, title);
}

const CIVIC_IMPORTANCE_KEYWORDS = [
    'budget', 'property tax', 'tax rate', 'levy', 'bylaw', 'zoning',
    'housing', 'rent', 'shelter', 'homeless', 'emergency', 'climate',
    'policing', 'rcmp', 'fire', 'water', 'infrastructure',
];

function dollarAmountScore(amounts) {
    const maxValue = (amounts ?? []).reduce((max, a) => Math.max(max, a?.value ?? 0), 0);
    if (maxValue >= 10_000_000) return 30;
    if (maxValue >= 1_000_000) return 22;
    if (maxValue >= 100_000) return 14;
    if (maxValue >= 10_000) return 6;
    return 0;
}

// Only meaningful once `amounts` is known (extract_fields.js runs after
// import), so this is computed there, not at import time — see
// scripts/extract_fields.js's --city=yellowknife branch.
export function computeYellowknifeSignificance({ votes, status, title, amounts }) {
    const vals = Object.values(votes ?? {});
    const yes = vals.filter(v => v === 'YES').length;
    const no  = vals.filter(v => v === 'NO').length;
    const total = yes + no;

    let score = 0;
    if (total >= 5) {
        const contestRatio = 1 - (Math.abs(yes - no) / total);
        score += Math.round(contestRatio * 25);
    }
    if (status === 'Not adopted') score += 20;
    else if (no > 0) score += 5;

    score += dollarAmountScore(amounts);

    const lower = title.toLowerCase();
    if (CIVIC_IMPORTANCE_KEYWORDS.some(k => lower.includes(k))) score += 20;

    return applyAdministrativePenalty(score, title);
}
