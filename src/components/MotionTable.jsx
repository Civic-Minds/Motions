import React, { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TOPIC_COLOR } from '../constants/data';

const MEETING_NAMES = {
    CC:  'City Council',
    PH:  'Housing & Planning',
    IA:  'Infrastructure & Environment',
    EC:  'Economic & Community',
    EX:  'Executive Committee',
    MM:  'Member Motions',
    MPB: 'Budget Committee',
};

const getMeetingName = (id) => MEETING_NAMES[id.replace(/\d/g, '')] ?? 'Committee Meeting';

const MotionCard = ({ motion }) => {
    const isAdopted  = motion.status === 'Adopted' || motion.status.includes('Carried');
    const isDefeated = motion.status === 'Defeated';

    const votes  = motion.votes ? Object.values(motion.votes) : [];
    const yes    = votes.filter(v => v === 'YES').length;
    const no     = votes.filter(v => v === 'NO').length;
    const total  = yes + no;
    const yesPct = total > 0 ? (yes / total) * 100 : 0;

    const tc = TOPIC_COLOR[motion.topic] ?? TOPIC_COLOR.General;

    return (
        <div className={`group relative flex items-center gap-2 p-3 sm:gap-6 sm:p-5 bg-white rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-px ${
            isAdopted  ? 'border-l-[3px] border-l-emerald-400 border-slate-100' :
            isDefeated ? 'border-l-[3px] border-l-rose-400 border-slate-100' :
                         'border-slate-100'
        }`}>

            {/* Topic + ID */}
            <div className="shrink-0 flex flex-col gap-1 w-[72px] sm:w-[88px]">
                <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-lg border text-center ${tc.badge}`}>
                    {motion.topic ?? 'General'}
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-400 text-center">{motion.id}</span>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-slate-800 leading-snug line-clamp-1 group-hover:text-[#004a99] transition-colors">
                    {motion.title}
                </p>
                {motion.significance > 15 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">High Legislative Impact</span>
                    </div>
                )}
            </div>

            {/* Vote breakdown */}
            {total > 0 && (
                <div className="shrink-0 w-[160px] hidden lg:block">
                    <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vote</span>
                        <span className="text-[11px] font-black text-slate-700 font-mono">{yes} / {no}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-400 rounded-l-full transition-all duration-700" style={{ width: `${yesPct}%` }} />
                        <div className="h-full bg-rose-400 rounded-r-full transition-all duration-700" style={{ width: `${100 - yesPct}%` }} />
                    </div>
                </div>
            )}

            {/* Outcome */}
            <div className="shrink-0 text-right">
                <span className={`text-xs sm:text-[13px] font-black tracking-tight ${
                    isAdopted ? 'text-emerald-500' : isDefeated ? 'text-rose-500' : 'text-slate-400'
                }`}>
                    {motion.status}
                </span>
            </div>

            {/* Link */}
            {motion.url ? (
                <a
                    href={motion.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="shrink-0 w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#004a99] hover:text-white hover:border-[#004a99] transition-all duration-200"
                >
                    <ExternalLink size={14} />
                </a>
            ) : (
                <div className="shrink-0 w-9" />
            )}
        </div>
    );
};

const MeetingGroup = ({ meeting, isInitiallyExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
    const { date, meetingID, motions } = meeting;
    const meetingName = getMeetingName(meetingID);

    const adopted  = motions.filter(m => m.status === 'Adopted' || m.status.includes('Carried')).length;
    const defeated = motions.filter(m => m.status === 'Defeated').length;

    return (
        <div>
            {/* Meeting header card */}
            <div
                onClick={() => setIsExpanded(p => !p)}
                className={`flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-2xl cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md hover:border-slate-300 ${
                    isExpanded ? 'rounded-b-none border-b-slate-100 shadow-md' : ''
                }`}
            >
                <div className="flex items-center gap-5">
                    {/* Code badge */}
                    <div className="shrink-0 px-3 py-2 bg-[#004a99] rounded-xl text-center min-w-[56px]">
                        <p className="text-[7px] font-black text-white/50 uppercase tracking-widest leading-none mb-0.5">MTG</p>
                        <p className="text-[13px] font-black text-white leading-none tracking-tighter">{meetingID}</p>
                    </div>

                    {/* Name + date */}
                    <div>
                        <h3 className="text-[15px] font-black text-slate-900 tracking-tight leading-none group-hover:text-[#004a99] transition-colors">
                            {meetingName}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">{date}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Records</p>
                            <p className="text-[15px] font-black text-slate-900 leading-none">{motions.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Adopted</p>
                            <p className="text-[15px] font-black text-emerald-500 leading-none">{adopted}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Defeated</p>
                            <p className="text-[15px] font-black text-rose-400 leading-none">{defeated}</p>
                        </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-[#004a99]/40 group-hover:text-[#004a99] transition-all duration-300 ${isExpanded ? 'rotate-180 bg-slate-50' : 'bg-white'}`}>
                        <ChevronDown size={16} strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            {/* Motion rows */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        <div className="border border-t-0 border-slate-200 rounded-b-2xl bg-slate-50/50 p-3 flex flex-col gap-2">
                            {motions.map((m, idx) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.035, type: 'spring', stiffness: 320, damping: 28 }}
                                >
                                    <MotionCard motion={m} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MotionTable = ({ motions }) => {
    const [visibleMeetings, setVisibleMeetings] = useState(10);

    const groupedMeetings = useMemo(() => {
        const groups = motions.reduce((acc, motion) => {
            const meetingID = motion.id.split('.')[0];
            const key = `${motion.date}_${meetingID}`;
            if (!acc[key]) acc[key] = { date: motion.date, meetingID, motions: [] };
            acc[key].motions.push(motion);
            return acc;
        }, {});
        return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [motions]);

    return (
        <div className="max-w-[1400px] mx-auto pb-40 px-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{groupedMeetings.length}</span>
                    <span className="text-sm font-bold text-slate-400">sessions</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="text-sm font-bold text-slate-400">{motions.length} records</span>
                </div>
            </div>

            <motion.div
                className="flex flex-col gap-3"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            >
                {groupedMeetings.slice(0, visibleMeetings).map((meeting, idx) => (
                    <motion.div
                        key={`${meeting.date}_${meeting.meetingID}`}
                        variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
                    >
                        <MeetingGroup
                            meeting={meeting}
                            isInitiallyExpanded={idx === 0}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {visibleMeetings < groupedMeetings.length && (
                <div className="flex justify-center pt-10">
                    <button
                        onClick={() => setVisibleMeetings(prev => prev + 10)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-500 hover:text-[#004a99] hover:border-[#004a99]/40 hover:shadow-sm transition-all active:scale-95"
                    >
                        Load more sessions <ChevronDown size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MotionTable;
