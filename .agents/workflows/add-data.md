---
description: How to add new Council data to the dashboard
---

To add data from a new City Council meeting or a specific agenda item, you can use the automated scraper. You do not need to manually edit the JSON files.

### 1. Identify the Item ID
Find the item on the [Toronto TMMIS](https://secure.toronto.ca/council/meetings/council.do) site.
Format: `YEAR.ITEM_CODE.ID` (e.g., `2026.CC38.1`)

### 2. Run the Scraper
Open your terminal and run the following command:

```bash
node scripts/fetch_motions.js [ITEM_ID]
```

**Example:**
```bash
node scripts/fetch_motions.js 2026.CC37.3
```

### 3. What the Scraper Automates:
- **Details**: Fetches the title, mover, seconder, and current status.
- **Voting DNA**: Automatically parses the voting tables on the page to populate the alignment heatmaps.
- **Topic Tagging**: Scans for keywords (*Housing*, *Transit*, *Budget*) to categorize the item.
- **Triviality Score**: Detects routine procedural items (*Confirmatory By-laws*, *Petitions*) vs. high-impact policy.
- **Ward Impact**: Scans the title and details for ward names or local landmarks to map the geographical impact.

### 4. Customizing Automation
If the scraper isn't tagging a ward or topic correctly, you can add new keywords to the maps in `scripts/fetch_motions.js`.

// turbo
5. Refresh your browser to see the new data reflected in the dashboard.
