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
    const topic = classifyByKeywords(title, TOPIC_KEYWORDS, { wordBoundarySingleWords: true });
    return topic === 'General' ? null : topic;
}
