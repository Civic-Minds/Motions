import { useState, useEffect, useMemo } from 'react';
import { calculateTrivialityMetrics } from '../utils/analytics';

const MOTION_TOPIC_OVERRIDES = {
    'CC42.2': 'General',
};

function cleanVancouverTitle(title) {
    return title.trim()
        .replace(/^(?:\d+[a-z]?[.)]|[A-Z]{1,8}\d+[a-z]?(?:[.)]|\s+))\s*/i, '')
        .trim();
}

/**
 * Custom hook to manage motions data and derived metrics.
 */
export function useMotions(jurisdiction = { id: 'toronto', dataBaseEnv: 'VITE_BLOB_BASE_URL', localDataPath: '/data' }) {
    const [motions, setMotions] = useState([]);
    const [councillors, setCouncillors] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            const configuredBase = jurisdiction.id === 'vancouver'
                ? import.meta.env.VITE_VANCOUVER_DATA_BASE_URL
                : import.meta.env.VITE_BLOB_BASE_URL;
            const base = configuredBase || (
                jurisdiction.id === 'vancouver' && !import.meta.env.DEV && import.meta.env.VITE_BLOB_BASE_URL
                    ? `${import.meta.env.VITE_BLOB_BASE_URL}/vancouver`
                    : jurisdiction.localDataPath
            );
            const motionsUrl     = `${base}/motions.json`;
            const meetingsUrl    = `${base}/meetings.json`;
            const councillorsUrl = `${base}/councillors.json`;
            try {
                const [motionsRes, councillorsRes, meetingsRes] = await Promise.all([
                    fetch(motionsUrl),
                    fetch(councillorsUrl),
                    fetch(meetingsUrl),
                ]);
                if (!motionsRes.ok) throw new Error('Failed to fetch data');
                const [motionsData, councillorsData, meetingsData] = await Promise.all([
                    motionsRes.json(),
                    councillorsRes.ok ? councillorsRes.json() : Promise.resolve([]),
                    meetingsRes.ok ? meetingsRes.json() : Promise.resolve([]),
                ]);

                if (isMounted) {
                    setMotions(motionsData.map(motion => {
                        const normalized = jurisdiction.id === 'vancouver'
                            ? { ...motion, title: cleanVancouverTitle(motion.title) }
                            : motion;
                        return MOTION_TOPIC_OVERRIDES[motion.id]
                            ? { ...normalized, topic: MOTION_TOPIC_OVERRIDES[motion.id] }
                            : normalized;
                    }));
                    setCouncillors(councillorsData);
                    setMeetings(meetingsData);
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
    }, [jurisdiction.id, jurisdiction.localDataPath]);

    const metrics = useMemo(() => {
        return calculateTrivialityMetrics(motions);
    }, [motions]);

    return {
        motions,
        councillors,
        meetings,
        loading,
        error,
        metrics,
    };
}
