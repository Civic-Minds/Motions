/**
 * Analytics utilities for Toronto Council motions.
 */

import { TORONTO_WARDS } from '../constants/wards';

/**
 * Calculates the triviality score and focus score.
 * @param {Array} motions 
 * @returns {Object} { trivialCount, totalCount, trivialPercentage, focusScore }
 */
export function calculateTrivialityMetrics(motions) {
    const totalCount = motions.length;
    const trivialCount = motions.filter(m => m.trivial).length;
    const trivialPercentage = totalCount > 0 ? Math.floor((trivialCount / totalCount) * 100) : 0;
    const focusScore = 100 - trivialPercentage;

    return {
        trivialCount,
        totalCount,
        trivialPercentage,
        focusScore
    };
}

/**
 * Calculates member alignment based on consensus voting.
 * @param {Array} motions 
 * @param {string} memberName 
 * @returns {number} Alignment percentage score
 */
export function getMemberAlignmentScore(motions, memberName) {
    const relevantMotions = motions.filter(m => m.votes && m.votes[memberName]);
    const totalCount = relevantMotions.length;

    if (totalCount === 0) return null;

    const consensusVotes = relevantMotions.filter(m => {
        const yesCount = Object.values(m.votes).filter(v => v === 'YES').length;
        const totalVotes = Object.keys(m.votes).length;
        const majorityVote = yesCount > (totalVotes / 2) ? 'YES' : 'NO';
        return m.votes[memberName] === majorityVote;
    }).length;

    return Math.floor((consensusVotes / totalCount) * 100);
}

/**
 * Calculates meeting day attendance for a councillor.
 * A councillor is considered present on a given day if they cast at least one YES or NO vote.
 * @param {Array} motions
 * @param {string} memberName
 * @returns {{ daysPresent: number, totalDays: number, pct: number }}
 */
export function getAttendance(motions, memberName) {
    const allDates = [...new Set(motions.filter(m => m.votes).map(m => m.date))];
    const totalDays = allDates.length;
    const daysPresent = allDates.filter(date => {
        return motions
            .filter(m => m.date === date && m.votes && m.votes[memberName])
            .some(m => m.votes[memberName] === 'YES' || m.votes[memberName] === 'NO');
    }).length;
    const pct = totalDays > 0 ? Math.round((daysPresent / totalDays) * 100) : 0;
    return { daysPresent, totalDays, pct };
}

/**
 * Returns the councillors this member agrees with most (and least) often.
 * Only counts non-trivial motions where both councillors voted YES or NO.
 * @param {Array} motions
 * @param {string} memberName
 * @param {number} minShared - minimum shared votes to include a pairing
 * @returns {Array} [{ name, pct, shared }] sorted by pct desc
 */
export function getVotedWith(motions, memberName, minShared = 10) {
    const peerCounts = {};
    const sharedCounts = {};

    motions.forEach(m => {
        if (m.trivial || !m.votes || !m.votes[memberName]) return;
        const myVote = m.votes[memberName];
        if (myVote !== 'YES' && myVote !== 'NO') return;

        Object.entries(m.votes).forEach(([peer, peerVote]) => {
            if (peer === memberName) return;
            if (peerVote !== 'YES' && peerVote !== 'NO') return;
            peerCounts[peer] = (peerCounts[peer] || 0) + 1;
            if (peerVote === myVote) sharedCounts[peer] = (sharedCounts[peer] || 0) + 1;
        });
    });

    return Object.entries(peerCounts)
        .filter(([, total]) => total >= minShared)
        .map(([name, total]) => ({
            name,
            pct: Math.round(((sharedCounts[name] || 0) / total) * 100),
            shared: total,
        }))
        .sort((a, b) => b.pct - a.pct);
}

/**
 * Calculates activity metrics per ward.
 * @param {Array} motions
 * @returns {Array} Array of ward objects with activity counts
 */
export function getWardActivityMetrics(motions) {
    return TORONTO_WARDS.map(ward => {
        const wardMotions = motions.filter(m => m.ward === ward.id);
        const impactCount = wardMotions.filter(m => !m.trivial).length;
        return {
            ...ward,
            count: wardMotions.length,
            impactCount
        };
    });
}
