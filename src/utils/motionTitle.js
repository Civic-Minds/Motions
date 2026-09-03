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

// Vancouver's source feed truncates a small number of agenda descriptions.
// These full titles are copied from the City's official agendas.
export const VANCOUVER_TITLE_OVERRIDES = {
    'van-18344-8988': 'Piloting a Culturally Appropriate, Indigenous-led Supportive Housing and Wellness Centre Project in Partnership with Indigenous Peoples (Member Motion B.2)',
    'van-18344-8989': 'Piloting a Culturally Appropriate, Indigenous-led Supportive Housing and Wellness Centre Project in Partnership with Indigenous Peoples (Member Motion B.2)',
    'van-18347-9009': 'Appointment of Childcare Operators, Lease Approvals, Childcare Grant Approvals, and Approval of Funding for Maintenance of Licensed Childcare Centres at West Fraser Lands, Henry Hudson Elementary School, and Marpole Community Centre',
    'van-18472-9502': 'Text Amendment: 120-150 West Georgia Street, 720-770 Beatty Street and 701 Expo Boulevard (Formerly 720 Beatty Street and 701 Expo Boulevard)',
    'van-18411-9605': 'Removal of Certain Occupancy Permit Holds in respect of Construction of Social Housing for the Little Mountain Development (formerly 155 East 37th Avenue and with the current addresses and legal descriptions set out in Appendix C)',
    'van-18784-11329': 'Downtown Eastside Housing Implementation – Amendments to the FC-1 District in the Zoning and Development By-law and the Downtown Eastside/Oppenheimer District Official Development Plan (DEOD ODP) By-law to Accelerate SRO Replacement and Increase Social Housing',
};

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
        .replace(/\?\?y\?alm\?x\?\/Iy\?ï¿½lmexw\//, 'ʔəy̓alməxʷ/Iy̓álmexw/')
        .replace(/Member'\s+Motion/g, 'Member’s Motion')
        .replace(/Approval(?=\d)/g, 'Approval ')
        .replace(/\s+Report PDF$/i, '')
        .replace(/\s+[-–—]$/, '')
        .trim();
}

export function cleanVancouverTitle(title, motionId) {
    if (motionId && VANCOUVER_TITLE_OVERRIDES[motionId]) return VANCOUVER_TITLE_OVERRIDES[motionId];

    let cleaned = repairVancouverText(title);
    let previous;
    do {
        previous = cleaned;
        cleaned = cleaned
            .replace(/^(?:Item\s+\d+[.)]?|Administrative\s+Motion\s+\d+[.)]?|\d+[a-z]?[.)]|[A-Z]{1,8}\d+[a-z]?(?:[.)]|\s+)|Motion\s+\d+[.)]?|CD-1(?:\s*\(\d+\))?)\s*(?:[-–—:]\s*)?/i, '')
            .replace(/^[-–—]\s*/, '')
            .trim();
    } while (cleaned !== previous);
    return cleaned;
}
