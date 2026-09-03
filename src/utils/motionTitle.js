// Vancouver's agenda descriptions include navigation labels and, in older
// records, a few copied formatting/encoding artefacts. Keep the source
// link/vote number, but present a readable motion title.
//
// Shared between the frontend (useMotions.js, applied to already-imported
// data) and the Vancouver import pipeline (import_vancouver_data.js, applied
// once at import time) so the two copies can't drift apart.
const MOJIBAKE_REPLACEMENTS = [
    ['â€“', '–'],
    ['â€”', '—'],
    ['â€™', '’'],
    ['â€œ', '“'],
    ['â€', '”'],
    ['â€¢', '•'],
    ['Â ', ' '],
];

function repairVancouverText(value) {
    let repaired = String(value ?? '');
    for (const [broken, replacement] of MOJIBAKE_REPLACEMENTS) {
        repaired = repaired.replaceAll(broken, replacement);
    }
    return [...repaired]
        .map(character => {
            const code = character.charCodeAt(0);
            return code <= 0x1f || code === 0x7f ? ' ' : character;
        })
        .join('')
        .replaceAll('\\r\\n', ' ')
        .replaceAll('\\n', ' ')
        .replaceAll('\\r', ' ')
        .replaceAll('\\t', ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function cleanVancouverTitle(title) {
    let cleaned = repairVancouverText(title);
    let previous;
    do {
        previous = cleaned;
        cleaned = cleaned
            .replace(/^(?:Item\s+\d+[.)]?|\d+[a-z]?[.)]|[A-Z]{1,8}\d+[a-z]?(?:[.)]|\s+)|Motion\s+\d+[.)]?|CD-1(?:\s*\(\d+\))?)\s*/i, '')
            .trim();
    } while (cleaned !== previous);
    return cleaned;
}
