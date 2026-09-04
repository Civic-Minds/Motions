import { classifyByKeywords } from './topicClassification.js';

const TOPIC_KEYWORDS = {
    Housing: ['housing', 'rental', 'tenant', 'shelter', 'zoning', 'rezoning', 'residential', 'homeless', 'affordable', 'development permit', 'official community plan'],
    Transit: ['transit', 'bike', 'cycling', 'pedestrian', 'traffic', 'bus', 'transportation', 'parking', 'speed camera', 'road safety'],
    Finance: ['budget', 'tax', 'levy', 'fee', 'financial', 'revenue', 'grant', 'contract', 'procurement', 'capital', 'borrowing', 'funding', 'utility rates', 'remuneration'],
    Parks: ['parks', 'topaz park', 'park improvements', 'park washrooms', 'park sequencing', 'parks regulation', 'recreation', 'garden', 'tree', 'playground', 'waterfront', 'shore', 'arena', 'community centre', 'crystal pool', 'aquatics'],
    Climate: ['climate', 'environment', 'emissions', 'carbon', 'energy', 'flood', 'resilience', 'sustainability', 'disaster', 'weather', 'biodiversity', 'zero waste', 'electric vehicle'],
    Events: ['festival', 'celebration', 'fireworks', 'hockey day', 'touchdown pacific'],
};

export function classifyVictoriaTopic(title) {
    const lower = title.toLowerCase();
    const financeTerms = /\b(?:budget|tax|levy|fee|financial|revenue|grant|contract|procurement|borrowing|funding|remuneration|audited|financial plan)\b/;

    // These are administrative or place references, not topic evidence by
    // themselves. Leave them blank unless the title contains a stronger topic.
    if (/\bcapital (?:regional district|cities organization|cities)\b/.test(lower) && !financeTerms.test(lower)) return null;
    if (/\b(?:conference|convention|travel|attendance|appointment|appointments|reimbursement)\b/.test(lower) && !financeTerms.test(lower)) return null;
    if (/\b(?:liquor licence|liquor license|patio regulation|temporary use permit)\b/.test(lower)) return null;
    if (/\bheritage (?:designation|alteration|conservation area)\b/.test(lower) && !/\b(?:housing|rezoning|zoning|official community plan|development permit)\b/.test(lower)) return null;

    if (/\b(?:climate|decarbon|emissions|carbon|flood|resilience|sustainability|disaster risk|extreme weather|earthquake early warning|biodiversity|zero waste|electric vehicle)\b/.test(lower)) return 'Climate';
    const topic = classifyByKeywords(title, TOPIC_KEYWORDS, { wordBoundarySingleWords: true });
    return topic === 'General' ? null : topic;
}
