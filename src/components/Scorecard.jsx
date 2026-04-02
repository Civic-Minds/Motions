import React from 'react';
import { Target, AlertCircle, FileText, TrendingUp, UserMinus } from 'lucide-react';
import { COUNCILLORS } from '../constants/data';

const Scorecard = ({ motions }) => {
    // Calculate Stats
    const totalMotions = motions.length;
    const trivialMotions = motions.filter(m => m.trivial).length;
    const trivialPercentage = totalMotions > 0 ? Math.floor((trivialMotions / totalMotions) * 100) : 0;

    const majorWins = motions
        .filter(m => !m.trivial && m.status === 'Adopted')
        .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0))
        .slice(0, 15);

    // Efficiency: % of non-trivial motions that passed
    const nonTrivial = motions.filter(m => !m.trivial);
    const passed = nonTrivial.filter(m => m.status === 'Adopted' || m.status.includes('Carried'));
    const efficiency = nonTrivial.length > 0 ? Math.floor((passed.length / nonTrivial.length) * 100) : 0;

    // Find biggest dissenter (who voted NO most often)
    const dissenterStats = {};
    COUNCILLORS.forEach(c => {
        dissenterStats[c] = motions.filter(m => m.votes && m.votes[c] === 'NO').length;
    });
    const biggestDissenter = Object.entries(dissenterStats)
        .sort((a, b) => b[1] - a[1])[0];

    // Dynamic summary from real data
    const topicCounts = motions.reduce((acc, m) => {
        acc[m.topic] = (acc[m.topic] || 0) + 1;
        return acc;
    }, {});
    const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];

    const splitVotes = motions.filter(m => {
        if (!m.votes) return false;
        const votes = Object.values(m.votes);
        const yes = votes.filter(v => v === 'YES').length;
        const no = votes.filter(v => v === 'NO').length;
        return yes > 0 && no > 0 && Math.min(yes, no) / (yes + no) > 0.25;
    });

    const summary = [
        `This session tracked ${totalMotions} items across ${Object.keys(topicCounts).length} topic areas.`,
        topTopic ? `${topTopic[0]} dominated the agenda with ${topTopic[1]} motion${topTopic[1] > 1 ? 's' : ''}.` : '',
        `${passed.length} of ${nonTrivial.length} substantive items passed, yielding a ${efficiency}% adoption rate.`,
        splitVotes.length > 0
            ? `${splitVotes.length} motion${splitVotes.length > 1 ? 's' : ''} saw meaningful dissent — ${biggestDissenter[0]} led opposition with ${biggestDissenter[1]} NO votes.`
            : `Council showed broad consensus; ${biggestDissenter[0]} was the most frequent dissenter with ${biggestDissenter[1]} NO votes.`,
    ].filter(Boolean).join(' ');

    const dateRange = (() => {
        const dates = motions.map(m => new Date(m.date)).filter(d => !isNaN(d));
        if (dates.length === 0) return '2022–2026 TERM';
        const min = new Date(Math.min(...dates));
        const max = new Date(Math.max(...dates));
        const fmt = d => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return min.getFullYear() === max.getFullYear() && min.getMonth() === max.getMonth()
            ? fmt(max)
            : `${fmt(min)} – ${fmt(max)}`;
    })();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-slate-800">COUNCIL SCORECARD</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{dateRange} • SESSION PERFORMANCE ANALYTICS • CITY OF TORONTO</p>
                </div>
                <div className="px-4 py-2 bg-[#004a99] text-white rounded-lg font-black italic text-sm">
                    {totalMotions} ITEMS TRACKED
                </div>
            </div>

            <div className="grid grid-cols-4 gap-6">
                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <div className="w-10 h-10 bg-blue-50 text-[#004a99] rounded-2xl flex items-center justify-center mb-4">
                        <Target size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Focus on Core</p>
                    <h3 className="text-2xl font-black italic text-slate-800">{100 - trivialPercentage}%</h3>
                </div>
                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                        <AlertCircle size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Triviality Index</p>
                    <h3 className="text-2xl font-black italic text-slate-800">{trivialPercentage}%</h3>
                </div>
                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <TrendingUp size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                    <h3 className="text-2xl font-black italic text-slate-800">{efficiency}%</h3>
                </div>
                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                        <UserMinus size={20} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Dissenter</p>
                    <h3 className="text-lg font-black italic text-slate-800 uppercase leading-none">{biggestDissenter[0]}</h3>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Impact Analysis: Major Wins</h3>
                    <div className="grid gap-4">
                        {majorWins.map((win, i) => (
                            <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex justify-between items-center group hover:bg-slate-50 transition-colors">
                                <div className="flex gap-6 items-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-mono font-bold text-[#004a99] group-hover:bg-white border border-transparent group-hover:border-slate-100">
                                        {win.id}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">{win.topic}</span>
                                            {win.significance != null && (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{win.significance} SIG</span>
                                            )}
                                        </div>
                                        <p className="font-bold text-slate-800 leading-tight">{win.title}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Mover</p>
                                    <p className="text-xs font-black text-slate-700 uppercase">{win.mover}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Dissent Ranking</h3>
                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                        {Object.entries(dissenterStats)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([name, count], i) => (
                                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-none">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-300">#{i + 1}</span>
                                        <span className="text-sm font-bold text-slate-700">{name}</span>
                                    </div>
                                    <span className="text-xs font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">{count} NO VOTES</span>
                                </div>
                            ))}
                    </div>

                    <div className="p-6 bg-slate-900 rounded-3xl text-white">
                        <FileText className="text-blue-400 mb-4" size={24} />
                        <h4 className="font-bold italic mb-2 tracking-tight">SESSION SUMMARY</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {summary}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scorecard;
