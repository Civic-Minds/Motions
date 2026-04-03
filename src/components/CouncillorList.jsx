import React, { useMemo } from 'react';
import { Users as UsersIcon } from 'lucide-react';
import { getMemberAlignmentScore, getAttendance } from '../utils/analytics';
import AlignmentHeatmap from './AlignmentHeatmap';

const TOPIC_STYLES = {
    Housing: 'bg-blue-50 text-blue-700 border-blue-200',
    Transit: 'bg-red-50 text-red-600 border-red-200',
    Finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Parks:   'bg-green-50 text-green-700 border-green-200',
    Climate: 'bg-teal-50 text-teal-700 border-teal-200',
    General: 'bg-slate-50 text-slate-500 border-slate-200',
};

const attendanceStyle = (pct) => {
    if (pct >= 90) return 'text-emerald-600';
    if (pct >= 75) return 'text-amber-500';
    return 'text-rose-500';
};

const CouncillorList = ({ motions, onSelect }) => {
    const councillors = useMemo(() => {
        const voteCounts = {};
        motions.forEach(m => {
            if (!m.votes) return;
            Object.keys(m.votes).forEach(name => {
                voteCounts[name] = (voteCounts[name] || 0) + 1;
            });
        });

        return Object.entries(voteCounts)
            .filter(([, count]) => count >= 5)
            .map(([name]) => {
                const alignment = getMemberAlignmentScore(motions, name);
                const attendance = getAttendance(motions, name);

                const topicCounts = {};
                motions.forEach(m => {
                    if (m.votes?.[name] && m.topic && !m.trivial) {
                        topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1;
                    }
                });
                const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

                return { name, alignment, attendance, topTopic, voteCount: voteCounts[name] };
            })
            .sort((a, b) => a.name.split(' ').at(-1).localeCompare(b.name.split(' ').at(-1)));
    }, [motions]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Consensus Score Card (Relocated from Dashboard) */}
            <div className="card overflow-hidden">
                <div className="card-title">
                    Consensus Score
                    <UsersIcon size={14} className="text-slate-300" />
                </div>
                <p className="text-[10px] text-slate-400 font-medium -mt-2 mb-4">Frequency of voting with the majority outcome across the current session</p>
                <div className="mt-2">
                    <AlignmentHeatmap onSelect={onSelect} motions={motions} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {councillors.map(({ name, alignment, attendance, topTopic, voteCount }) => (
                    <div
                        key={name}
                        onClick={() => onSelect(name)}
                        className="group flex flex-col p-6 bg-white/70 backdrop-blur-md border border-slate-100 rounded-[24px] cursor-pointer hover:border-[#004a99]/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#004a99] group-hover:border-[#004a99] transition-all duration-500">
                                <span className="text-[12px] font-black text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">
                                    {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-900 text-sm leading-tight group-hover:text-[#004a99] transition-colors uppercase tracking-tighter truncate">
                                    {name}
                                </p>
                                {topTopic && (
                                    <span className="text-[9px] font-black uppercase inline-block mt-1 text-slate-400 tracking-widest opacity-60">
                                        {topTopic}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-1">Alignment</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-black text-[#004a99] tracking-tighter">{alignment}%</span>
                                </div>
                                <div className="w-full bg-slate-50 h-1 rounded-full mt-2 overflow-hidden">
                                    <div 
                                        className="bg-[#004a99] h-full transition-all duration-1000" 
                                        style={{ width: `${alignment}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-1">Attendance</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-lg font-black ${attendanceStyle(attendance.pct)} tracking-tighter`}>{attendance.pct}%</span>
                                </div>
                                <div className="w-full bg-slate-50 h-1 rounded-full mt-2 overflow-hidden">
                                    <div 
                                        className={`${attendance.pct < 90 ? 'bg-amber-500' : 'bg-emerald-500'} h-full transition-all duration-1000`}
                                        style={{ width: `${attendance.pct}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                                {voteCount} Sessions
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CouncillorList;
