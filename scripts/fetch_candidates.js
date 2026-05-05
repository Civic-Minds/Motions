import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const URL = 'https://www.toronto.ca/city-government/elections/candidate-list/';

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
