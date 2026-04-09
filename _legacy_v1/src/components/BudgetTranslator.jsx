import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Wallet, Calculator, Info, Search, ChevronDown, ChevronUp, Landmark, TrendingUp, PieChart, DollarSign, ArrowUpRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const statsContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const statsItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const DEPARTMENTS = [
    { name: "TTC", gross: 2570000000, net: 958000000, context: "Operating Toronto's transit network which carries over 1.6M passengers daily.", stats: ["$1,606 per resident (Gross)", "55 operating subway stations", "Run 135+ bus & streetcar routes", "90% of Toronto residents live within 400m of transit"] },
    { name: "Police", gross: 1320000000, net: 1180000000, context: "Core public safety operations, emergency response, and proactive community policing.", stats: ["Over 1M calls for service annually", "$393 per resident", "5,100+ uniform officers", "Operates 17 police divisions"] },
    { name: "Shelter & Housing", gross: 1100000000, net: 591000000, context: "Emergency shelter system support and long-term affordable housing initiatives.", stats: ["10,000+ nightly shelter spaces", "Major expansion of supportive housing", "Provincial subsidy for 55% of cost", "350+ community housing providers"] },
    { name: "Fire Services", gross: 554000000, net: 531000000, context: "Critical fire suppression, technical rescue, and emergency medical response.", stats: ["Respond to 150k+ incidents per year", "83 fire stations across Toronto", "3,100+ professional staff", "Avg. response time under 7 minutes"] },
    { name: "Parks & Rec", gross: 532000000, net: 382000000, context: "Maintenance and operation of public parks, community centers, and recreation programs.", stats: ["1,500+ parks and open spaces", "700+ sports fields", "113 community centers", "Support for 600k+ program registrations"] }
];

