import { classifyByKeywords, isAppointmentTitle, isAdministrativeTitle } from './topicClassification.js';

// Order is priority order for classifyByKeywords (first match wins).
// Housing before Planning & Development: housing-framed titles (rental
// preservation, supportive housing) win over the zoning/heritage mechanism
// used to deliver them. Finance last: its keywords (budget/contract/grant)
// are generic enough that a domain-specific category should get first look
// (e.g. a fire-services contract award should land in Public Safety, not
// Finance, if it matched a Public Safety keyword first).
export const TOPIC_KEYWORDS = {
    Housing: [
        'housing', 'rental', 'tenant', 'shelter', 'demolition', 'affordable',
        'eviction', 'renoviction', 'residential', 'rentsafeto', 'renter',
        'laneway', 'rent-geared', 'multiplex', 'garden suite', 'rooming house',
        'multi-tenant', 'modular', 'encampment', 'supportive housing',
        'long-term care home',
    ],
    'Planning & Development': [
        'zoning', 'official plan', 'secondary plan', 'precinct plan',
        'site plan', 'committee of adjustment', 'ontario land tribunal',
        'toronto local appeal body', 'local appeal body', 'heritage',
        'minor variance', 'draft plan of subdivision', 'subdivision',
        'development charge', 'parkland dedication', 'demolition application',
        'sign by-law', 'building permit', 'development application',
        'community benefits charge', 'infill', 'inclusionary zoning',
        'request for direction',
    ],
    Transit: [
        'ttc', 'transit', 'bus', 'lrt', 'subway', 'cycling', 'bike lane', 'bixi',
        'pedestrian', 'sidewalk', 'traffic', 'ontario line', 'eglinton',
        'crosstown', 'go train', 'go expansion', 'metrolinx', 'streetcar',
        'gardiner', 'don valley parkway', 'expressway', 'highway', 'ferry',
        'airport', 'car-share', 'carshare', 'automated speed', 'speed limit',
        'speed enforcement', 'speed camera', 'traffic calming', 'vision zero',
        'active transportation', 'e-bike', 'micromobility', 'vehicle-for-hire',
        'taxi',
    ],
    Parks: [
        'park', 'recreation', 'garden', 'trail', 'green space', 'ravine',
        'waterfront', 'shoreline', 'conservation area', 'arena',
        'community centre', 'civic centre', 'splash pad', 'library',
        'museum', 'gallery', 'festival', 'celebration', 'fireworks',
    ],
    Climate: [
        'climate', 'net zero', 'transformto', 'heat relief', 'environment',
        'emissions', 'carbon', 'green building', 'energy retrofit', 'flood',
        'stormwater', 'watermain', 'sewer', 'solid waste', 'recycling',
        'resilience', 'sustainability', 'clean energy', 'tree canopy',
        'urban forest', 'tree planting', 'urban heat', 'electrification',
        'electric vehicle',
    ],
    'Public Safety': [
        'public safety', 'police', 'fire chief', 'fire services',
        'fire hall', 'emergency', 'disaster', 'auto theft',
        'break-and-enter', 'crisis response',
    ],
    Governance: [
        'election of', 'councillor remuneration', 'municipal code',
        'ombudsman', 'integrity commissioner', 'auditor general',
        'council structure', 'declaring the office of councillor',
        'code of conduct', 'lobbyist', 'freedom of information',
    ],
    Finance: [
        'budget', 'capital', 'operating', 'tax', 'levy', 'fee', 'financial',
        'revenue', 'expenditure', 'reserve fund', 'collective bargaining',
        'labour', 'sponsorship', 'procurement', 'contract ', 'grant', 'subsidy',
        'debenture', 'borrowing', 'insurance', 'assessment', 'variance report',
        'remuneration', 'compensation',
    ],
};

export function classifyTorontoTopic(title) {
    if (isAdministrativeTitle(title)) return 'General';
    if (isAppointmentTitle(title)) return 'Governance';
    return classifyByKeywords(title, TOPIC_KEYWORDS, { wordBoundarySingleWords: true });
}
