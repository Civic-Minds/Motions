/**
 * Review location signals across every Winnipeg motion without geocoding or
 * guessing. This is intentionally separate from the eventual geocoder:
 * every record receives a review status and every candidate is visible for
 * human confirmation first.
 */

import fs from 'node:fs';
import path from 'node:path';
import { locationsFromWinnipegTitle } from './lib/winnipegGeocoding.js';
import { WINNIPEG_LOCATION_OVERRIDES } from './lib/winnipegLocationOverrides.js';

/* global process */

const DATA_DIR = path.join(process.cwd(), 'public/data/winnipeg');
const DATA_PATH = path.join(DATA_DIR, 'motions.json');
const REPORT_PATH = path.join(process.cwd(), 'scripts/cache/winnipeg-location-review.json');
const motions = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const records = motions.map(motion => {
    const candidates = locationsFromWinnipegTitle(motion.title);
    const acceptedLocations = WINNIPEG_LOCATION_OVERRIDES[motion.id] ?? [];
    return {
        id: motion.id,
        title: motion.title,
        sourceUrl: motion.sourceUrl,
        candidates,
        acceptedLocations,
        status: acceptedLocations.length ? 'reviewed-location' : candidates.length ? 'needs-human-review' : 'reviewed-no-location-signal',
    };
});

for (const [index, motion] of motions.entries()) {
    const review = records[index];
    if (review.candidates.length) motion.locationCandidates = review.candidates;
    else delete motion.locationCandidates;
    if (review.acceptedLocations.length) motion.locations = review.acceptedLocations;
    else delete motion.locations;
}

const report = {
    generatedAt: new Date().toISOString(),
    totalMotions: records.length,
    recordsReviewed: records.length,
    recordsWithCandidates: records.filter(record => record.candidates.length).length,
    recordsWithoutLocationSignal: records.filter(record => !record.candidates.length).length,
    recordsWithAcceptedLocations: motions.filter(motion => motion.locations?.length).length,
    records,
};
fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(DATA_PATH, `${JSON.stringify(motions, null, 2)}\n`);
console.log(`Reviewed ${records.length.toLocaleString()} Winnipeg motions for location signals.`);
console.log(`Candidates needing human review: ${report.recordsWithCandidates.toLocaleString()}`);
console.log(`No location signal: ${report.recordsWithoutLocationSignal.toLocaleString()}`);
console.log(`Report: ${REPORT_PATH}`);
