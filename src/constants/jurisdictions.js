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
        election: {
            date: '2026-10-17',
            offices: ['Mayor', 'City Councillor'],
            officialUrl: 'https://vancouver.ca/your-government/2026-election.aspx',
        },
    },
    winnipeg: {
        id: 'winnipeg',
        name: 'Winnipeg',
        shortName: 'Winnipeg',
        path: '/winnipeg',
        // Winnipeg's council is genuinely ward-based (15 wards), but no ward
        // boundary/councillor mapping is wired up yet — 'atLarge' here means
        // "no ward UI," matching how geography is actually consumed across
        // the app (App.jsx, SiteFooter, MotionsMap). Revisit once wards land.
        geography: 'atLarge',
        representativeLabel: 'Councillor',
        representativesLabel: 'Councillors',
        mayorName: 'Scott Gillingham',
        mapCenter: [49.895, -97.14],
        currentCouncillors: ['Mayor Scott Gillingham', 'Matt Allard', 'Jeff Browaty', 'Markus Chambers', 'Shawn Dobson', 'Emma Durand-Wood', 'Evan Duncan', 'Ross Eadie', 'Cindy Gilroy', 'Janice Lukes', 'Brian Mayes', 'John Orlikow', 'Sherri Rollins', 'Vivian Santos', 'Devi Sharma', 'Russ Wyatt'],
        dataBaseEnv: 'VITE_WINNIPEG_DATA_BASE_URL',
        localDataPath: '/data/winnipeg',
        election: {
            date: '2026-10-28',
            offices: ['Mayor', 'City Councillor'],
            officialUrl: 'https://www.winnipeg.ca/city-governance/wards-elections/2026-election',
        },
    },
};

export function getJurisdiction(id = 'toronto') {
    return JURISDICTIONS[id] ?? JURISDICTIONS.toronto;
}

export function getInitialJurisdiction() {
    const segment = window.location.pathname.split('/').filter(Boolean)[0];
    return getJurisdiction(segment);
}
