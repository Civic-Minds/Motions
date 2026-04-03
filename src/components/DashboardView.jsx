import React, { useMemo } from 'react';
import MotionTable from './MotionTable';

const DashboardView = ({ motions, handleSelect }) => {
    const filteredMotions = motions;

    const substantive = useMemo(() => filteredMotions.filter(m => !m.trivial).length, [filteredMotions]);
    const procedural  = useMemo(() => filteredMotions.filter(m => m.trivial).length,  [filteredMotions]);
    const total       = filteredMotions.length;
    const substantivePct = total > 0 ? Math.round((substantive / total) * 100) : 0;

    const adoptionRate = useMemo(() => {
        const nonTrivial = filteredMotions.filter(m => !m.trivial);
        const adopted = nonTrivial.filter(m => m.status === 'Adopted' || m.status.includes('Carried')).length;
        return nonTrivial.length > 0 ? Math.round((adopted / nonTrivial.length) * 100) : 0;
    }, [filteredMotions]);

    const topTopicData = useMemo(() => {
        const counts = filteredMotions.reduce((acc, m) => {
            if (!m.trivial && m.topic) acc[m.topic] = (acc[m.topic] || 0) + 1;
            return acc;
        }, {});
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return sorted ? { name: sorted[0], count: sorted[1] } : { name: 'GENERAL', count: 0 };
    }, [filteredMotions]);

    const topFiveTopics = useMemo(() => {
        const counts = filteredMotions.reduce((acc, m) => {
            if (!m.trivial && m.topic) acc[m.topic] = (acc[m.topic] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [filteredMotions]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Stats header row */}
            <div className="dashboard-stats-row">
                <div className="card-mainline border-l-4 border-l-slate-400">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-[#004a99] mb-2 opacity-60">Motions</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{total}</span>
                            <span className="text-[10px] text-slate-400 font-bold leading-tight">Items</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-end gap-3 max-w-[320px]">
                        <p className="text-[9px] font-black text-slate-400">Distribution by Topic</p>
                        <div className="w-full h-2 flex gap-1 rounded-full overflow-hidden bg-slate-100/50 p-0.5">
                            {topFiveTopics.map(([topic, count], i) => (
                                <div 
                                    key={topic} 
                                    title={`${topic}: ${count}`}
                                    style={{ width: `${(count / substantive) * 100}%` }}
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        i === 0 ? 'bg-[#004a99]' : 
                                        i === 1 ? 'bg-emerald-500' :
                                        i === 2 ? 'bg-amber-400' :
                                        i === 3 ? 'bg-rose-400' : 'bg-slate-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex flex-wrap justify-end gap-x-4 gap-y-1">
                            {topFiveTopics.slice(0, 3).map(([topic, count], i) => (
                                <div key={topic} className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        i === 0 ? 'bg-[#004a99]' : 
                                        i === 1 ? 'bg-emerald-500' : 'bg-amber-400'
                                    }`} />
                                    <span className="text-[9px] font-black text-slate-600">{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Substantive Focus */}
                <div className="card-mini border-l-4 border-l-[#004a99]">
                    <p className="text-[10px] font-black text-[#004a99] mb-4 opacity-60">Focus</p>
                    <div className="flex items-baseline justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-[#004a99] tracking-tighter leading-none">{substantive}</span>
                            <span className="text-[11px] font-bold text-slate-400">Core</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{substantivePct}%</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 px-0.5">
                        <span>{procedural} Procedural</span>
                        <span>{substantive} Global</span>
                    </div>
                </div>

                {/* 3. Adoption Efficiency */}
                <div className="card-mini border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-black text-emerald-600 mb-4 opacity-60">Adoption Rate</p>
                    <div className="flex items-baseline justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-emerald-600 tracking-tighter leading-none">{adoptionRate}%</span>
                        </div>
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <svg width="38" height="38" viewBox="0 0 40 40" className="transform -rotate-90">
                                <circle
                                    cx="20" cy="20" r="16"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    className="text-emerald-50/50"
                                />
                                <circle
                                    cx="20" cy="20" r="16"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={100.5}
                                    strokeDashoffset={100.5 - (adoptionRate / 100) * 100.5}
                                    strokeLinecap="round"
                                    className="text-emerald-500 transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400">
                            {adoptionRate > 60 ? 'High Adoption Rate' : adoptionRate > 30 ? 'Moderate Output' : 'Low Legislative Yield'}
                        </span>
                    </div>
                </div>

                {/* 4. Priority Topic */}
                <div className="card-mini border-l-4 border-l-amber-400">
                    <p className="text-[10px] font-black text-amber-600 mb-4 opacity-60">Domain</p>
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter leading-tight truncate">{topTopicData.name}</span>
                        <div className="inline-flex items-center justify-center p-2 bg-amber-50 rounded-xl border border-amber-100">
                             <span className="text-[9px] font-black text-amber-700">{topTopicData.count} Recorded Records</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="pt-2">
                <MotionTable motions={motions} handleSelect={handleSelect} />
            </div>
        </div>
    );
};

export default DashboardView;
