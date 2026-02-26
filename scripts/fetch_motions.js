import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

/* global process */

const DATA_PATH = path.join(process.cwd(), 'public/data/motions.json');

/**
 * TMMIS Data Fetcher Utility
 */

async function fetchCouncilItem(itemId) {
    const url = `https://secure.toronto.ca/council/agenda-item.do?item=${itemId}`;
    console.log(`\n🔍 Fetching: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.toronto.ca/'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('.itemTitle').text().trim() || 'Untitled Motion';
        const rawDetails = $('.itemDetails').text();

        const moverMatch = rawDetails.match(/Moved by:\s+([^\n,]+)/);
        const seconderMatch = rawDetails.match(/Seconded by:\s+([^\n,]+)/);
        const statusMatch = $('.itemStatus').text().trim();

        const topicKeywords = {
            'Housing': ['housing', 'rental', 'tenant'],
            'Transit': ['ttc', 'transit', 'bus', 'lrt'],
            'Finance': ['budget', 'capital', 'operating', 'tax'],
            'Parks': ['park', 'recreation', 'garden']
        };

        let topic = 'General';
        for (const [key, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(k => title.toLowerCase().includes(k))) {
                topic = key;
                break;
            }
        }

        const wardKeywords = {
            '1': ['Etobicoke North', 'Rexdale', 'Thistletown'],
            '2': ['Etobicoke Centre', 'Islington', 'Kingsway'],
            '3': ['Etobicoke-Lakeshore', 'Mimico', 'Long Branch', 'Humber Bay'],
            '4': ['Parkdale-High Park', 'Roncesvalles', 'Sunnyside'],
            '5': ['York South-Weston', 'Mount Dennis', 'Weston'],
            '8': ['Eglinton-Lawrence', 'Lawrence Park'],
            '9': ['Davenport', 'Corso Italia'],
            '10': ['Spadina-Fort York', 'Front Street', 'Liberty Village', 'Cityview', 'Harbourfront'],
            '11': ['University-Rosedale', 'Annex', 'Yorkville', 'Rosedale'],
            '12': ['Toronto-St. Paul\'s', 'Deer Park', 'Casa Loma'],
            '13': ['Toronto Centre', 'Dundas', 'Sherbourne', 'Cabbagetown', 'St. Lawrence', 'Regent Park'],
            '14': ['Toronto-Danforth', 'Leslieville', 'Riverdale', 'Greektown'],
            '15': ['Don Valley West', 'Redpath', 'Leaside', 'Thorncliffe Park'],
            '16': ['Don Valley East', 'Flemingdon Park'],
            '18': ['Willowdale', 'North York Centre'],
            '19': ['Beaches-East York', 'The Beach'],
            '23': ['Scarborough North', 'Milliken', 'Agincourt'],
            '25': ['Scarborough-Rouge Park', 'Rouge', 'Malvern'],
        };

        let ward = 'City';
        for (const [w, keywords] of Object.entries(wardKeywords)) {
            if (keywords.some(k => title.toLowerCase().includes(k.toLowerCase()) || rawDetails.toLowerCase().includes(k.toLowerCase()))) {
                ward = w;
                break;
            }
        }

        const votes = {};
        $('.report-table tbody tr').each((i, row) => {
            const cells = $(row).find('td');
            const type = cells.eq(0).text().trim().split(':')[0]; // Yes, No, Absent
            const names = cells.eq(1).text().split(',').map(n => n.replace(/\([^)]+\)/g, '').trim()).filter(n => n.length > 0);

            if (type === 'Yes' || type === 'No') {
                names.forEach(name => {
                    votes[name] = type.toUpperCase();
                });
            }
        });

        const id = itemId.split('.').slice(1).join('.');

        const routineKeywords = [
            'By-law', 'Confirmatory', 'Order Paper', 'Declarations of Interest',
            'Minutes', 'Routine', 'Enactment', 'Administrative', 'Appointment',
            'Ceremonial', 'Petitions', 'Call to Order'
        ];

        const impactKeywords = [
            'Budget', 'Housing', 'TTC', 'Transit', 'Shelter', 'Climate',
            'Implementation', 'Safety', 'Strategy', 'Framework'
        ];

        const isRoutine = routineKeywords.some(k => title.includes(k));
        const hasHighImpact = impactKeywords.some(k => title.toLowerCase().includes(k.toLowerCase()));

        // Triviality logic:
        // 1. Routine procedural items are trivial.
        // 2. Anything moved by "Staff Report" or lack of Seconder is higher likelihood of being routine.
        // 3. Very short titles or titles that are just IDs are trivial.
        const mover = moverMatch ? moverMatch[1].trim() : 'Staff Report';
        const seconder = seconderMatch ? seconderMatch[1].trim() : 'N/A';

        const isTrivial = isRoutine || (!hasHighImpact && (mover === 'Staff Report' || seconder === 'N/A' || title.length < 35));

        const motionData = {
            id: id,
            date: 'Feb 2026',
            title: title,
            mover: mover,
            seconder: seconder,
            status: statusMatch || 'Adopted',
            topic: topic,
            trivial: isTrivial,
            ward: ward,
            url: url,
            votes: votes
        };

        return motionData;
    } catch (error) {
        console.error(`❌ Failed to fetch item ${itemId}:`, error);
    }
}

async function updateDataFile(newData) {
    try {
        let currentData = [];
        if (fs.existsSync(DATA_PATH)) {
            const fileContent = fs.readFileSync(DATA_PATH, 'utf8');
            currentData = JSON.parse(fileContent);
        }

        const index = currentData.findIndex(m => m.id === newData.id);
        if (index > -1) {
            currentData[index] = { ...currentData[index], ...newData };
            console.log(`♻️ Updated existing item: ${newData.id}`);
        } else {
            currentData.push(newData);
            console.log(`✨ Added new item: ${newData.id}`);
        }

        fs.writeFileSync(DATA_PATH, JSON.stringify(currentData, null, 2));
        console.log(`✅ Saved to ${DATA_PATH}`);
    } catch (error) {
        console.error('❌ Failed to update data file:', error);
    }
}

const targetId = process.argv[2];
if (targetId) {
    fetchCouncilItem(targetId).then(data => {
        if (data) {
            updateDataFile(data);
        }
    });
} else {
    console.log("Usage: node scripts/fetch_motions.js [YEAR.ITEM_ID]");
    console.log("Example: node scripts/fetch_motions.js 2026.CC37.3");
}
