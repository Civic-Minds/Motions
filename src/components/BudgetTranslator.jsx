import React, { useState, useEffect } from 'react';
import {
    Shield,
    Bus,
    Home,
    Info,
    TrendingUp,
    DollarSign,
    Clock,
    Users
} from 'lucide-react';

const icons = {
    Shield: Shield,
    Bus: Bus,
    Home: Home
};

const BudgetTranslator = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch('/data/budget.json');
                const json = await response.json();
                setData(json);
            } catch (err) {
                console.error("Error loading budget data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBudget();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-8 text-slate-500 font-mono text-xs">LOADING BUDGET DATA...</div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 gap-8">
                {data.map((dept) => {
                    const Icon = icons[dept.icon] || Info;

                    return (
                        <div
                            key={dept.id}
                            className="border-l-4 border-slate-900 bg-white p-6 shadow-sm border border-slate-200"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 border border-slate-200 rounded">
                                        <Icon size={20} className="text-slate-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{dept.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono">ID: {dept.id.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="text-left md:text-right p-3 bg-slate-50 border border-slate-200 rounded">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">2025 ALLOCATION</p>
                                    <p className="text-2xl font-mono font-bold text-slate-900">{formatCurrency(dept.budget)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {dept.translation.map((item, idx) => (
                                    <div key={idx} className="p-4 border border-slate-100 bg-slate-50/30 rounded">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">{item.label}</p>
                                        <p className="text-xl font-bold text-slate-900 mb-1">{item.value}</p>
                                        <p className="text-xs text-slate-600 leading-tight">
                                            {item.context}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
                <h2 className="text-sm font-bold uppercase mb-4 text-slate-900 tracking-widest border-b border-slate-200 pb-2">Global Context</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Toronto's 2025 Operating Budget is <strong>$18.8 Billion</strong>.
                            This translator breaks down departmental spending into specific service units
                            to provide context on resource allocation and operational output.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-mono font-bold text-slate-900">$18.8B</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total City<br />Operating Budget</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetTranslator;
