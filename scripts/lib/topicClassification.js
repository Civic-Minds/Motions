// Shared "first keyword-map entry that matches wins, else General" loop
// behind both cities' topic classification. Each city supplies its own
// keyword map and matching mode — Toronto matches single-word keywords on
// word boundaries (so "art" doesn't match inside "start"); Vancouver matches
// every keyword as a plain substring. Preserving that difference here keeps
// output identical to what each script produced before this was shared.
export function classifyByKeywords(title, keywordMap, { wordBoundarySingleWords = false } = {}) {
    const lower = title.toLowerCase();
    for (const [label, keywords] of Object.entries(keywordMap)) {
        const matches = keywords.some(keyword => {
            const normalized = keyword.trim().toLowerCase();
            if (wordBoundarySingleWords && /^[a-z]+$/.test(normalized)) {
                return new RegExp(`\\b${normalized}\\b`).test(lower);
            }
            return lower.includes(normalized);
        });
        if (matches) return label;
    }
    return 'General';
}
