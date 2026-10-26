import { extractAddresses } from './addressExtraction.js';

const ADDRESS_RE = /\b(\d{1,5}(?:\s*(?:to|-|–)\s*\d{1,5})?\s+(?:The\s+)?[A-Z][a-zA-Z.'-]*(?:\s+[A-Z][a-zA-Z.'-]*){0,4}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy|Square|Sq|Highway|Hwy)(?:\.)?(?:\s+(?:East|West|North|South))?)\b/gi;
const GROUPED_ADDRESS_RE = /\b((?:\d{1,5}(?:(?:\s*,\s*|\s+and\s+|\s*&\s*)\d{1,5})+))\s+((?:The\s+)?[A-Z][a-zA-Z.'-]*(?:\s+[A-Z][a-zA-Z.'-]*){0,4}\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Court|Ct|Way|Crescent|Cres|Place|Pl|Trail|Terrace|Gate|Path|Circle|Parkway|Pkwy|Square|Sq|Highway|Hwy)(?:\.)?(?:\s+(?:East|West|North|South))?)/gi;
const NAMED_PLACES = [
    'Assiniboine Park', 'City Hall', 'The Forks', 'Kildonan Park',
    'Maple Grove Rugby Park', 'Portage and Main', 'Red River',
    'St. Boniface Hospital', 'University of Manitoba', 'Winnipeg Airport',
];
const EXCLUDE_RE = /^(?:\d+\s+(?:Complete Street|Local Road|on Updates))$/i;

export function locationsFromWinnipegTitle(title) {
    const addresses = extractAddresses(title, {
        addressRe: ADDRESS_RE,
        groupedRe: GROUPED_ADDRESS_RE,
        exclude: EXCLUDE_RE,
    });
    const namedPlaces = NAMED_PLACES.filter(place => title.toLowerCase().includes(place.toLowerCase()));
    return [...new Set([...addresses, ...namedPlaces])];
}
