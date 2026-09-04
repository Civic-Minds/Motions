function compact(value) {
    return value.replace(/\s+/g, ' ').trim();
}

// Yellowknife's downtown grid uses numbered streets/avenues (e.g. "50 Street")
// with no name word, so a civic-number + name-word + suffix pattern alone
// (Victoria/Toronto's approach) misses them — matched separately below.
// Deliberately case-SENSITIVE: minute text like "...a portion of Road
// (School Draw Avenue)..." otherwise lets case-insensitive matching treat
// lowercase filler words ("and", "a", "portion") as proper-noun street-name
// words, producing a garbage "address" like "2396 and a portion of Road".
const NAMED_STREET = /\b\d{1,5}\s+[A-Z][A-Za-z.'-]*(?:\s+[A-Z][A-Za-z.'-]*){0,3}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace)\b/g;
const NUMBERED_STREET = /\b\d{2,5}\s+\d{1,3}(?:st|nd|rd|th)?\s+(?:Street|St|Avenue|Ave)\b/g;
const NAMED_PLACES = ['City Hall', 'Yellowknife Airport', 'Old Town', 'Kam Lake'];

export function locationsFromTitle(title) {
    const matches = [...(title.match(NAMED_STREET) ?? []), ...(title.match(NUMBERED_STREET) ?? [])];
    const namedPlaces = NAMED_PLACES.filter(place => title.toLowerCase().includes(place.toLowerCase()));
    return [...new Set([...matches.map(compact), ...namedPlaces])];
}
