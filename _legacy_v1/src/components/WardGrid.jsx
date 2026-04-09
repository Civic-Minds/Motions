import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MapPin, Activity, Info, Zap, Loader2, X, Compass, Target, Navigation, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWardActivityMetrics } from '../utils/analytics';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

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
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const statsItem = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
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
            setTimeout(() => {
                wardRefs.current[foundWardId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
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
        <div className="space-y-16 pb-20">
            
            {/* ── Page Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-2">
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-[#004a99]/10 flex items-center justify-center text-[#004a99]">
                             <Target size={22} strokeWidth={2.5} />
                         </div>
                         <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Neighborhood Tracking</h2>
                    </div>
                    <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none">Find your Ward</h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                        Identify your local district and see how localized council motions impact your immediate neighborhood.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={isSearching ? undefined : handleLocate}
                        disabled={isSearching}
                        className={cn(
                            "rounded-3xl h-20 px-10 font-black uppercase tracking-[0.15em] text-[13px] flex items-center gap-4 transition-all active:scale-95 shadow-xl",
                            locateState === 'found' 
                              ? "bg-emerald-600 text-white shadow-emerald-500/20" 
                              : "bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800"
                        )}
                    >
                        {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Navigation size={22} strokeWidth={2.5} />}
                        {locateState === 'idle'      && 'Locate Me'}
                        {locateState === 'locating'  && 'Requesting...'}
                        {locateState === 'loading'   && 'Detecting...'}
                        {locateState === 'found'     && `Located Ward ${foundWardId}`}
                        {['error', 'denied', 'not_found'].includes(locateState) && 'Try Again'}
                    </button>
                    
                    {locateState === 'found' && (
                         <Button variant="outline" className="w-20 h-20 rounded-[32px] p-0 border-2 border-slate-100 hover:bg-slate-50" onClick={handleReset}>
                             <X size={24} className="text-slate-400" />
                         </Button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {['error', 'denied', 'not_found'].includes(locateState) && locateMsg && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[32px] flex items-center gap-6 text-rose-700 mx-2"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-900/10">
                        <AlertCircle size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest mb-1">Location Error</p>
                        <p className="text-[15px] font-bold opacity-80">{locateMsg}</p>
                    </div>
                </motion.div>
            )}

            {/* Stats Row */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 px-2" variants={statsContainer} initial="hidden" animate="show">
                <Card className="md:col-span-2 overflow-hidden group" variants={statsItem}>
                    <CardContent className="p-10 flex flex-col sm:flex-row items-center gap-12 h-full relative">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-125" />
                        
                        <div className="flex-1 space-y-4 relative z-10">
                             <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#004a99]/5 rounded-xl">
                                    <Compass className="w-5 h-5 text-[#004a99]" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Global Impact</h3>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-8xl font-display font-black text-slate-900 tracking-tighter leading-none">{cityWideCount}</span>
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">City-Wide</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">
                                Policies applied Across all 25 Toronto divisions
                            </p>
                        </div>
                        <div className="hidden sm:block w-px h-24 bg-slate-100 relative z-10" />
                        <div className="flex-1 space-y-5 relative z-10 w-full sm:w-auto">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Critical Focal Point</h4>
                            <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100 transition-all group-hover:bg-white group-hover:shadow-xl group-hover:border-white">
                                <p className="text-[15px] font-black text-slate-900 mb-2 truncate">Ward {topWard?.id}: {topWard?.name}</p>
                                <div className="flex items-center gap-3 text-[11px] font-black text-[#004a99] uppercase tracking-widest">
                                    <Activity size={14} className="animate-pulse" />
                                    <span>{topWard?.count} Local Items</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] overflow-hidden group" variants={statsItem}>
                    <CardContent className="p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white to-emerald-50/20 relative">
                         <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                             <Zap size={80} strokeWidth={1} />
                         </div>
                         <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                                    <Zap size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">High Activity</h3>
                            </div>
                            <div>
                                <span className="text-7xl font-display font-black text-emerald-600 tracking-tighter leading-none">{highImpactWards}</span>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-60">Active Sectors</p>
                            </div>
                         </div>
                         <p className="text-[11px] text-emerald-600/60 font-black uppercase tracking-widest leading-relaxed mt-10 relative z-10">
                            Regions with high <br /> local visibility.
                         </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[40px] overflow-hidden group" variants={statsItem}>
                    <CardContent className="p-10 flex flex-col justify-between h-full bg-gradient-to-br from-white to-blue-50/20 relative">
                         <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                             <MapPin size={80} strokeWidth={1} />
                         </div>
                         <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#004a99]/5 rounded-xl text-[#004a99]">
                                    <MapPin size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Coverage</h3>
                            </div>
                            <div>
                                <span className="text-7xl font-display font-black text-[#004a99] tracking-tighter leading-none">25</span>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3 opacity-60">Monitored Zones</p>
                            </div>
                         </div>
                         <p className="text-[11px] text-[#004a99]/60 font-black uppercase tracking-widest leading-relaxed mt-10 relative z-10">
                            Entire municipal <br /> grid synchronized.
                         </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Ward Grid */}
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 px-2"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
            >
                {wardActivity.map((ward) => {
                    const isFound = ward.id === foundWardId;
                    const isEmpty = ward.count === 0;

                    return (
                        <motion.div
                            key={ward.id}
                            ref={el => { wardRefs.current[ward.id] = el; }}
                            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } } }}
                            onClick={() => !isEmpty && onSelect && WARD_COUNCILLORS[ward.id] && onSelect(WARD_COUNCILLORS[ward.id])}
                            className={cn(
                                "group p-10 rounded-[48px] border-2 transition-all duration-700 relative flex flex-col h-[320px]",
                                isFound
                                    ? 'bg-white border-[#004a99] shadow-2xl shadow-blue-900/10 scale-105 cursor-pointer z-10'
                                    : isEmpty
                                    ? 'bg-slate-50 border-slate-100 opacity-40 grayscale-[0.5] cursor-default hover:bg-white hover:opacity-100 transition-all duration-700'
                                    : 'bg-white border-slate-100 cursor-pointer hover:border-[#004a99]/30 hover:shadow-2xl hover:-translate-y-3'
                            )}
                        >
                            {isFound && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#004a99] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-950/20 whitespace-nowrap">
                                    Your Ward
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-8">
                                <span className={cn("text-[11px] font-black uppercase tracking-[0.2em]", isFound ? 'text-[#004a99]' : 'text-slate-400 group-hover:text-slate-600 transition-colors')}>
                                    Ward {ward.id}
                                </span>
                                {!isEmpty && !isFound && (
                                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse" />
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <h4 className={cn("text-[17px] font-black uppercase tracking-tight leading-tight transition-colors group-hover:text-[#004a99]", isFound ? 'text-slate-900' : 'text-slate-900')}>
                                    {ward.name}
                                </h4>
                                {WARD_COUNCILLORS[ward.id] && (
                                    <p className={cn("text-[12px] font-bold transition-colors truncate opacity-60", isFound ? 'text-[#004a99]' : 'text-slate-400 group-hover:text-[#004a99]')}>
                                        {WARD_COUNCILLORS[ward.id]}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-end justify-between pt-8 mt-auto">
                                <div className="flex flex-col">
                                    <span className={cn("text-6xl font-display font-black leading-none tracking-tighter", isFound ? 'text-[#004a99]' : 'text-slate-900')}>{ward.count}</span>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2 group-hover:text-slate-400 transition-colors">Local Items</span>
                                </div>
                                <div className={cn(
                                    "w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-500 border-2", 
                                    isFound ? 'bg-[#004a99]/10 border-white text-[#004a99] shadow-inner' : 'bg-slate-50 border-white text-slate-300 group-hover:bg-[#004a99] group-hover:text-white group-hover:shadow-xl'
                                )}>
                                    <ArrowRight size={22} className={cn("transition-transform duration-500", isFound ? "" : "group-hover:translate-x-0.5")} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

            </motion.div>

            {/* Info Message */}
            <div className="px-2">
                <Card className="rounded-[48px] bg-[#f8fafc]/50 border-2 border-slate-100 shadow-none overflow-hidden group">
                    <CardContent className="p-12 flex flex-col sm:flex-row items-start gap-10">
                        <div className="w-20 h-20 rounded-[32px] bg-white border border-slate-100 flex items-center justify-center text-[#004a99] shrink-0 shadow-sm transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                            <Info size={32} strokeWidth={2.5} />
                        </div>
                        <div className="space-y-4">
                            <h5 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] font-display">Regional Data Transparency</h5>
                            <p className="text-lg text-slate-500/80 leading-relaxed font-medium max-w-3xl font-sans">
                                Ward-specific motions are categorized based on geographical identifiers in council documents (e.g. Parks, Addresses, etc). <span className="text-slate-900 font-bold">Standard voting records for each councillor include city-wide decisions</span>, which represent the majority of council activity.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WardGrid;
