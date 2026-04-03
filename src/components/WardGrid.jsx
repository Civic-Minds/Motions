import React, { useMemo } from 'react';
import { MapPin, Activity, Info, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWardActivityMetrics } from '../utils/analytics';
import { WARD_COUNCILLORS } from '../constants/data';

const statsContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const statsItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};

const WardGrid = ({ motions, onSelect }) => {
    const wardActivity = useMemo(() => getWardActivityMetrics(motions), [motions]);
    const cityWideCount = motions.filter(m => m.ward === 'City').length;
    const highImpactWards = wardActivity.filter(w => w.impactCount > 0).length;
    const topWard = [...wardActivity].sort((a, b) => b.count - a.count)[0];

    return (
        <div className="space-y-12">
            {/* 4-Card Header Row: Geographic Intelligence */}
            <motion.div className="dashboard-stats-row" variants={statsContainer} initial="hidden" animate="show">
                {/* 1. Regional Nexus (Double Wide) */}
                <motion.div className="card-mainline border-l-4 border-l-slate-400" variants={statsItem}>
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-[#004a99] uppercase tracking-[0.2em] mb-2 opacity-60">Regional Nexus</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{cityWideCount}</span>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Global</span>
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-tight">Items</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-end gap-3 max-w-[320px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Primary Focus: {topWard?.name}</p>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Ward {topWard?.id}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{topWard?.count} Items</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#004a99]">
                                <MapPin size={20} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Ward Concentration */}
                <motion.div className="card-mini border-l-4 border-l-[#004a99]" variants={statsItem}>
                    <p className="text-[10px] font-black text-[#004a99] uppercase tracking-[0.2em] mb-4 opacity-60">Activity</p>
                    <div className="flex items-baseline justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-[#004a99] tracking-tighter leading-none">25</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Wards</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#004a99]" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Coverage</span>
                    </div>
                </motion.div>

                {/* 3. Impact Clusters */}
                <motion.div className="card-mini border-l-4 border-l-emerald-500" variants={statsItem}>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 opacity-60">Impact</p>
                    <div className="flex items-baseline justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-emerald-600 tracking-tighter leading-none">{highImpactWards}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Clusters</span>
                        </div>
                        <Zap size={16} className="text-emerald-500" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">High-Impact Items Detected</span>
                </motion.div>

                {/* 4. Service Density */}
                <motion.div className="card-mini border-l-4 border-l-amber-400" variants={statsItem}>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 opacity-60">Density</p>
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter leading-tight">COMMUNITY</span>
                        <div className="inline-flex items-center justify-center py-1 bg-amber-50 rounded-lg border border-amber-100">
                             <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Local Priority</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Ward Grid */}
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.15 } } }}
            >
                {wardActivity.map((ward) => (
                    <motion.div
                        key={ward.id}
                        variants={{ hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } } }}
                        onClick={() => onSelect && WARD_COUNCILLORS[ward.id] && onSelect(WARD_COUNCILLORS[ward.id])}
                        className={`group p-6 rounded-[24px] border transition-all duration-500 ${ward.count > 0
                            ? `bg-white/70 backdrop-blur-md border-slate-100 shadow-sm hover:border-[#004a99]/30 hover:shadow-2xl hover:-translate-y-1 ${onSelect && WARD_COUNCILLORS[ward.id] ? 'cursor-pointer' : 'cursor-default'}`
                            : 'bg-slate-50/40 border-slate-100/50 opacity-40 grayscale cursor-default'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">W{ward.id.padStart(2, '0')}</span>
                            {ward.impactCount > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                     <span className="text-[8px] font-black text-emerald-700 uppercase tracking-tight">Impact</span>
                                </div>
                            )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-[#004a99] transition-colors uppercase tracking-tight leading-tight mb-1">
                            {ward.name}
                        </h4>
                        {WARD_COUNCILLORS[ward.id] && (
                            <p className="text-[9px] font-bold text-slate-400 mb-3 group-hover:text-[#004a99]/70 transition-colors truncate">
                                {WARD_COUNCILLORS[ward.id]}
                            </p>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 leading-none">{ward.count}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Items</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-[#004a99]/10 group-hover:text-[#004a99] transition-all">
                                <Activity size={14} className="opacity-40 group-hover:opacity-100" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Info Message */}
            <div className="p-5 bg-blue-50/50 backdrop-blur-sm border border-blue-100 rounded-[24px] flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-xl text-[#004a99]">
                    <Info size={16} />
                </div>
                <div>
                    <h5 className="text-[10px] font-black text-[#004a99] uppercase tracking-[0.15em] mb-1">Geographic Intelligence Model</h5>
                    <p className="text-[11px] text-blue-900/60 leading-relaxed font-medium">
                        Ward-level impact is derived from a semantic analysis of item titles and descriptions, mapping street addresses and development sites to legislative boundaries.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WardGrid;
