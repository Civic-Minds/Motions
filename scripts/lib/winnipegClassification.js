import { classifyByKeywords } from './topicClassification.js';

const KEYWORDS = {
    'Housing': ['housing', 'homeless', 'shelter', 'affordable', 'residential'],
    'Transit': ['transit', 'transportation', 'road', 'street', 'traffic', 'bridge', 'parking'],
    'Finance': ['budget', 'tax', 'finance', 'financial', 'expenditure', 'procurement', 'contract', 'fee', 'funding', 'grant'],
    'Planning & Development': ['development', 'zoning', 'planning', 'property', 'land use', 'construction', 'building', 'by-law'],
    'Parks': ['park', 'recreation', 'trail', 'playground', 'library', 'community centre'],
    'Climate': ['climate', 'emission', 'energy', 'waste', 'recycl', 'environment', 'water'],
    'Public Safety': ['police', 'fire', 'safety', 'emergency', 'security'],
    'Governance': ['council', 'committee', 'appointment', 'election', 'governance', 'policy'],
};

export function classifyWinnipegTopic(title) {
    return classifyByKeywords(title, KEYWORDS);
}
