import { useState, useEffect, useMemo } from 'react';
import { calculateTrivialityMetrics } from '../utils/analytics';

/**
 * Custom hook to manage motions data and derived metrics.
 */
export function useMotions() {
    const [motions, setMotions] = useState([]);
    const [councillors, setCouncillors] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            try {
                const [motionsRes, councillorsRes, meetingsRes] = await Promise.all([
                    fetch('/data/motions.json'),
                    fetch('/data/councillors.json'),
                    fetch('/data/meetings.json'),
                ]);
                if (!motionsRes.ok) throw new Error('Failed to fetch data');
                const [motionsData, councillorsData, meetingsData] = await Promise.all([
                    motionsRes.json(),
                    councillorsRes.ok ? councillorsRes.json() : Promise.resolve([]),
                    meetingsRes.ok ? meetingsRes.json() : Promise.resolve([]),
                ]);

                if (isMounted) {
                    setMotions(motionsData);
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
    }, []);

    const metrics = useMemo(() => {
        return calculateTrivialityMetrics(motions);
    }, [motions]);

    return {
        motions,
        councillors,
        meetings,
        loading,
        error,
        ...metrics
    };
}
