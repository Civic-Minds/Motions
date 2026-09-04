import { classifyByKeywords, isAppointmentTitle, isAdministrativeTitle } from './topicClassification.js';

// Word-boundary matching (not plain substring) — bare nouns like "art",
// "road", "tree", "park", and "police" otherwise false-match inside
// "apartment", "Broadway", "street", "parking", and "policy".
// Order is priority order (first match wins): Housing before Planning &
// Development (housing-framed rezonings win over the zoning mechanism);
// Finance last (its keywords are generic catch-alls — a domain-specific
// contract/grant should land in that domain, not Finance, when it matches
// a more specific category first).
export const TOPIC_KEYWORDS = {
    Housing: [
        'housing', 'tenant', 'tenancy', 'renter', 'homeless', 'shelter',
        'supportive housing', 'social housing', 'single room accommodation',
        'rental housing', 'short term rental', 'short-term rental',
        'empty homes', 'missing middle',
    ],
    'Planning & Development': [
        'rezoning', 'zoning', 'development permit', 'official development plan',
        'subdivision', 'form of development', 'view protection', 'land use',
        'heritage revitalization agreement', 'sign by-law',
    ],
    Transit: [
        'transit', 'traffic', 'parking', 'pedestrian', 'cycling',
        'active transportation', 'vehicle for hire', 'vehicles for hire',
        'towing', 'skytrain', 'road safety', 'vision zero', 'transportation',
    ],
    Parks: [
        'park', 'trail', 'recreation', 'garden', 'playground', 'heritage',
        'arts', 'culture', 'theatre', 'library', 'libraries', 'festival',
        'cemetery', 'aquatic', 'waterfront', 'shore',
    ],
    Climate: [
        'climate', 'emission', 'emissions', 'greenhouse gas', 'energy',
        'sewer', 'solid waste', 'recycling', 'flood', 'sustainability',
        'renewable', 'retrofit', 'tree canopy', 'urban forest',
        'electric vehicle charging',
    ],
    'Public Safety': [
        'police', 'fire hall', 'fire department', 'fire rescue', 'wildfire',
        'emergency preparedness', 'emergency operations', 'disaster',
        'seismic', 'public safety', 'community policing',
    ],
    Governance: [
        'acting mayor', 'deputy mayor', 'roster of council', 'election',
        'by-election', 'campaign financing', 'code of conduct',
        'integrity commissioner', 'auditor general', 'freedom of information',
        'lobbyist',
    ],
    Finance: [
        'budget', 'tax', 'levy', 'fee', 'financial', 'revenue', 'grant',
        'contract', 'procurement', 'capital plan', 'debenture',
        'development cost levy', 'community amenity contribution',
        'density bonus',
    ],
};

export function classifyVancouverTopic(title) {
    if (isAdministrativeTitle(title)) return 'General';
    if (isAppointmentTitle(title)) return 'Governance';
    return classifyByKeywords(title, TOPIC_KEYWORDS, { wordBoundarySingleWords: true });
}
