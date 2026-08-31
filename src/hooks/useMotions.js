import { useState, useEffect, useMemo } from 'react';
import { calculateTrivialityMetrics } from '../utils/analytics';

const MOTION_TOPIC_OVERRIDES = {
    'CC42.2': 'General',
};

function cleanVancouverTitle(title) {
    return title.trim()
        .replace(/^(?:\d+[a-z]?[.)]|[A-Z]{1,8}\d+[a-z]?(?:[.)]|\s+)|Motion\s+\d+[.)]?|CD-1)\s*/i, '')
        .trim();
}

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
            const dataUrl = file => import.meta.env.DEV
                ? `${base}/${file}`
                : `/api/data?jurisdiction=${jurisdiction.id}&file=${file}`;
            const motionsUrl     = dataUrl('motions.json');
            const meetingsUrl    = dataUrl('meetings.json');
            const councillorsUrl = dataUrl('councillors.json');
            const metadataUrl    = dataUrl('metadata.json');
            try {
                const [motionsRes, councillorsRes, meetingsRes, metadataRes] = await Promise.all([
                    fetch(motionsUrl),
                    fetch(councillorsUrl),
                    fetch(meetingsUrl),
                    fetch(metadataUrl),
                ]);
                if (!motionsRes.ok) throw new Error('Failed to fetch data');
                const [motionsData, councillorsData, meetingsData, metadataData] = await Promise.all([
                    motionsRes.json(),
                    councillorsRes.ok ? councillorsRes.json() : Promise.resolve([]),
                    meetingsRes.ok ? meetingsRes.json() : Promise.resolve([]),
                    metadataRes.ok ? metadataRes.json() : Promise.resolve(null),
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
    }, [jurisdiction.id, jurisdiction.localDataPath]);

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
        metrics,
    };
}
