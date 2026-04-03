import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MapPin, Activity, Info, Zap, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWardActivityMetrics } from '../utils/analytics';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';

// ─── Ward boundary utilities ──────────────────────────────────────────────────

// Ray-casting point-in-polygon
function pointInRing(point, ring) {
    const [px, py] = point;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

function pointInFeature(point, geometry) {
    const polys = geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.coordinates; // MultiPolygon
    return polys.some(poly => pointInRing(point, poly[0]));
}

function extractWardId(props) {
    // Try common property names in Toronto Open Data GeoJSON
    for (const key of ['WARD_NUM', 'WARD', 'ward_num', 'AREA_SHORT_CODE', 'ward']) {
        if (props[key] != null) return String(props[key]);
    }
    // Parse from AREA_NAME: "Etobicoke North (1)"
    const name = props.AREA_NAME ?? props.area_name ?? '';
    const m = name.match(/\((\d+)\)/);
    return m ? m[1] : null;
}

let cachedBoundaries = null;

async function fetchWardBoundaries() {
    if (cachedBoundaries) return cachedBoundaries;

    // Toronto Open Data CKAN API — "city-wards" package
    const meta = await fetch(
        'https://ckan0.cf.opendata.inter.toronto.ca/api/3/action/package_show?id=city-wards'
    ).then(r => r.json());

    const resource = meta.result?.resources?.find(r =>
        r.format?.toLowerCase() === 'geojson' ||
        r.url?.toLowerCase().includes('.geojson')
    );
    if (!resource) throw new Error('No GeoJSON resource found in Toronto Open Data');

    cachedBoundaries = await fetch(resource.url).then(r => r.json());
    return cachedBoundaries;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const statsContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const statsItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

const WardGrid = ({ motions, onSelect }) => {
    const wardActivity = useMemo(() => getWardActivityMetrics(motions), [motions]);
    const cityWideCount = motions.filter(m => m.ward === 'City').length;
    const highImpactWards = wardActivity.filter(w => w.impactCount > 0).length;
    const topWard = [...wardActivity].sort((a, b) => b.count - a.count)[0];

    const [locateState, setLocateState] = useState('idle'); // idle | locating | loading | found | not_found | denied | error
    const [locateMsg, setLocateMsg]     = useState('');
    const [foundWardId, setFoundWardId] = useState(null);
    const wardRefs = useRef({});

    // Scroll to found ward card
    useEffect(() => {
        if (foundWardId && wardRefs.current[foundWardId]) {
            wardRefs.current[foundWardId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [foundWardId]);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setLocateState('error');
            setLocateMsg('Geolocation is not supported by your browser.');
            return;
        }

        setLocateState('locating');
        setFoundWardId(null);

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                setLocateState('loading');
                try {
                    const geojson = await fetchWardBoundaries();
                    const point = [coords.longitude, coords.latitude];
                    let matched = null;

                    for (const feature of geojson.features) {
                        if (pointInFeature(point, feature.geometry)) {
                            matched = extractWardId(feature.properties);
                            break;
                        }
                    }

                    const knownWard = matched && TORONTO_WARDS.find(w => w.id === matched);
                    if (knownWard) {
                        setFoundWardId(matched);
                        setLocateState('found');
                        if (onSelect && WARD_COUNCILLORS[matched]) {
                            onSelect(WARD_COUNCILLORS[matched]);
                        }
                    } else {
                        setLocateState('not_found');
                        setLocateMsg('Your location appears to be outside Toronto.');
                    }
                } catch (err) {
                    setLocateState('error');
                    setLocateMsg('Could not load ward boundary data. Try again later.');
                }
            },
            (err) => {
                if (err.code === 1) {
                    setLocateState('denied');
                    setLocateMsg('Location access was denied. Enable it in your browser settings.');
                } else {
                    setLocateState('error');
                    setLocateMsg('Could not determine your location.');
                }
            },
            { timeout: 10000 }
        );
    };

    const handleReset = () => {
        setLocateState('idle');
        setFoundWardId(null);
        setLocateMsg('');
    };

    const isSearching = locateState === 'locating' || locateState === 'loading';
    const foundWard   = foundWardId ? TORONTO_WARDS.find(w => w.id === foundWardId) : null;

    return (
        <div className="space-y-12">
            {/* 4-Card Header Row */}
            <motion.div className="dashboard-stats-row" variants={statsContainer} initial="hidden" animate="show">
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

            {/* Locate My Ward bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-1">
                <button
                    onClick={isSearching ? undefined : handleLocate}
                    disabled={isSearching}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-[11px] font-bold transition-all duration-200 ${
                        locateState === 'found'
                            ? 'bg-[#004a99] text-white border-[#004a99] cursor-default'
                            : isSearching
                            ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-wait'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#004a99]/40 hover:text-[#004a99] hover:shadow-sm active:scale-95'
                    }`}
                >
                    {isSearching
                        ? <Loader2 size={14} className="animate-spin" />
                        : <MapPin size={14} />
                    }
                    {locateState === 'idle'      && 'Locate my ward'}
                    {locateState === 'locating'  && 'Requesting location…'}
                    {locateState === 'loading'   && 'Finding your ward…'}
                    {locateState === 'found'     && `Ward ${foundWardId} · ${foundWard?.name}`}
                    {locateState === 'not_found' && 'Locate my ward'}
                    {locateState === 'denied'    && 'Locate my ward'}
                    {locateState === 'error'     && 'Try again'}
                </button>

                {/* Found result */}
                {locateState === 'found' && foundWard && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-slate-700">{WARD_COUNCILLORS[foundWardId]}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[11px] text-slate-400">Councillor</span>
                        </div>
                        <button
                            onClick={handleReset}
                            className="p-1 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
                            aria-label="Clear"
                        >
                            <X size={13} />
                        </button>
                    </div>
                )}

                {/* Error / denied / not_found message */}
                {['error', 'denied', 'not_found'].includes(locateState) && locateMsg && (
                    <p className="text-[11px] text-rose-500 font-medium">{locateMsg}</p>
                )}
            </div>

            {/* Ward Grid */}
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.15 } } }}
            >
                {wardActivity.map((ward) => {
                    const isFound = ward.id === foundWardId;
                    return (
                        <motion.div
                            key={ward.id}
                            ref={el => { wardRefs.current[ward.id] = el; }}
                            variants={{ hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } } }}
                            onClick={() => onSelect && WARD_COUNCILLORS[ward.id] && onSelect(WARD_COUNCILLORS[ward.id])}
                            className={`group p-6 rounded-[24px] border transition-all duration-500 ${
                                isFound
                                    ? 'bg-white border-[#004a99] shadow-[0_0_0_3px_rgba(0,74,153,0.15)] -translate-y-1 cursor-pointer'
                                    : ward.count > 0
                                    ? `bg-white/70 backdrop-blur-md border-slate-100 shadow-sm hover:border-[#004a99]/30 hover:shadow-2xl hover:-translate-y-1 ${onSelect && WARD_COUNCILLORS[ward.id] ? 'cursor-pointer' : 'cursor-default'}`
                                    : 'bg-slate-50/40 border-slate-100/50 opacity-40 grayscale cursor-default'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isFound ? 'text-[#004a99]' : 'text-slate-400'}`}>
                                    W{ward.id.padStart(2, '0')}
                                </span>
                                {isFound ? (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#004a99] rounded-full">
                                        <MapPin size={9} className="text-white" />
                                        <span className="text-[8px] font-black text-white uppercase tracking-tight">Your Ward</span>
                                    </div>
                                ) : ward.impactCount > 0 ? (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-tight">Impact</span>
                                    </div>
                                ) : null}
                            </div>

                            <h4 className={`text-xs font-black uppercase tracking-tight leading-tight mb-1 transition-colors ${isFound ? 'text-[#004a99]' : 'text-slate-900 group-hover:text-[#004a99]'}`}>
                                {ward.name}
                            </h4>
                            {WARD_COUNCILLORS[ward.id] && (
                                <p className={`text-[9px] font-bold mb-3 transition-colors truncate ${isFound ? 'text-[#004a99]/70' : 'text-slate-400 group-hover:text-[#004a99]/70'}`}>
                                    {WARD_COUNCILLORS[ward.id]}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{ward.count}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Items</span>
                                </div>
                                <div className={`p-2 rounded-xl transition-all ${isFound ? 'bg-[#004a99]/10 text-[#004a99]' : 'bg-slate-50 group-hover:bg-[#004a99]/10 group-hover:text-[#004a99]'}`}>
                                    <Activity size={14} className={isFound ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
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
