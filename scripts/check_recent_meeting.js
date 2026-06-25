// Exits writing 'true' if a meeting occurred in the last WINDOW_DAYS days, 'false' otherwise.
// Fails open (writes 'true') if the meetings feed can't be fetched.
const BLOB_BASE = 'https://qcbqayy3ivvb6sia.public.blob.vercel-storage.com';
const WINDOW_DAYS = 8;

const res = await fetch(`${BLOB_BASE}/meetings.json`).catch(() => null);
if (!res?.ok) {
    process.stdout.write('true'); // fail open — run the pipeline if we can't check
    process.exit(0);
}

const meetings = await res.json();
const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
const today = new Date();

const recent = meetings.some(m => {
    const d = new Date(m.date);
    return d >= cutoff && d <= today;
});

process.stdout.write(recent ? 'true' : 'false');
