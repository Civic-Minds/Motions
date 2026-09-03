// Vancouver's agenda descriptions include the meeting item label (for
// example "1.", "RR1.", or "Motion 3."). Keep the source link/vote number,
// but present the motion title without navigation-only prefixes.
//
// Shared between the frontend (useMotions.js, applied to already-imported
// data) and the Vancouver import pipeline (import_vancouver_data.js, applied
// once at import time) so the two copies can't drift apart.
export function cleanVancouverTitle(title) {
    return title.trim()
        .replace(/^(?:\d+[a-z]?[.)]|[A-Z]{1,8}\d+[a-z]?(?:[.)]|\s+)|Motion\s+\d+[.)]?|CD-1)\s*/i, '')
        .trim();
}
