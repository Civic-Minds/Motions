// Canonical topic labels — see docs/CATEGORIZATION_GUIDE.md. Every city's
// classifier must emit exactly one of these strings so filters, colours,
// and the ?topic= URL param behave identically across cities.
export const CANONICAL_TOPICS = [
    'Housing', 'Transit', 'Finance', 'Planning & Development', 'Parks',
    'Climate', 'Governance', 'Public Safety', 'General',
];

// Board/committee appointments must resolve to Governance regardless of the
// board's own subject — otherwise "Appointment to the TTC Board" lands in
// Transit, "... Library Board" in Parks, "... Police Services Board" in
// Public Safety, purely because those boards' domain keywords fire first.
// Call this before running the keyword loop.
const APPOINTMENT_PATTERN = /\b(?:appointment(?:s)? (?:of|to)|appoint(?:ed|ing)?\b.*\b(?:to|as)\b|election of (?:the )?(?:chair|speaker)|acting mayor|deputy mayor)\b/i;

export function isAppointmentTitle(title) {
    return APPOINTMENT_PATTERN.test(title);
}

// Routine process motions — adopting minutes, adjourning, receiving
// correspondence, procedural referrals — carry no topic per the guide and
// should fall to General without being tested against topic keywords first
// (a "Committee Meeting Schedule" or "Notice of Motion" title can otherwise
// pick up an incidental keyword match). This is intentionally narrower than
// the guide's full administrative definition: it only catches title shapes
// with no substantive content at all, not judgment calls like appointments
// or grants (which the guide explicitly keeps substantive).
const ADMINISTRATIVE_PATTERN = /\b(?:adoption of (?:the )?minutes|minutes of (?:the )?(?:meeting|council)|confirmatory by-?law|confirming by-?law|introduction of (?:by-?laws?|general bills)|order paper|call to order|declarations? of interest|notice of motion|meeting(?:s)? (?:schedule|calendar)|be adjourned|adjournment|in.camera|leave of absence|correction of (?:dates|an? administrative error))\b/i;

export function isAdministrativeTitle(title) {
    return ADMINISTRATIVE_PATTERN.test(title);
}

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
