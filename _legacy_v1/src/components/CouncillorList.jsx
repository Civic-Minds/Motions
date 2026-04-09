import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users as UsersIcon, GitCompare, X, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMemberAlignmentScore, getAttendance } from '../utils/analytics';
import { nameToSlug, slugToName } from '../utils/slug';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import AlignmentHeatmap from './AlignmentHeatmap';

// Reverse lookup: councillor name → ward info
const COUNCILLOR_WARD = {};
Object.entries(WARD_COUNCILLORS).forEach(([wardId, name]) => {
    const ward = TORONTO_WARDS.find(w => w.id === wardId);
    if (ward) COUNCILLOR_WARD[name] = { id: wardId, name: ward.name };
});

const attendanceStyle = (pct) => {
    if (pct >= 90) return 'text-emerald-600';
    if (pct >= 75) return 'text-amber-500';
    return 'text-rose-500';
};

const CouncillorList = ({ motions, onSelect, onActivate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [compareMode, setCompareMode] = useState(false);
    const [compareSlots, setCompareSlots] = useState([]);
    const { slug, slug2 } = useParams();
    const navigate = useNavigate();

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
                const ward = COUNCILLOR_WARD[name];

                return { name, alignment, attendance, topTopic, voteCount: voteCounts[name], ward };
            })
            .sort((a, b) => a.name.split(' ').at(-1).localeCompare(b.name.split(' ').at(-1)));
    }, [motions]);

    const allNames = useMemo(() => councillors.map(c => c.name), [councillors]);

    useEffect(() => {
        if (!allNames.length) return;
        if (slug2) {
            const name1 = slugToName(slug, allNames);
            const name2 = slugToName(slug2, allNames);
            if (name1 && name2) onActivate({ compare: [name1, name2] });
            else navigate('/councillors', { replace: true });
        } else if (slug) {
            const name = slugToName(slug, allNames);
            if (name) onActivate({ profile: name });
            else navigate('/councillors', { replace: true });
        } else {
            onActivate({});
        }
    }, [slug, slug2, allNames]);

    const handleCardClick = (name) => {
        if (compareMode) {
            setCompareSlots(prev => {
                if (prev.includes(name)) return prev.filter(n => n !== name);
                if (prev.length < 2) return [...prev, name];
                return [prev[1], name];
            });
        } else if (onSelect) {
            const currentSlug = nameToSlug(name);
            navigate(`/councillors/${currentSlug}`);
            onActivate({ profile: name });
        }
    };

    const handleLaunchCompare = () => {
        if (compareSlots.length === 2) {
            const s1 = nameToSlug(compareSlots[0]);
            const s2 = nameToSlug(compareSlots[1]);
            navigate(`/councillors/${s1}/vs/${s2}`);
            onActivate({ compare: compareSlots });
            setCompareMode(false);
            setCompareSlots([]);
        }
    };

    const filteredCouncillors = councillors.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.topTopic && c.topTopic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.ward && c.ward.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.ward && `ward ${c.ward.id}`.includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Voting Alignment Header */}
            <div className="space-y-6">
                <div className="px-2">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Alignment Dashboard</h2>
                    <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none">Council Unity Heatmap</h1>
                    <p className="text-slate-500 font-medium mt-3 max-w-2xl leading-relaxed">
                        Track how often each representative aligns with the majority consensus on substantive policy motions.
                    </p>
                </div>
                <div className="bg-white/50 backdrop-blur-xl border border-slate-200/60 rounded-[40px] p-8 shadow-sm">
                    <AlignmentHeatmap onSelect={onSelect} motions={motions} />
                </div>
            </div>

            {/* Header + Search + Compare toggle */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 px-2">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <UsersIcon className="w-6 h-6 text-[#004a99]" />
                        <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">Elected Members</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">{filteredCouncillors.length} Active Representatives</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Compare toggle */}
                    <button
                        onClick={() => { setCompareMode(!compareMode); setCompareSlots([]); }}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3.5 rounded-2xl border-2 text-[13px] font-black transition-all w-full sm:w-auto active:scale-95 shadow-sm",
                            compareMode
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10'
                                : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:text-slate-900'
                        )}
                    >
                        <GitCompare className="w-5 h-5" />
                        {compareMode ? 'EXIT COMPARE' : 'COMPARE TWO'}
                    </button>

                    <div className="flex items-center w-full lg:w-80 h-14 px-5 bg-white border-2 border-slate-100 rounded-2xl focus-within:border-[#004a99] focus-within:shadow-2xl focus-within:shadow-blue-900/5 transition-all group">
                        <Search className="text-slate-300 group-focus-within:text-[#004a99] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find member..."
                            className="flex-1 h-full bg-transparent border-none outline-none pl-4 text-[15px] font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Compare Mode Bar */}
            <AnimatePresence>
                {compareMode && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="flex flex-col sm:flex-row items-center justify-between bg-[#004a99] border border-blue-400/20 rounded-3xl px-8 py-6 shadow-2xl shadow-blue-900/30 gap-6 mx-2"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                                <GitCompare className="w-7 h-7 text-white" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-white tracking-tight">
                                    {compareSlots.length === 0 && 'Select two cards below'}
                                    {compareSlots.length === 1 && `Almost there—pick one more`}
                                    {compareSlots.length === 2 && `${compareSlots[0]} vs ${compareSlots[1]}`}
                                </p>
                                <p className="text-xs font-bold text-white/50 uppercase tracking-widest leading-none">Voting analysis mode</p>
                            </div>
                        </div>
                        {compareSlots.length === 2 && (
                            <button
                                onClick={handleLaunchCompare}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-[#004a99] text-[13px] font-black rounded-2xl hover:bg-slate-50 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest"
                            >
                                Compare Analytics <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cards Grid */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
                {filteredCouncillors.map(({ name, alignment, attendance, topTopic, voteCount, ward }) => {
                    const isSelected = compareSlots.includes(name);
                    const isFull = !isSelected && compareSlots.length === 2;

                    return (
                        <motion.div
                            key={name}
                            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } } }}
                            onClick={() => handleCardClick(name)}
                            className={cn(
                                "group flex flex-col p-8 bg-white border-2 rounded-[40px] cursor-pointer hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 relative overflow-hidden",
                                isSelected
                                    ? 'border-[#004a99] shadow-2xl shadow-blue-900/10 scale-105 z-10'
                                    : isFull ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-[#004a99]/30'
                            )}
                        >
                            <div className="flex items-center gap-5 mb-8">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 border-2",
                                    isSelected
                                        ? 'bg-[#004a99] border-white text-white shadow-xl'
                                        : 'bg-slate-50 border-white text-slate-400 group-hover:bg-[#004a99] group-hover:text-white group-hover:shadow-xl'
                                )}>
                                    <span className="text-[13px] font-black uppercase tracking-tight">
                                        {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-slate-900 text-[17px] leading-tight group-hover:text-[#004a99] transition-colors tracking-tight truncate">
                                        {name}
                                    </p>
                                    {ward && (
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1.5 opacity-80">
                                            W{ward.id} · {ward.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Alignment</span>
                                        <span className="text-2xl font-display font-black text-[#004a99] tracking-tighter leading-none">{alignment !== null ? `${alignment}%` : '—'}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/20">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${alignment ?? 0}%` }}
                                            className="bg-[#004a99] h-full rounded-full transition-all duration-1000 ease-out"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Attendance</span>
                                        <span className={cn("text-2xl font-display font-black tracking-tighter leading-none", attendanceStyle(attendance.pct))}>{attendance.pct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/20">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${attendance.pct}%` }}
                                            className={cn("h-full rounded-full transition-all duration-1000 ease-out", attendance.pct < 75 ? 'bg-rose-500' : attendance.pct < 90 ? 'bg-amber-500' : 'bg-emerald-500')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{voteCount} RECORDED VOTES</span>
                                    {topTopic && (
                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight mt-1">Focus: {topTopic}</span>
                                    )}
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-[#004a99] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {filteredCouncillors.length === 0 && (
                <div className="text-center py-32 bg-slate-50/50 border-4 border-dashed border-slate-200/60 rounded-[48px] mx-2">
                     <Search size={48} className="text-slate-200 mx-auto mb-6" />
                     <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">No members match your search</h3>
                     <p className="text-sm text-slate-500 font-medium mt-2">Try searching by name, ward name, or policy topic.</p>
                </div>
            )}
        </div>
    );
};

export default CouncillorList;
