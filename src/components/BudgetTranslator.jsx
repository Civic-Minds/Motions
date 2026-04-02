import React, { useState, useEffect } from 'react';
import {
    Shield, Bus, Home, BookOpen, Trees, Flame, Map, Building2, Trash2,
    Landmark, Baby, HardHat, HeartPulse, Ambulance, Info,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ICONS = {
    Shield, Bus, Home, BookOpen, Trees, Flame, Map, Building2, Trash2,
    Landmark, Baby, HardHat, HeartPulse, Ambulance
};

const TORONTO_POPULATION = 2_930_000;
const TOTAL_BUDGET = 18_800_000_000;

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(amount);

const formatShort = (amount) => {
    if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)}M`;
    return formatCurrency(amount);
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
            <p className="font-bold mb-0.5">{d.name}</p>
            <p className="text-slate-300">{formatShort(d.budget)}</p>
            <p className="text-slate-400 text-[10px]">${Math.round(d.budget / TORONTO_POPULATION).toLocaleString()} per resident</p>
        </div>
    );
};

const BudgetTranslator = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        fetch('/data/budget.json')
            .then(r => r.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading budget data:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-8 text-slate-500 font-mono text-xs">LOADING BUDGET DATA...</div>;
    }

    const sorted = [...data].sort((a, b) => b.budget - a.budget);
    const covered = data.reduce((sum, d) => sum + d.budget, 0);
    const uncategorized = TOTAL_BUDGET - covered;

    const chartData = [
        ...sorted.map(d => ({ name: d.name, shortName: d.name.replace('Toronto ', '').replace(' Services', ''), budget: d.budget, id: d.id })),
        { name: 'All Other Services', shortName: 'All Other', budget: uncategorized, id: 'other' }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-slate-800">BUDGET TRANSLATOR</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                        2025 OPERATING BUDGET · CITY OF TORONTO · {data.length} DEPARTMENTS
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Operating Budget</p>
                    <p className="text-3xl font-black font-mono text-slate-900">$18.8B</p>
                    <p className="text-[11px] text-slate-400 font-bold">${Math.round(TOTAL_BUDGET / TORONTO_POPULATION).toLocaleString()} per resident</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Spending Breakdown by Department</p>
                <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 60, top: 0, bottom: 0 }}>
                        <XAxis
                            type="number"
                            tickFormatter={v => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            type="category"
                            dataKey="shortName"
                            width={170}
                            tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="budget" radius={[0, 4, 4, 0]} maxBarSize={22}>
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.id}
                                    fill={entry.id === 'other' ? '#e2e8f0' : '#004a99'}
                                    fillOpacity={entry.id === 'other' ? 1 : 0.85}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Department Cards */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Detail</p>
                {sorted.map((dept) => {
                    const Icon = ICONS[dept.icon] || Info;
                    const perResident = Math.round(dept.budget / TORONTO_POPULATION);
                    const pct = ((dept.budget / TOTAL_BUDGET) * 100).toFixed(1);
                    const isOpen = expanded === dept.id;

                    return (
                        <div
                            key={dept.id}
                            className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <button
                                onClick={() => setExpanded(isOpen ? null : dept.id)}
                                className="w-full text-left p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="p-2 border border-slate-100 rounded-xl shrink-0">
                                    <Icon size={18} className="text-slate-700" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="font-bold text-slate-800">{dept.name}</span>
                                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{pct}% of budget</span>
                                    </div>
                                    <div className="mt-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#004a99] rounded-full" style={{ width: `${Math.min(parseFloat(pct) * 5, 100)}%` }} />
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="font-black font-mono text-slate-900">{formatShort(dept.budget)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">${perResident}/resident</p>
                                </div>

                                <div className="text-slate-300 shrink-0">
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="px-5 pb-5 border-t border-slate-50">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                                        {dept.translation.map((item, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{item.label}</p>
                                                <p className="text-lg font-black text-slate-900 leading-none mb-1">{item.value}</p>
                                                <p className="text-[10px] text-slate-500 leading-snug">{item.context}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {dept.grossBudget && dept.grossBudget !== dept.budget && (
                                        <p className="text-[10px] text-slate-400 mt-3 font-medium">
                                            Gross budget: {formatCurrency(dept.grossBudget)} · Net after revenues: {formatCurrency(dept.budget)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer note */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    Figures represent the City of Toronto's 2025 approved operating budget. Some departments show net amounts after provincial and federal transfers.
                    Departments shown here represent approximately {((covered / TOTAL_BUDGET) * 100).toFixed(0)}% of the total $18.8B operating budget.
                    Source: City of Toronto 2025 Budget Committee approved estimates.
                </p>
            </div>
        </div>
    );
};

export default BudgetTranslator;
