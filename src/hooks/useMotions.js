import { useState, useEffect, useMemo } from 'react';
import { calculateTrivialityMetrics } from '../utils/analytics';

/**
 * Custom hook to manage motions data and derived metrics.
 */
export function useMotions() {
    const [motions, setMotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadData() {
            try {
                const response = await fetch('/data/motions.json');
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();

                if (isMounted) {
                    setMotions(data);
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
        loading,
        error,
        ...metrics
    };
}
