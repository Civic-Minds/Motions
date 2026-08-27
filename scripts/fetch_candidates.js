import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://www.toronto.ca/city-government/elections/candidate-list/';

// These domains were manually checked as campaign sites. Email domains are
// never inferred as websites unless they appear in this allowlist.
const VERIFIED_WEBSITES_BY_EMAIL = {
  'votedarrellbrown@gmail.com': 'https://electdarrellbrown.ca/',
  'votedigiorgio@gmail.com': 'https://www.danieldigiorgio.com/',
  'votelornaantwi@gmail.com': 'https://www.lornaantwi.com/',
  'votehusain@gmail.com': 'https://husainneem.ca/',
};

const VERIFIED_WEBSITES_BY_EMAIL_DOMAIN = {
  'bradford26.ca': 'https://bradford26.ca/',
  'oliviachow.ca': 'https://www.oliviachow.ca/',
  'deville2026.ca': 'https://www.deville2026.ca/',
  'odessaformayor.ca': 'https://www.odessaformayor.ca/',
  'sanders4mayor.ca': 'https://sanders4mayor.ca/',
  'alaaadib.ca': 'https://www.alaaadib.ca/',
  'jenalexander.ca': 'https://jenalexander.ca/',
  'nadiaguerrera.ca': 'https://nadiaguerrera.ca/',
  'votedebbieking.ca': 'https://votedebbieking.ca/',
  'dianachanmcnally.ca': 'https://www.dianachanmcnally.ca/',
  'bridgetogundipe.ca': 'https://www.bridgetogundipe.ca/',
  'vanessaraponi.ca': 'https://vanessaraponi.ca/',
  'nekpenobasogie.ca': 'https://nekpenobasogie.ca/',
  'chiarapadovani.ca': 'https://www.chiarapadovani.ca/',
  'gabeforunirose.ca': 'https://gabeforunirose.ca/',
  'danafisher.ca': 'https://www.danafisher.ca/',
  'aliceli.ca': 'https://www.aliceli.ca/',
  'voteyoon.ca': 'https://www.voteyoon.ca/',
  'votecurran.ca': 'https://votecurran.ca/',
  'nickiward.ca': 'https://www.nickiward.ca/',
  'sabrinazuniga.ca': 'https://sabrinazuniga.ca/',
  'voteardeshir.ca': 'https://voteardeshir.ca/',
  'adamsmithward19.ca': 'https://adamsmithward19.ca/',
  'jennieworden.ca': 'https://www.jennieworden.ca/',
  'krissanveeras.ca': 'https://www.krissan4scarb.ca/',
};

const VERIFIED_WEBSITES_BY_CANDIDATE_NAME = {
  'Jon Burnside': 'https://www.ward16.ca/',
  'Shelley Carroll': 'https://www.shelleycarroll.ca/',
  'Nathan Yusifov': 'https://yusifov.ca/',
  'James Dann': 'https://jamesdann.ca/',
  'Natalie Johnson': 'https://votenataliejohnson.ca/',
  'Tycen Legg': 'https://www.tycenlegg.ca/index.html',
  'Sharmina Nasrin': 'https://sharminanasrin.ca/',
  'Taiba Ahmed': 'https://www.taibafor21.ca/',
  'Dan Lovell': 'https://www.danlovell.ca/',
  'Saima Babar': 'https://votebabar.ca/',
  'Norman Hamilton': 'https://normanhamilton.ca/',
  'Ted Opitz': 'https://tedopitz.ca/',
  'Vincent Crisanti': 'https://pineapple-magnolia-ya9n.squarespace.com/about-vincent',
  'Adam Pham': 'https://adampham.ca/',
  'Conroy Irving': 'https://www.voteconroyirving.ca/',
  'Amanda Coombs': 'https://voteamandacoombs.com/',
  'Mike Colle': 'https://mikecolle2026.ca/',
  'Enzo Torrone': 'https://www.ward8torrone.ca/',
  'James Pasternak': 'https://www.jamespasternak.com/',
  'Paul Nash': 'https://paulnash.ca/',
  'Terri Hawkes': 'https://www.voteterrihawkes.ca/',
  'Keenan Courtis': 'https://www.keenancourtis.ca/',
  'Joe Cadeau': 'https://www.votejoecadeau.ca/',
  'Tom Cai': 'https://www.tomforward13.com/',
  'Victoria Davis': 'https://victoriaforcentre.ca/',
};

function verifiedWebsite(email, name) {
  const normalized = email?.trim().toLowerCase();
  return VERIFIED_WEBSITES_BY_EMAIL[normalized]
    ?? VERIFIED_WEBSITES_BY_EMAIL_DOMAIN[normalized?.split('@')[1]]
    ?? VERIFIED_WEBSITES_BY_CANDIDATE_NAME[name]
    ?? null;
}

async function scrapeCandidates() {
  console.log('Launching browser to scrape candidates...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(URL, { waitUntil: 'networkidle' });
    
    // Wait for the tables to appear
    console.log('Waiting for tables...');
    await page.waitForTimeout(3000); 
    
    const candidates = {
      updatedAt: new Date().toISOString(),
      mayor: [],
      wards: {}
    };

    const data = await page.evaluate(() => {
      const results = {
        mayor: [],
        wards: {}
      };

      // 1. Scrape Mayor
      const mayorTable = document.querySelector('table[id="mayorCityWideDT"]');
      if (mayorTable) {
        const rows = mayorTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            const nameRaw = cells[0].innerText.trim();
            if (nameRaw && nameRaw !== 'No data available in table') {
              const parts = nameRaw.split(',').map(p => p.trim());
              const name = parts.length === 2 ? `${parts[1]} ${parts[0]}` : nameRaw;
              results.mayor.push({
                name,
                email: cells[1].innerText.trim(),
                phone: cells[2].innerText.trim(),
                website: verifiedWebsite(cells[1].innerText.trim(), name),
                nominationDate: cells[4].innerText.trim(),
                type: 'Mayor'
              });
            }
          }
        });
      }

      // 2. Scrape Councillors
      const tables = document.querySelectorAll('table[id^="councillorDT_w"]');
      tables.forEach(table => {
        const idMatch = table.id.match(/councillorDT_w(\d+)/);
        if (!idMatch) return;
        const wardId = idMatch[1];
        const wardCandidates = [];
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            const nameRaw = cells[0].innerText.trim();
            if (nameRaw && nameRaw !== 'No data available in table') {
              const parts = nameRaw.split(',').map(p => p.trim());
              const name = parts.length === 2 ? `${parts[1]} ${parts[0]}` : nameRaw;
              wardCandidates.push({
                name,
                email: cells[1].innerText.trim(),
                phone: cells[2].innerText.trim(),
                website: verifiedWebsite(cells[1].innerText.trim(), name),
                nominationDate: cells[4].innerText.trim(),
                type: 'Councillor'
              });
            }
          }
        });
        
        if (wardCandidates.length > 0) {
          results.wards[wardId] = wardCandidates;
        }
      });
      
      return results;
    });

    candidates.mayor = data.mayor;
    candidates.wards = data.wards;

    const dataDir = path.join(process.cwd(), 'public/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'candidates.json');
    fs.writeFileSync(filePath, JSON.stringify(candidates, null, 2));
    
    console.log(`Successfully scraped ${candidates.mayor.length} Mayor candidates and ${Object.keys(candidates.wards).length} wards.`);
    console.log(`Saved to: ${filePath}`);
    
  } catch (error) {
    console.error('Error scraping candidates:', error);
  } finally {
    await browser.close();
  }
}

scrapeCandidates();
