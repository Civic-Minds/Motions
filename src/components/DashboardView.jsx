import React, { useMemo } from 'react';
import { AlertCircle, Users as UsersIcon } from 'lucide-react';
import MotionTable from './MotionTable';
import AlignmentHeatmap from './AlignmentHeatmap';

const DashboardView = ({ motions, focusScore, handleSelect, topic }) => {
    const filteredMotions = useMemo(() => {
        if (!topic || topic === 'dashboard') return motions;
        return motions.filter(m => m.topic.toLowerCase() === topic.toLowerCase());
    }, [motions, topic]);

    return (
        <>
            <div className="stats-grid">
                <div className="card">
                    <div className="card-title">
                        TRIVIALITY SCORE
                        <AlertCircle size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                        <p className="text-sm font-semibold text-slate-600 mb-1">
                            Score: <span className={focusScore > 70 ? "text-emerald-700" : "text-amber-700"}>{focusScore}% Focus on Core</span>
                        </p>
                        <div className="score-bar-container mt-1">
                            <div className="score-bar-fill" style={{ width: `${focusScore}%`, backgroundColor: focusScore > 70 ? '#059669' : '#d97706' }}></div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                            <strong>Analysis:</strong> {focusScore > 75 ? "Council focus remains primarily on significant civic matters this session." : "A significant portion of this session was occupied by administrative or minor items."}
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">
                        MEMBER ALIGNMENT
                        <UsersIcon size={16} className="text-slate-400" />
                    </div>
                    <AlignmentHeatmap onSelect={handleSelect} motions={motions} />
                </div>
            </div>
            <MotionTable motions={filteredMotions} />
        </>
    );
};

export default DashboardView;
