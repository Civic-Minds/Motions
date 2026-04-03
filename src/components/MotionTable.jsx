import React, { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';

const TOPIC_STYLES = {
    Housing: 'text-blue-600',
    Transit: 'text-rose-600',
    Finance: 'text-emerald-600',
    General: 'text-slate-500',
};

const MotionCard = ({ motion }) => {
    const isAdopted = motion.status === 'Adopted' || motion.status.includes('Carried');
    const isDefeated = motion.status === 'Defeated';
    
    const votes = motion.votes ? Object.values(motion.votes) : [];
    const yes = votes.filter(v => v === 'YES').length;
    const no = votes.filter(v => v === 'NO').length;
    const total = yes + no;
    const yesPct = total > 0 ? (yes / total) * 100 : 0;

    return (
        <div className="pulse-card-premium group">
            <div className="flex items-center p-6 gap-12 relative overflow-hidden">
                {/* 1. Category Module */}
                <div className="flex flex-col w-[120px] shrink-0 gap-0.5">
                    <p className="pulse-label mb-1 opacity-60">Category</p>
                    <div className="flex flex-col">
                        <span className={`text-[14px] font-black tracking-tight leading-tight truncate ${TOPIC_STYLES[motion.topic] || TOPIC_STYLES.General}`}>
                            {motion.topic || 'General'}
                        </span>
                        <span className="text-[9.5px] font-mono font-black text-slate-400 leading-none mt-1 opacity-80">
                            ID: {motion.id}
                        </span>
                    </div>
                </div>

                {/* 2. Motion Title Header */}
                <div className="flex-1 min-w-0 border-l border-slate-100 pl-10">
                    <h3 className="text-[17px] font-bold text-slate-900 leading-tight tracking-tight group-hover:text-[#004a99] transition-colors line-clamp-1 pr-6 underline-offset-4 group-hover:underline">
                        {motion.title}
                    </h3>
                    {motion.significance > 15 && (
                        <div className="flex items-center gap-2 mt-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                             <span className="text-[9px] font-black text-slate-400 leading-none">High Legislative Impact</span>
                        </div>
                    )}
                </div>

                {/* 3. Vote Breakdown */}
                <div className="w-[200px] shrink-0 space-y-3">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="pulse-label">Vote Breakdown</span>
                        <span className="text-[11px] font-black text-slate-900 font-mono leading-none">{yes} / {no}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[1px_0_4px_rgba(16,185,129,0.3)]" style={{ width: `${yesPct}%` }} />
                        <div className="h-full bg-rose-400 rounded-full transition-all duration-1000" style={{ width: `${100 - yesPct}%` }} />
                    </div>
                </div>

                {/* 4. Outcome */}
                <div className="w-[160px] shrink-0 text-right pr-4">
                    <span className="pulse-label mb-1.5 block">Outcome</span>
                    <span className={`text-[22px] font-black tracking-tighter block leading-none ${
                        isAdopted ? 'text-emerald-500' : isDefeated ? 'text-rose-500' : 'text-slate-400'
                    }`}>
                        {motion.status}
                    </span>
                </div>

                {/* 5. Execution Protocol */}
                <div className="shrink-0">
                    {motion.url && (
                        <a 
                            href={motion.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-14 h-14 rounded-[24px] border border-slate-100 flex items-center justify-center text-slate-300 hover:bg-[#004a99] hover:text-white hover:border-[#004a99] hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-white"
                        >
                            <ExternalLink size={20} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const MotionTable = ({ motions }) => {
    const [visibleRows, setVisibleRows] = useState(20);

    return (
        <div className="space-y-12 mt-16 max-w-[1400px] mx-auto pb-40">
            {/* Standardized Pulse Stream Header */}
            <header className="flex items-end justify-between px-6 border-b border-slate-100 pb-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <span className="text-[52px] font-black text-slate-900 tracking-tighter leading-none">{motions.length}</span>
                        <h2 className="pulse-label">Council Records</h2>
                    </div>
                </div>

                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{motions.length} Motions found</span>
                </div>
            </header>

            <div className="grid gap-6 px-2">
                {motions.slice(0, visibleRows).map((motion) => (
                    <MotionCard key={motion.id} motion={motion} />
                ))}
            </div>

            {visibleRows < motions.length && (
                <div className="flex justify-center pt-8 pb-32">
                    <button
                        onClick={() => setVisibleRows(prev => prev + 20)}
                        className="group flex flex-col items-center gap-4 active:scale-95 transition-all"
                    >
                        <span className="text-[12px] font-black text-[#004a99] group-hover:underline transition-all">Show More Records</span>
                        <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-[#004a99] group-hover:border-[#004a99] group-hover:bg-slate-50 group-hover:shadow-lg transition-all">
                             <ChevronDown size={32} strokeWidth={2.5} />
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MotionTable;
