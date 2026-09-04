export const JURISDICTIONS = {
    toronto: {
        id: 'toronto',
        name: 'Toronto',
        shortName: 'Toronto',
        path: '/toronto',
        geography: 'ward',
        representativeLabel: 'Councillor',
        representativesLabel: 'Councillors',
        mayorName: 'Olivia Chow',
        mapCenter: [43.718, -79.385],
        currentCouncillors: [],
        dataBaseEnv: 'VITE_BLOB_BASE_URL',
        localDataPath: '/data',
        directory: { tagline: '25 wards · Mayor Olivia Chow', coordinates: [43.6532, -79.3832] },
        election: {
            date: '2026-10-26',
            offices: ['Mayor', 'City Councillor', 'School Trustee'],
            officialUrl: 'https://www.toronto.ca/city-government/elections/',
            voterInfoOpens: '2026-09-01',
        },
    },
    vancouver: {
        id: 'vancouver',
        name: 'Vancouver',
        shortName: 'Vancouver',
        path: '/vancouver',
        geography: 'atLarge',
        representativeLabel: 'Councillor',
        representativesLabel: 'Councillors',
        mayorName: 'Ken Sim',
        mapCenter: [49.25, -123.1],
        currentCouncillors: ['Mayor Ken Sim', 'Rebecca Bligh', 'Lisa Dominato', 'Pete Fry', 'Sarah Kirby-Yung', 'Mike Klassen', 'Lucy Maloney', 'Peter Meiszner', 'Brian Montague', 'Sean Orr', 'Lenny Zhou'],
        dataBaseEnv: 'VITE_VANCOUVER_DATA_BASE_URL',
        localDataPath: '/data/vancouver',
        directory: { tagline: 'Elected at-large · Mayor Ken Sim', coordinates: [49.2827, -123.1207] },
        election: {
            date: '2026-10-17',
            offices: ['Mayor', 'City Councillor'],
            officialUrl: 'https://vancouver.ca/your-government/2026-election.aspx',
        },
    },
    victoria: {
        id: 'victoria',
        name: 'Victoria',
        shortName: 'Victoria',
        path: '/victoria',
        geography: 'atLarge',
        representativeLabel: 'Councillor',
        representativesLabel: 'Councillors',
        mayorName: 'Marianne Alto',
        mapCenter: [48.4284, -123.3656],
        currentCouncillors: ['Marianne Alto', 'Dave Thompson', 'Jeremy Caradonna', 'Krista Loughton', 'Marg Gardiner', 'Matt Dell', 'Stephen Hammond', 'Susan Kim', 'Chris Coleman'],
        dataBaseEnv: 'VITE_VICTORIA_DATA_BASE_URL',
        localDataPath: '/data/victoria',
        directory: { tagline: '9 councillors · Mayor Marianne Alto', coordinates: [48.4284, -123.3656] },
        public: false,
        election: {
            date: '2026-10-17',
            offices: ['Mayor', 'City Councillor'],
            officialUrl: 'https://www.victoria.ca/city-government/elections',
        },
    },
    yellowknife: {
        id: 'yellowknife',
        name: 'Yellowknife',
        shortName: 'Yellowknife',
        path: '/yellowknife',
        geography: 'atLarge',
        representativeLabel: 'Councillor',
        representativesLabel: 'Councillors',
        mayorName: 'Mayor Ben Hendriksen',
        mapCenter: [62.454, -114.372],
        currentCouncillors: [
            'Mayor Ben Hendriksen', 'Garett Cochrane', 'Ryan Fequet', 'Rob Foote',
            'Cat McGurk', 'Tom McLennan', 'Stacie Arden-Smith', 'Steve Payne', 'Rob Warburton',
        ],
        dataBaseEnv: 'VITE_YELLOWKNIFE_DATA_BASE_URL',
        localDataPath: '/data/yellowknife',
        directory: { tagline: '8 councillors · Mayor Ben Hendriksen', coordinates: [62.4540, -114.3718] },
        public: false,
        election: {
            date: '2026-10-19',
            offices: ['Mayor', 'City Councillor'],
            officialUrl: 'https://www.yellowknife.ca/elections',
        },
    },
    // Winnipeg intentionally not registered yet — see scripts/import_winnipeg_data.js
    // and the winnipeg-city branch. Not ready to show publicly; the shared-code
    // fixes that came out of building it (this file's generalized consumers,
    // useMotions.js, api/data.js, etc.) are what's landing here.
};

export function getJurisdiction(id = 'toronto') {
    return JURISDICTIONS[id] ?? JURISDICTIONS.toronto;
}

export function getVisibleJurisdictions() {
    return Object.values(JURISDICTIONS).filter(isJurisdictionPublic);
}

export function isJurisdictionPublic(jurisdiction) {
    return import.meta.env.DEV || jurisdiction.public !== false;
}

export function getInitialJurisdiction() {
    const segment = window.location.pathname.split('/').filter(Boolean)[0];
    const jurisdiction = getJurisdiction(segment);
    return isJurisdictionPublic(jurisdiction) ? jurisdiction : JURISDICTIONS.toronto;
}
