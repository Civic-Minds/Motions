import React, { useMemo } from 'react';
import { getMemberAlignmentScore, getAttendance } from '../utils/analytics';

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black italic tracking-tight text-slate-800">COUNCILLORS</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                    {councillors.length} MEMBERS · 2022–2026 TERM
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {councillors.map(({ name, alignment, attendance, topTopic, voteCount }) => (
                    <div
                        key={name}
                        onClick={() => onSelect(name)}
                        className="group p-4 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:border-[#004a99] hover:shadow-lg hover:shadow-slate-200/50 transition-all"
                    >
                        {/* Avatar placeholder */}
                        <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center mb-3 group-hover:border-[#004a99] transition-colors">
                            <span className="text-sm font-black text-slate-400 group-hover:text-[#004a99] transition-colors">
                                {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </span>
                        </div>

                        <p className="font-black text-slate-800 text-sm leading-tight group-hover:text-[#004a99] transition-colors">
                            {name.split(' ').at(-1)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mb-3 truncate">
                            {name.split(' ').slice(0, -1).join(' ')}
                        </p>

                        {topTopic && (
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border whitespace-nowrap ${TOPIC_STYLES[topTopic] || TOPIC_STYLES.General}`}>
                                {topTopic}
                            </span>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                            <div className="text-center">
                                <div className={`text-sm font-black ${attendanceStyle(attendance.pct)}`}>
                                    {attendance.pct}%
                                </div>
                                <div className="text-[8px] text-slate-400 font-bold uppercase">attend</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-black text-[#004a99]">{alignment}%</div>
                                <div className="text-[8px] text-slate-400 font-bold uppercase">align</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-black text-slate-600">{voteCount}</div>
                                <div className="text-[8px] text-slate-400 font-bold uppercase">votes</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CouncillorList;
