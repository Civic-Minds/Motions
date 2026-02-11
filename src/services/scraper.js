/**
 * Scraper Service - Toronto Council Topic Tracker
 * 
 * This service handles fetching and parsing data from the 
 * Toronto Meeting Management Information System (TMMIS).
 */

export const IMPACT_CATEGORIES = {
    HIGH: 'High',
    TRIVIAL: 'Trivial',
    ADMIN: 'Admin'
};

const TRIVIAL_KEYWORDS = [
    'trash bin', 'signage', 'plaque', 'ceremonial', 'permit',
    'designation', 'honorary', 'naming', 'commemorative'
];

const HIGH_IMPACT_KEYWORDS = [
    'ttc', 'lrt', 'transit', 'housing', 'budget', 'climate',
    'zoning', 'shelter', 'tax', 'emergency', 'development'
];

export async function fetchItemDetails(itemId) {
    // In a real production app, this would call a backend scraper.
    // For the prototype, we simulate the logic.
    console.log(`Deep-fetching details for ${itemId}...`);

    // Simulation of NLP / Keyword extraction logic defined in implementation plan
    const mockTitle = itemId === 'MM35.15'
        ? "Speeding Up Light Rail Transit and Streetcars"
        : "Relocation of a Trash Bin on Queen Street West";

    const isTrivial = TRIVIAL_KEYWORDS.some(k => mockTitle.toLowerCase().includes(k));
    const isHighImpact = HIGH_IMPACT_KEYWORDS.some(k => mockTitle.toLowerCase().includes(k));

    return {
        id: itemId,
        title: mockTitle,
        impact: isTrivial ? IMPACT_CATEGORIES.TRIVIAL : (isHighImpact ? IMPACT_CATEGORIES.HIGH : IMPACT_CATEGORIES.ADMIN),
        mover: "Mayor Olivia Chow",
        seconder: "Councillor Jamaal Myers",
        votes: {
            yes: 22,
            no: 1,
            absent: 2
        },
        rawUrl: `https://secure.toronto.ca/council/agenda-item.do?item=2025.${itemId}`
    };
}

export function calculateAlignment(councillorA, councillorB, topic = null) {
    // Placeholder for alignment math logic: Shared Votes / Total Votes
    return Math.floor(Math.random() * 60) + 40; // Mock 40-100%
}
