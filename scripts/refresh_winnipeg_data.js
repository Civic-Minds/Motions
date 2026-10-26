/** Refresh, review, and validate Winnipeg's local data without publishing it. */

import { execFileSync } from 'node:child_process';

/* global process */

const steps = [
    ['import_winnipeg_data.js', []],
    ['audit_winnipeg_titles.js', []],
    ['review_winnipeg_locations.js', []],
    ['validate_winnipeg_data.js', []],
];

for (const [script, args] of steps) {
    console.log(`\n> node scripts/${script}`);
    execFileSync(process.execPath, [`scripts/${script}`, ...args], { stdio: 'inherit' });
}
