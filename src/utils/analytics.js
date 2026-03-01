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

    if (totalCount === 0) return 75; // Default/baseline score

    const consensusVotes = relevantMotions.filter(m => {
        const yesCount = Object.values(m.votes).filter(v => v === 'YES').length;
        const totalVotes = Object.keys(m.votes).length;
        const majorityVote = yesCount > (totalVotes / 2) ? 'YES' : 'NO';
        return m.votes[memberName] === majorityVote;
    }).length;

    return Math.floor((consensusVotes / totalCount) * 100);
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
