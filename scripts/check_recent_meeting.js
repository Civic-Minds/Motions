// Exits writing 'true' if a meeting occurred in the last WINDOW_DAYS days, 'false' otherwise.
// Fails open (writes 'true') if the meetings feed can't be fetched.
/* global process */
const BLOB_BASE = 'https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com';
const WINDOW_DAYS = 8;

const meetingUrls = [`${BLOB_BASE}/meetings.json`, `${BLOB_BASE}/vancouver/meetings.json`];
const responses = await Promise.all(meetingUrls.map(url => fetch(url).catch(() => null)));
if (responses.every(res => !res?.ok)) {
    process.stdout.write('true'); // fail open — run the pipeline if we can't check
    process.exit(0);
}

const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
const today = new Date();

const recent = (await Promise.all(responses.map(async res => res?.ok ? res.json() : [])))
    .flat()
    .some(m => {
        const d = new Date(m.date);
        return d >= cutoff && d <= today;
    });

process.stdout.write(recent ? 'true' : 'false');
