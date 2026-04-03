import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { getAttendance } from '../utils/analytics';
import { TOPIC_PILL } from '../constants/data';

const ProfilePanel = ({ selected, onClose, onCompare, motions }) => {
    const isOpen = !!selected;

    const dna = useMemo(() => {
        if (!selected) return [];
        const topics = ['Housing', 'Transit', 'Finance', 'Parks', 'Climate', 'General'];
        return topics
            .map(topic => {
                const relevant = motions.filter(m => m.topic === topic && m.votes && m.votes[selected]);
                const total = relevant.length;
                const yes = relevant.filter(m => m.votes[selected] === 'YES').length;
                const yesPct = total > 0 ? Math.round((yes / total) * 100) : null;
                return { topic, yesPct, total };
            })
            .filter(d => d.total >= 3); // only show topics with enough data
    }, [selected, motions]);

    const voteHistory = useMemo(() => {
        if (!selected) return [];
        return motions
            .filter(m => m.votes && m.votes[selected] && !m.trivial)
            .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
            .slice(0, 20);
    }, [selected, motions]);

    const totalVotes = useMemo(() => {
        if (!selected) return 0;
        return motions.filter(m => m.votes && m.votes[selected]).length;
    }, [selected, motions]);

    const attendance = useMemo(() => {
        if (!selected) return null;
        return getAttendance(motions, selected);
    }, [selected, motions]);

    return (
        <div className={`profile-panel ${isOpen ? 'open' : ''}`}>
            <div className="profile-header flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                        {selected || 'Profile'}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Toronto City Council
                    </p>
                    {attendance && (
                        <div className="flex gap-3 mt-3">
                            <div className="text-center">
                                <div className="text-lg font-black text-slate-800">{totalVotes}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase">votes cast</div>
                            </div>
                            <div className="w-px bg-slate-200" />
                            <div className="text-center">
                                <div className={`text-lg font-black ${attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {attendance.daysPresent}/{attendance.totalDays}
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase">meeting days</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-lg font-black ${attendance.pct >= 90 ? 'text-emerald-600' : attendance.pct >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {attendance.pct}%
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase">attendance</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onCompare(selected)}
                        className="px-3 py-1.5 bg-toronto-blue text-white text-[10px] font-bold rounded-lg hover:bg-blue-800 transition-colors uppercase tracking-wider"
                    >
                        Versus Mode
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronRight size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="profile-content">
                {/* Voting DNA */}
                {dna.length > 0 && (
                    <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Voting DNA</h3>
                        <div className="space-y-4">
                            {dna.map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[11px] font-bold text-slate-700">{item.topic}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-slate-400 font-bold">{item.total} votes</span>
                                            <span className={`text-[10px] font-black ${item.yesPct >= 50 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {item.yesPct}% YES
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-emerald-500" style={{ width: `${item.yesPct}%` }}></div>
                                        <div className="h-full bg-rose-500" style={{ width: `${100 - item.yesPct}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Voting history — top 20 by significance */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        Notable Votes <span className="text-slate-300 font-bold normal-case">· by significance</span>
                    </h3>
                    <div className="space-y-3">
                        {voteHistory.map((m, i) => {
                            const vote = m.votes[selected];
                            return (
                                <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:border-[#004a99] transition-all bg-white group">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${TOPIC_PILL[m.topic] || TOPIC_PILL.General}`}>
                                                {m.topic}
                                            </span>
                                            {m.significance != null && (
                                                <span className="text-[9px] text-slate-300 font-bold">{m.significance}</span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                            vote === 'YES' ? 'text-emerald-600 bg-emerald-50' :
                                            vote === 'NO'  ? 'text-rose-500 bg-rose-50' :
                                                             'text-amber-600 bg-amber-50'
                                        }`}>
                                            {vote}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-[#004a99] transition-colors">
                                        {m.title}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase">{m.date}</p>
                                </div>
                            );
                        })}
                        {voteHistory.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic">No notable votes found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePanel;