const BudgetTranslator = () => {
    const [expanded, setExpanded] = useState(null);
    const totalOperating = 18800000000;
    
    const chartData = useMemo(() => {
        const sorted = [...DEPARTMENTS].sort((a, b) => b.gross - a.gross);
        const identified = DEPARTMENTS.reduce((sum, d) => sum + d.gross, 0);
        return [...sorted, { name: "All Others", gross: totalOperating - identified, isOther: true }];
    }, []);

    return (
        <div className="space-y-12">
            
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                             <PieChart size={18} />
                         </div>
                         <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Fiscal Intelligence</h2>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Budget Translator</h1>
                    <p className="text-base text-slate-500 font-medium max-w-2xl">
                        Visualizing how Toronto allocates $18.8 billion in operating capital across departments and services.
                    </p>
                </div>
            </div>

            {/* Header: Fiscal Intelligence */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={statsContainer} initial="hidden" animate="show">
                <Card className="card-premium h-full col-span-1 md:col-span-2" variants={statsItem}>
                    <CardContent className="p-8 flex items-center justify-between h-full bg-gradient-to-br from-white to-blue-50/20">
                        <div className="space-y-4">
                            <div className="p-2 w-fit bg-blue-50 rounded-lg text-blue-600">
                                <Landmark size={18} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Operating Budget</h3>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-6xl font-black text-slate-900 tracking-tighter leading-none">$18.8B</span>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] py-1 px-2 mb-2">
                                        FY 2026
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block w-32 h-32 opacity-20">
                             <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={[{v: 0}, {v: 10}, {v: 5}, {v: 20}, {v: 15}]}>
                                     <Area type="monotone" dataKey="v" stroke="#004a99" fill="#004a99" />
                                 </AreaChart>
                             </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-premium h-full" variants={statsItem}>
                    <CardContent className="p-8 flex flex-col justify-between h-full bg-gradient-to-br from-white to-emerald-50/20">
                        <div className="space-y-4">
                            <div className="p-2 w-fit bg-emerald-50 rounded-lg text-emerald-600">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <span className="text-4xl font-black text-emerald-600 tracking-tighter leading-none">+3.2%</span>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Year-over-Year</h3>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Adjusted for regional inflation data.</p>
                    </CardContent>
                </Card>

                <Card className="card-premium h-full" variants={statsItem}>
                    <CardContent className="p-8 flex flex-col justify-between h-full bg-gradient-to-br from-white to-amber-50/20">
                        <div className="space-y-4">
                            <div className="p-2 w-fit bg-amber-50 rounded-lg text-amber-600">
                                <DollarSign size={18} />
                            </div>
                            <div>
                                <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none font-mono">$1.5B</span>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Avg. Monthly Spend</h3>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium italic">Operational burn rate.</p>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
                {/* Visual Overview */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-slate-900 rounded-lg text-white">
                                <BarChart3 size={16} />
                             </div>
                             <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Allocation Chart</h4>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Spending</span>
                    </div>

                    <Card className="card-premium border-none p-10 bg-white">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 40 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fill: '#475569', fontSize: 11, fontWeight: 900 }}
                                        width={140}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,74,153,0.03)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}
                                    />
                                    <Bar dataKey="gross" radius={[0, 8, 8, 0]} barSize={28}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.isOther ? '#f1f5f9' :
                                                ['#004a99', '#4f46e5', '#ea580c', '#dc2626', '#059669'][index] ?? '#94a3b8'
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Tactical Translation */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Sector Deep Dive</h4>
                        <span className="text-[10px] font-black text-slate-300 italic">Toggle for contextual data</span>
                    </div>
                    <div className="space-y-4">
                        {DEPARTMENTS.map((dept, i) => (
                            <div 
                                key={dept.name}
                                className={cn(
                                    "border rounded-[2rem] transition-all duration-500 overflow-hidden",
                                    expanded === i ? "bg-white border-primary/20 shadow-[0_20px_50px_rgba(0,74,153,0.08)] scale-[1.02]" : "bg-white/60 border-slate-100/60 hover:border-slate-200"
                                )}
                            >
                                <button 
                                    onClick={() => setExpanded(expanded === i ? null : i)}
                                    className="w-full flex items-center justify-between p-7 text-left"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500",
                                            expanded === i ? "bg-[#003b7a] text-white" : "bg-slate-50 text-slate-400"
                                        )}>
                                            {dept.name[0]}
                                        </div>
                                        <div>
                                            <h5 className="text-[15px] font-black text-slate-900 tracking-tight leading-none mb-1.5">{dept.name}</h5>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400">$ {(dept.gross / 1000000000).toFixed(2)}B</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Gross Capital</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn("transition-transform duration-500 p-2 rounded-xl bg-slate-50 text-slate-400", expanded === i && "rotate-180 bg-[#003b7a]/5 text-[#003b7a]")}>
                                        <ChevronDown size={18} />
                                    </div>
                                </button>
                                
                                <AnimatePresence initial={false}>
                                    {expanded === i && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-7 pb-8 pt-0">
                                                <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 mb-6">
                                                     <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">
                                                        "{dept.context}"
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {dept.stats.map((stat, si) => (
                                                        <motion.div
                                                            key={si}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: si * 0.05 }}
                                                            className="p-5 rounded-2xl bg-white border border-slate-50 flex items-start gap-3 group/stat hover:border-primary/20 transition-all shadow-sm"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/stat:bg-primary transition-colors mt-1.5" />
                                                            <p className="text-[11px] font-black text-slate-700 leading-snug tracking-tight">{stat}</p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Card className="rounded-[2.5rem] bg-[#004a99] text-white border-none p-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <Wallet size={120} strokeWidth={1} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-md">
                        <Calculator size={32} className="text-blue-200" />
                    </div>
                    <div className="space-y-4 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-blue-400/20 text-blue-200 border-none font-black text-[10px] uppercase tracking-widest px-3">Fiscal Policy</Badge>
                            <h5 className="text-sm font-black text-white uppercase tracking-widest">Net vs Gross Explained</h5>
                        </div>
                        <p className="text-base text-blue-100/80 leading-relaxed font-medium">
                            The <span className="text-white font-bold">Gross Budget</span> reflects total expenditure including revenue from other levels of government and service fees. 
                            The <span className="text-white font-bold">Net Budget</span> represents the specific portion funded by Toronto property taxpayers. 
                            Transparency ensures citizens understand the full scale of public investment.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                             <div className="flex items-center gap-2">
                                 <ArrowUpRight size={16} className="text-emerald-400" />
                                 <span className="text-xs font-black uppercase text-white/60">Source: City of Toronto Financial Planning</span>
                             </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default BudgetTranslator;
