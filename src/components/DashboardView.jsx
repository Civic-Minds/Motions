import React, { useState, useMemo } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import MotionTable from './MotionTable';
import AlignmentHeatmap from './AlignmentHeatmap';
import ContestBoard from './ContestBoard';

const TOPICS = ['All', 'Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];

const TOPIC_PILL_STYLES = {
    All:     { active: 'bg-slate-800 text-white border-slate-800',        inactive: 'text-slate-500 border-slate-200 hover:border-slate-400' },
    Housing: { active: 'bg-blue-600 text-white border-blue-600',          inactive: 'text-blue-700 border-blue-200 hover:border-blue-400 bg-blue-50/50' },
    Transit: { active: 'bg-red-600 text-white border-red-600',            inactive: 'text-red-600 border-red-200 hover:border-red-400 bg-red-50/50' },
    Finance: { active: 'bg-emerald-600 text-white border-emerald-600',    inactive: 'text-emerald-700 border-emerald-200 hover:border-emerald-400 bg-emerald-50/50' },
    Parks:   { active: 'bg-green-600 text-white border-green-600',        inactive: 'text-green-700 border-green-200 hover:border-green-400 bg-green-50/50' },
    Climate: { active: 'bg-teal-600 text-white border-teal-600',          inactive: 'text-teal-700 border-teal-200 hover:border-teal-400 bg-teal-50/50' },
    General: { active: 'bg-slate-500 text-white border-slate-500',        inactive: 'text-slate-500 border-slate-200 hover:border-slate-400' },
};

const DashboardView = ({ motions, handleSelect }) => {
    const [topic, setTopic] = useState('All');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'notable'

    const filteredMotions = useMemo(() => {
        if (topic === 'All') return motions;
        return motions.filter(m => m.topic === topic);
    }, [motions, topic]);

    const substantive = useMemo(() => filteredMotions.filter(m => !m.trivial).length, [filteredMotions]);
    const procedural  = useMemo(() => filteredMotions.filter(m => m.trivial).length,  [filteredMotions]);
    const total       = filteredMotions.length;
    const substantivePct = total > 0 ? Math.round((substantive / total) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Topic filter pills */}
            <div className="flex gap-2 flex-wrap">
                {TOPICS.map(t => {
                    const isActive = topic === t;
                    const styles = TOPIC_PILL_STYLES[t];
                    return (
                        <button
                            key={t}
                            onClick={() => setTopic(t)}
                            className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border transition-colors ${isActive ? styles.active : styles.inactive}`}
                        >
                            {t}
                        </button>
                    );
                })}
            </div>

            {/* Stats grid */}
            <div className="stats-grid">
                <div className="card">
                    <div className="card-title">AGENDA BREAKDOWN</div>
                    <div className="flex-1 flex flex-col justify-center gap-4">
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-black text-slate-800">{substantive}</span>
                            <span className="text-sm text-slate-400 font-semibold pb-1">of {total} motions were substantive</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#004a99] rounded-l-full transition-all" style={{ width: `${substantivePct}%` }} />
                        </div>
                        <div className="flex gap-4 text-[11px] font-bold">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#004a99] inline-block" />
                                <span className="text-slate-600">{substantivePct}% substantive</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                                <span className="text-slate-400">{procedural} procedural / minor</span>
                            </span>
                        </div>
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

            {/* View toggle + content */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-500 border-slate-200 hover:border-slate-400'}`}
                    >
                        All Motions
                    </button>
                    <button
                        onClick={() => setViewMode('notable')}
                        className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border transition-colors ${viewMode === 'notable' ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-500 border-slate-200 hover:border-slate-400'}`}
                    >
                        Notable
                    </button>
                </div>

                {viewMode === 'list'
                    ? <MotionTable motions={filteredMotions} />
                    : <ContestBoard motions={filteredMotions} />
                }
            </div>
        </div>
    );
};

export default DashboardView;
