import { classifyByKeywords, isAppointmentTitle, isAdministrativeTitle } from './topicClassification.js';

// Word-boundary matching, first-match-wins order: Housing before Planning &
// Development (housing-framed titles win over the zoning/heritage
// mechanism used to deliver them); Finance last (its keywords are generic
// catch-alls, so a domain-specific category should get first look).
const TOPIC_KEYWORDS = {
    Housing: [
        'housing', 'rental', 'tenant', 'shelter', 'homeless', 'affordable',
        'supportive housing', 'rent bank', 'missing middle',
        'short term rental', 'short-term rental',
        'extreme weather response', 'winter weather response',
    ],
    'Planning & Development': [
        'rezoning', 'zoning', 'development permit', 'development variance permit',
        'official community plan', 'land use', 'heritage alteration permit',
        'heritage designation', 'temporary use permit', 'building permit',
        'subdivision', 'strata title', 'cannabis', 'tax incentive program',
        'statutory right of way',
    ],
    Transit: [
        'transit', 'bike', 'cycling', 'pedestrian', 'traffic', 'bus lane',
        'transportation', 'parking', 'speed limit', 'speed camera',
        'road safety', 'bike share', 'scooter', 'vehicle for hire',
        'vehicles for hire', 'passenger directed vehicle', 'towing',
    ],
    Parks: [
        'park', 'trail', 'recreation', 'garden', 'playground', 'arena',
        'community centre', 'aquatics', 'crystal pool', 'pool', 'arts',
        'theatre', 'theater', 'festival', 'mural', 'heritage',
    ],
    Climate: [
        'climate', 'emissions', 'carbon', 'decarboniz', 'energy system',
        'electric vehicle', 'zero waste', 'solid waste', 'waste reduction',
        'recycling', 'biodiversity', 'sustainability', 'conservation',
        'flood', 'water supply', 'watersheds', 'waterworks', 'stormwater',
        'sanitary sewer',
    ],
    'Public Safety': [
        'police', 'vicpd', 'fire inspector', 'fire investigator', 'emergency',
        'disaster', 'earthquake', 'rescue services', 'safety initiative',
        'community safety', 'bail reform', 'unregulated substances',
        'chronic repeat offenders',
    ],
    Governance: [
        'election', 'appoint', 'council procedure', 'code of conduct',
        'closed meeting', 'governance', 'proclamation', 'committee',
        'ubcm', 'avicc', 'capital regional district', 'council remuneration',
        'bylaw officer', 'corporate plan', 'lobbyist', 'conflict of interest',
        'freedom of information', 'canadian capital cities organization',
        'federation of canadian municipalities',
    ],
    Finance: [
        'budget', 'tax rate', 'tax exemption', 'tax relief', 'tax incentive',
        'levy', 'fee', 'financial plan', 'financial statement', 'revenue',
        'grant', 'contract', 'procurement', 'borrowing', 'remuneration',
        'reserve fund', 'utility rates', 'audited', 'development cost charge',
        'membership fee',
    ],
};

export function classifyVictoriaTopic(title) {
    if (isAdministrativeTitle(title)) return 'General';
    if (isAppointmentTitle(title)) return 'Governance';

    const lower = title.toLowerCase();
    const financeTerms = /\b(?:budget|tax|levy|fee|financial|revenue|grant|contract|procurement|borrowing|funding|remuneration|audited|financial plan)\b/;

    // These are governance/place references, not topic evidence by
    // themselves, unless the title also carries a stronger finance signal.
    if (/\bcapital (?:regional district|cities organization|cities)\b/.test(lower) && !financeTerms.test(lower)) return 'Governance';
    if (/\b(?:conference|convention|travel|attendance|appointments?|reimbursement)\b/.test(lower) && !financeTerms.test(lower)) return 'Governance';
    if (/\b(?:liquor licen[cs]e|patio regulation|temporary use permit)\b/.test(lower)) return 'General';
    if (/\bheritage (?:designation|alteration|conservation area)\b/.test(lower) && !/\b(?:housing|rezoning|zoning|official community plan|development permit)\b/.test(lower)) return 'Parks';

    return classifyByKeywords(title, TOPIC_KEYWORDS, { wordBoundarySingleWords: true });
}
