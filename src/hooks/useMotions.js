import { useState, useEffect, useMemo } from 'react';
import { calculateTrivialityMetrics } from '../utils/analytics';
import { cleanVancouverTitle } from '../utils/motionTitle';

const MOTION_TOPIC_OVERRIDES = {
    'CC42.2': 'General',
};

/**
 * Custom hook to manage motions data and derived metrics.
 */
export function useMotions(jurisdiction = { id: 'toronto', dataBaseEnv: 'VITE_BLOB_BASE_URL', localDataPath: '/data' }) {
    const [motions, setMotions] = useState([]);
    const [councillors, setCouncillors] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const retry = () => {
        setLoading(true);
        setError(null);
        setRetryCount(c => c + 1);
    };

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            const configuredBase = import.meta.env[jurisdiction.dataBaseEnv];
            const base = configuredBase || (
                jurisdiction.id !== 'toronto' && !import.meta.env.DEV && import.meta.env.VITE_BLOB_BASE_URL
                    ? `${import.meta.env.VITE_BLOB_BASE_URL}/${jurisdiction.id}`
                    : jurisdiction.localDataPath
            );
            const dataUrl = file => import.meta.env.DEV
                ? `${base}/${file}`
                : `/api/data?jurisdiction=${jurisdiction.id}&file=${file}`;
            const motionsUrl     = dataUrl('motions.json');
            const meetingsUrl    = dataUrl('meetings.json');
            const councillorsUrl = dataUrl('councillors.json');
            const metadataUrl    = dataUrl('metadata.json');

            // meetings.json is the full historical meeting list (~300KB gzipped) but
            // only the Dashboard's "next upcoming meeting" card needs it on first
            // paint — fetch it in the background instead of blocking `loading`.
            fetch(meetingsUrl)
                .then(res => res.ok ? res.json() : [])
                .then(meetingsData => { if (isMounted) setMeetings(meetingsData); })
                .catch(err => console.error('Error loading meetings:', err));

            // A flaky connection can return a 200 with an HTML error/captive-portal
            // page instead of JSON — .json() then throws a cryptic "Unexpected
            // token '<'" SyntaxError. Give that case a message people can act on.
            const readJson = async res => {
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch {
                    throw new Error('Got an unexpected response instead of data — this usually means the connection dropped mid-request.');
                }
            };

            try {
                const [motionsRes, councillorsRes, metadataRes] = await Promise.all([
                    fetch(motionsUrl),
                    fetch(councillorsUrl),
                    fetch(metadataUrl),
                ]);
                if (!motionsRes.ok) throw new Error('Failed to fetch data');
                const [motionsData, councillorsData, metadataData] = await Promise.all([
                    readJson(motionsRes),
                    councillorsRes.ok ? readJson(councillorsRes) : Promise.resolve([]),
                    metadataRes.ok ? readJson(metadataRes) : Promise.resolve(null),
                ]);

                if (isMounted) {
                    setMotions(motionsData.map(motion => {
                        const normalized = jurisdiction.id === 'vancouver'
                            ? { ...motion, title: cleanVancouverTitle(motion.title, motion.id) }
                            : motion;
                        return MOTION_TOPIC_OVERRIDES[motion.id]
                            ? { ...normalized, topic: MOTION_TOPIC_OVERRIDES[motion.id] }
                            : normalized;
                    }));
                    setCouncillors(councillorsData);
                    setMetadata(metadataData);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
                console.error('Error loading motions:', err);
            }
        }

        loadData();
        return () => { isMounted = false; };
    }, [jurisdiction.id, jurisdiction.dataBaseEnv, jurisdiction.localDataPath, retryCount]);

    const metrics = useMemo(() => {
        return calculateTrivialityMetrics(motions);
    }, [motions]);

    return {
        motions,
        councillors,
        meetings,
        metadata,
        loading,
        error,
        retry,
        metrics,
    };
}
