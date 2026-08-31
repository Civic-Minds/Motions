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
        currentCouncillors: ['Mayor Ken Sim', 'Rebecca Bligh', 'Lisa Dominato', 'Pete Fry', 'Sarah Kirby-Yung', 'Mike Klassen', 'Lucy Maloney', 'Peter Meiszner', 'Brian Montague', 'Sean Orr', 'Lenny Zhou'],
        dataBaseEnv: 'VITE_VANCOUVER_DATA_BASE_URL',
        localDataPath: '/data/vancouver',
        election: {
            date: '2026-10-17',
            offices: ['Mayor', 'City Councillor'],
            officialUrl: 'https://vancouver.ca/your-government/2026-election.aspx',
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
