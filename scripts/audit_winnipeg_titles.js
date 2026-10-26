/** Report title normalization issues across every imported Winnipeg motion. */

import fs from 'node:fs';
import path from 'node:path';
import { findWinnipegTitleIssues, normalizeWinnipegTitle } from './lib/winnipegTitle.js';

/* global process */

const DATA_PATH = path.join(process.cwd(), 'public/data/winnipeg/motions.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const issues = [];

for (const motion of motions) {
    const normalized = normalizeWinnipegTitle(motion.sourceTitle ?? motion.title, motion.id.replace(/^wpg-/, ''));
    const found = findWinnipegTitleIssues(normalized.sourceTitle, normalized.title);
    const blockingIssues = found.filter(issue => issue !== 'leading-number');
    if (blockingIssues.length || normalized.title !== motion.title) {
        issues.push({ id: motion.id, issues: found, blockingIssues, sourceTitle: normalized.sourceTitle, title: normalized.title, sourceUrl: motion.sourceUrl });
    }
}

const report = {
    generatedAt: new Date().toISOString(),
    totalMotions: motions.length,
    recordsReviewed: motions.length,
    recordsWithNormalization: issues.length,
    recordsWithBlockingIssues: issues.filter(record => record.blockingIssues.length).length,
    issues,
};
const reportPath = path.join(process.cwd(), 'scripts/cache/winnipeg-title-audit.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Reviewed ${motions.length.toLocaleString()} Winnipeg titles.`);
console.log(`Found ${issues.length.toLocaleString()} records requiring normalization or manual review.`);
console.log(`Report: ${reportPath}`);
