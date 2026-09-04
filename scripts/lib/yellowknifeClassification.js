import { classifyByKeywords, isAppointmentTitle, isAdministrativeTitle } from './topicClassification.js';

// Word-boundary matching, first-match-wins order: Housing before Planning &
// Development; Finance last as a generic catch-all. Bare "by-law" is
// deliberately excluded from every list — most Yellowknife titles are bare
// "First/Second/Third Reading of By-law No. XXXX" with no other content,
// which should fall through to General rather than a guessed topic.
export const TOPIC_KEYWORDS = {
  Housing: [
    'housing', 'homeless', 'homelessness', 'shelter', 'reaching home',
    'street outreach', 'housing first', 'housing accelerator fund',
    'affordable housing', 'attainable housing', 'supportive housing',
    'tenant', 'rental', 'encampment',
  ],
  'Planning & Development': [
    'zoning', 'rezoning', 'development permit', 'subdivision',
    'discretionary use', 'land use', 'building permit', 'legal description',
    'development incentive',
  ],
  Parks: [
    'museum', 'arts', 'park', 'trail', 'recreation', 'arena', 'rink',
    'winter games', 'arctic winter games', 'canada winter games',
    'farmers market', 'dog park',
  ],
  Transit: [
    'transit', 'traffic', 'pedestrian', 'sidewalk', 'highway traffic',
    'franklin avenue', 'livery licence', 'vehicle for hire', 'airport',
  ],
  Climate: [
    'climate action plan', 'water rate', 'water source', 'water and sewer',
    'drinking water', 'solid waste facility', 'curbside cart', 'amnesty days',
    'recycl',
  ],
  'Public Safety': [
    'wildfire', 'wildland fire', 'fire protection', 'fire hydrant',
    'fire mitigation', 'disaster', 'emergency response',
    'community safety and well-being', 'municipal enforcement',
    'arctic security', 'norad', 'administrative monetary penalty',
  ],
  Governance: [
    'deputy mayor', 'acting mayor', 'audit committee',
    'development appeal board', 'board of revision', 'heritage committee',
    'accessibility advisory committee', 'grant review committee',
    'mayor\'s task force', 'registrar of enumeration', 'bylaw officer',
    'development officer', 'adjudicator', 'council procedure',
    'council remuneration', 'council leave policy', 'council travel',
    'election', 'notice requirement', 'proportional representation',
    'reconciliation action plan', 'strategic direction',
    'public engagement policy', 'conference', 'delegation from',
  ],
  Finance: [
    'budget', 'audited financial statement', 'financial statement',
    'tax exemption', 'tax abatement', 'business licence fee',
    'community grant reserve', 'grant funding', 'reserve fund', 'debenture',
    'tourist accommodation tax', 'property tax', 'sponsorship and naming rights',
  ],
};

export function classifyYellowknifeTopic(title) {
  if (isAdministrativeTitle(title)) return 'General';
  if (isAppointmentTitle(title)) return 'Governance';
  return classifyByKeywords(title, TOPIC_KEYWORDS, { wordBoundarySingleWords: true });
}
