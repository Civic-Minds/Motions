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
      wards: {},
      trustees: {}
    };

    const data = await page.evaluate(({ websitesByEmail, websitesByEmailDomain, websitesByCandidateName }) => {
      const verifiedWebsiteInPage = (email, name) => {
        const normalized = email?.trim().toLowerCase();
        return websitesByEmail[normalized]
          ?? websitesByEmailDomain[normalized?.split('@')[1]]
          ?? websitesByCandidateName[name]
          ?? null;
      };
      const isSocialLink = href => /facebook\.com|instagram\.com|x\.com|twitter\.com|tiktok\.com|youtube\.com|linkedin\.com|threads\.com/i.test(href || '');
      const normalizeLink = anchor => {
        const raw = anchor?.getAttribute('href')?.trim();
        if (!raw) return null;
        if (/^www\./i.test(raw)) return `https://${raw}`;
        return /^https?:\/\//i.test(raw) ? raw : null;
      };
      const connectLinks = cell => [...(cell?.querySelectorAll('a') || [])]
        .map(normalizeLink)
        .filter(Boolean);
      const candidateLinks = (connectCell, email, name) => {
        const links = connectLinks(connectCell);
        const verifiedWebsite = verifiedWebsiteInPage(email, name);
        const website = verifiedWebsite || links.find(link => !isSocialLink(link)) || null;
        const socials = [...new Set(links.filter(link => isSocialLink(link) && link !== website))];
        return { website, socials };
      };
      const results = {
        mayor: [],
        wards: {},
        trustees: {},
        withdrawn: []
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
              const links = candidateLinks(cells[3], cells[1].innerText.trim(), name);
              results.mayor.push({
                name,
                email: cells[1].innerText.trim(),
                phone: cells[2].innerText.trim(),
                ...links,
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
              const links = candidateLinks(cells[3], cells[1].innerText.trim(), name);
              wardCandidates.push({
                name,
                email: cells[1].innerText.trim(),
                phone: cells[2].innerText.trim(),
                ...links,
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

      // 3. Scrape school-board trustees. These wards have different
      // boundaries from municipal wards, so preserve the board and ward.
      const trusteeBoards = {
        tdsb: 'tdsbDT_w',
        tdcsb: 'tdcsbDT_w',
        csv: 'csvDT_w',
        cscm: 'cscmDT_w'
      };
      Object.entries(trusteeBoards).forEach(([board, prefix]) => {
        const boardWards = {};
        document.querySelectorAll(`table[id^="${prefix}"]`).forEach(table => {
          const idMatch = table.id.match(new RegExp(`${prefix}(\\d+)`));
          if (!idMatch) return;
          const wardId = idMatch[1];
          const wardCandidates = [];
          table.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;
            const nameRaw = cells[0].innerText.trim();
            if (!nameRaw || nameRaw === 'No data available in table') return;
            const parts = nameRaw.split(',').map(p => p.trim());
            const name = parts.length === 2 ? `${parts[1]} ${parts[0]}` : nameRaw;
            const links = candidateLinks(cells[3], cells[1].innerText.trim(), name);
            wardCandidates.push({
              name,
              email: cells[1].innerText.trim(),
              phone: cells[2].innerText.trim(),
              ...links,
              nominationDate: cells[4].innerText.trim(),
              type: 'Trustee',
              board,
              trusteeWard: wardId
            });
          });
          if (wardCandidates.length > 0) boardWards[wardId] = wardCandidates;
        });
        results.trustees[board] = boardWards;
      });

      // Keep withdrawals separately: a candidate can withdraw from one race
      // and file in another, as with a councillor changing city wards.
      document.querySelectorAll('#withdrawnCandidatesDT tbody tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return;
        const nameRaw = cells[0].innerText.trim();
        const office = cells[1].innerText.trim();
        const wardRaw = cells[2].innerText.trim();
        const parts = nameRaw.split(',').map(p => p.trim());
        const name = parts.length === 2 ? `${parts[1]} ${parts[0]}` : nameRaw;
        results.withdrawn.push({
          name,
          office,
          wardId: wardRaw.match(/^(\d+)/)?.[1] || null,
          withdrawalDate: cells[3].innerText.trim(),
          contact: cells[5]?.innerText.trim() || ''
        });
      });
      
      return results;
    }, {
      websitesByEmail: VERIFIED_WEBSITES_BY_EMAIL,
      websitesByEmailDomain: VERIFIED_WEBSITES_BY_EMAIL_DOMAIN,
      websitesByCandidateName: VERIFIED_WEBSITES_BY_CANDIDATE_NAME
    });

    candidates.withdrawn = data.withdrawn;

    const normalizeName = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const withdrawnKeys = new Set(data.withdrawn.map(item =>
      `${normalizeName(item.name)}|${item.office}|${item.wardId || ''}`
    ));
    const isWithdrawn = (candidate, office, wardId = '') =>
      withdrawnKeys.has(`${normalizeName(candidate.name)}|${office}|${wardId}`);

    candidates.mayor = data.mayor.filter(candidate => !isWithdrawn(candidate, 'Mayor'));
    candidates.wards = Object.fromEntries(
      Object.entries(data.wards).map(([wardId, wardCandidates]) => [
        wardId,
        wardCandidates.filter(candidate => !isWithdrawn(candidate, 'Councillor', wardId))
      ])
    );
    const trusteeOfficeNames = {
      tdsb: 'Toronto District School Board',
      tdcsb: 'Toronto Catholic District School Board',
      csv: 'Conseil scolaire Viamonde',
      cscm: 'Conseil scolaire catholique MonAvenir'
    };
    candidates.trustees = Object.fromEntries(
      Object.entries(data.trustees).map(([board, wards]) => [
        board,
        Object.fromEntries(Object.entries(wards).map(([wardId, wardCandidates]) => [
          wardId,
          wardCandidates.filter(candidate => !isWithdrawn(candidate, trusteeOfficeNames[board], wardId))
        ]))
      ])
    );

    const dataDir = path.join(process.cwd(), 'public/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, 'candidates.json');
    fs.writeFileSync(filePath, JSON.stringify(candidates, null, 2));
    
    const trusteeCount = Object.values(candidates.trustees).reduce((total, wards) => total + Object.values(wards).flat().length, 0);
    console.log(`Successfully scraped ${candidates.mayor.length} Mayor candidates, ${Object.keys(candidates.wards).length} councillor wards, and ${trusteeCount} trustee candidates.`);
    console.log(`Saved to: ${filePath}`);
    
  } catch (error) {
    console.error('Error scraping candidates:', error);
  } finally {
    await browser.close();
  }
}

scrapeCandidates();
