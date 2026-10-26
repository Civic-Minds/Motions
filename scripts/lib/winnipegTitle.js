// Winnipeg's Socrata export contains a small number of titles that were
// decoded as a mixture of UTF-8 and Windows-1252. Keep the repairs explicit:
// a broad re-encoding pass could corrupt legitimate names.
const MOJIBAKE_REPAIRS = [
    ['\u00e2\u20ac\u201c', '–'],
    ['\u00e2\u20ac\u2014', '—'],
    ['\u00e2\u20ac\u2122', '’'],
    ['\u00e2\u20ac\u0153', '“'],
    ['\u00e2\u20ac\u009d', '”'],
    ['\u00c2\u00a0', ' '],
    ['\u00c2', ''],
];

// Manual exceptions belong here after review. The key is the source motion ID,
// so a refresh cannot silently discard a reviewed correction.
export const WINNIPEG_TITLE_OVERRIDES = {};

export function repairWinnipegEncoding(value) {
    return MOJIBAKE_REPAIRS.reduce((text, [bad, good]) => text.replaceAll(bad, good), String(value ?? ''));
}

export function normalizeWinnipegTitle(value, motionId = null) {
    const override = motionId && WINNIPEG_TITLE_OVERRIDES[motionId];
    const sourceTitle = repairWinnipegEncoding(value).replace(/\s+/g, ' ').trim();
    const title = override ?? sourceTitle.replace(/^\s*\d+(?:\.\d+)*\s*[.)-]?\s*/, '').trim();
    return { sourceTitle, title };
}

export function findWinnipegTitleIssues(sourceTitle, title) {
    const issues = [];
    if (/[\u00c2\u00e2]/.test(sourceTitle)) issues.push('encoding');
    if (/^\s*\d+(?:\.\d+)*\s*[.)-]?\s*/.test(sourceTitle)) issues.push('leading-number');
    if (!title) issues.push('empty');
    const hasControlCharacter = [...title].some(character => {
        const code = character.codePointAt(0);
        return code < 32 && ![9, 10, 13].includes(code);
    });
    if (hasControlCharacter) issues.push('control-character');
    return issues;
}
