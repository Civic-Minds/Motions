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

        const id = itemId.split('.').slice(1).join('.');

        const motionData = {
            id: id,
            date: 'Feb 2026',
            title: title,
            mover: moverMatch ? moverMatch[1].trim() : 'Staff Report',
            seconder: seconderMatch ? seconderMatch[1].trim() : 'N/A',
            status: statusMatch || 'Adopted',
            topic: topic,
            trivial: title.length < 30 || topic === 'General',
            url: url,
            votes: {} // Votes are usually captured in a separate sub-page or table
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
