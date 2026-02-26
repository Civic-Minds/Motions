import React from 'react';
import { MapPin, Activity, Info } from 'lucide-react';
import { TORONTO_WARDS } from '../constants/wards';

const WardGrid = ({ motions }) => {
    // Calculate activity per ward
    const wardActivity = TORONTO_WARDS.map(ward => {
        const wardMotions = motions.filter(m => m.ward === ward.id);
        const impactMotions = wardMotions.filter(m => !m.trivial).length;
        return {
            ...ward,
            count: wardMotions.length,
            impactCount: impactMotions
        };
    });

    const cityWideCount = motions.filter(m => m.ward === 'City').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-slate-900 text-white border-none">
                    <div className="card-title text-slate-400">CITY-WIDE IMPACT</div>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-4xl font-display font-bold">{cityWideCount}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Motions</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                        Policy items affecting the entire municipality rather than specific geographical wards.
                    </p>
                </div>

                <div className="card border-dashed border-2 border-slate-200 bg-slate-50/50">
                    <div className="card-title">GEOGRAPHIC CLUSTER</div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="p-2 bg-toronto-blue/10 rounded-lg text-toronto-blue">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Highest Activity</p>
                            <p className="text-[11px] text-slate-500">Ward 15, Ward 13</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {wardActivity.map((ward) => (
                    <div
                        key={ward.id}
                        className={`group p-4 rounded-xl border transition-all duration-300 ${ward.count > 0
                                ? 'bg-white border-toronto-blue/30 shadow-sm border-l-4 border-l-toronto-blue'
                                : 'bg-slate-50/50 border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-white'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">W{ward.id.padStart(2, '0')}</span>
                            {ward.impactCount > 0 && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-toronto-blue transition-colors line-clamp-1">
                            {ward.name}
                        </h4>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <MapPin size={10} className={ward.count > 0 ? 'text-toronto-blue' : 'text-slate-300'} />
                                <span className={`text-[11px] font-bold ${ward.count > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {ward.count} {ward.count === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>
                            {ward.count > 0 && (
                                <div className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                    {ward.impactCount} IMPACT
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Info size={18} className="text-amber-600 mt-0.5" />
                <div>
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-widest leading-none mb-1">Data Interpretation Note</p>
                    <p className="text-[11px] text-amber-800 leading-normal">
                        Geographic impact is determined by matching meeting agenda items with ward-specific addresses and infrastructure projects.
                        Points of Interest (POIs) and property-specific motions are mapped to their respective electoral districts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WardGrid;
