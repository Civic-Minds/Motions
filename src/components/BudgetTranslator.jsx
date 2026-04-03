import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Calculator, Info, Search, ChevronDown, ChevronUp, Landmark, TrendingUp } from 'lucide-react';

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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header: Fiscal Intelligence */}
            <div className="dashboard-stats-row">
                <div className="card-mainline border-l-4 border-l-[#004a99]">
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-black text-[#004a99] uppercase tracking-[0.2em] mb-2 opacity-60">System Liquidity</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">$18.8B</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col items-end gap-3 max-w-[320px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Allocation Efficiency</p>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Operating Budget</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">2026 Fiscal Cycle</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-[#004a99]/5 border border-[#004a99]/10 flex items-center justify-center text-[#004a99]">
                                <Landmark size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-mini border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 opacity-60">Forecast</p>
                    <div className="flex items-baseline justify-between mb-4">
                        <div className="flex items-baseline gap-1">
                            <TrendingUp size={16} className="text-emerald-500 mr-1" />
                            <span className="text-4xl font-black text-emerald-600 tracking-tighter leading-none">+3.2%</span>
                        </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight italic">Adjusted for Inflation</span>
                </div>

                <div className="card-mini border-l-4 border-l-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-60">Coverage</p>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">14</span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Sectors</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Tax-Extracted Revenue</span>
                </div>

                 <div className="card-mini border-l-4 border-l-amber-400">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4 opacity-60">Velocity</p>
                    <div className="flex flex-col gap-2">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter leading-tight font-mono">$1.5B/MO</span>
                        <div className="inline-flex items-center justify-center py-1 bg-amber-50 rounded-lg border border-amber-100">
                             <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Global Output</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Overview */}
                <div className="card-mini h-full p-8 border-none bg-slate-900 !rounded-[32px] shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 mb-8 border-l-2 border-l-[#004a99] pl-3">Vertical Spending Distribution</h4>
                        <div className="h-[430px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }} 
                                        width={120}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="gross" radius={[0, 4, 4, 0]} barSize={24}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.isOther ? '#1e293b' : index === 0 ? '#004a99' : '#334155'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#004a99] opacity-[0.03] blur-[100px] -mr-32 -mt-32" />
                </div>

                {/* Tactical Translation */}
                <div className="space-y-4">
                    <div className="px-2 flex justify-between items-center mb-6">
                         <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Sector Breakdown</h4>
                         <span className="text-[9px] font-black text-slate-400 opacity-60">2026 GROSS FIGURES</span>
                    </div>
                    {DEPARTMENTS.map((dept, i) => (
                        <div 
                            key={dept.name}
                            className={`group border rounded-[24px] transition-all duration-500 overflow-hidden ${
                                expanded === i ? 'bg-white border-[#004a99]/30 shadow-2xl scale-[1.02] -translate-y-1' : 'bg-white/70 backdrop-blur-md border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <button 
                                onClick={() => setExpanded(expanded === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 text-left"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${
                                        expanded === i ? 'bg-[#004a99] text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                        {dept.name[0]}
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-slate-900 uppercase tracking-tighter">{dept.name}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            $ { (dept.gross / 1000000000).toFixed(2) } Billion
                                        </p>
                                    </div>
                                </div>
                                <div className={`transition-transform duration-500 ${expanded === i ? 'rotate-180 text-[#004a99]' : 'text-slate-300'}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </button>
                            
                            {expanded === i && (
                                <div className="px-6 pb-8 pt-2 animate-in slide-in-from-top-2 duration-500">
                                    <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-6 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        {dept.context}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {dept.stats.map((stat, si) => (
                                            <div key={si} className="p-4 rounded-2xl bg-white border border-slate-50 group-hover:border-[#004a99]/10 transition-colors shadow-sm">
                                                <p className="text-[11px] font-bold text-slate-700 leading-snug">{stat}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-slate-900 border border-slate-800 rounded-[32px] flex items-start gap-6 shadow-2xl relative overflow-hidden">
                <div className="p-4 bg-[#004a99] rounded-[20px] text-white relative z-10 shadow-lg">
                    <Wallet size={24} />
                </div>
                <div className="relative z-10">
                    <h5 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.25em] mb-2">Net vs Gross Analysis</h5>
                    <p className="text-[12px] text-slate-400 leading-relaxed font-medium max-w-2xl">
                        Gross budget represents the total spend including provincial/federal transfers and service revenue. Net budget represents the amount collected from Toronto property taxes.
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,74,153,0.1),transparent_70%)]" />
            </div>
        </div>
    );
};

export default BudgetTranslator;
