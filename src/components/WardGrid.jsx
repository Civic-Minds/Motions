import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Loader2, X, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWardActivityMetrics } from '../utils/analytics';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { cn } from '../lib/utils';

// ── Geolocation helpers ───────────────────────────────────────────────────────

function pointInRing(point, ring) {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

function pointInFeature(point, geometry) {
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polys.some(poly => pointInRing(point, poly[0]));
}

function extractWardId(props) {
  for (const key of ['WARD_NUM', 'WARD', 'ward_num', 'AREA_SHORT_CODE', 'ward']) {
    if (props[key] != null) return String(props[key]);
  }
  const name = props.AREA_NAME ?? props.area_name ?? '';
  const m = name.match(/\((\d+)\)/);
  return m ? m[1] : null;
}

let cachedBoundaries = null;

async function fetchWardBoundaries() {
  if (cachedBoundaries) return cachedBoundaries;
  const meta = await fetch(
    'https://ckan0.cf.opendata.inter.toronto.ca/api/3/action/package_show?id=city-wards'
  ).then(r => r.json());
  const resource = meta.result?.resources?.find(r =>
    r.format?.toLowerCase() === 'geojson' || r.url?.toLowerCase().includes('.geojson')
  );
  if (!resource) throw new Error('No GeoJSON resource found');
  cachedBoundaries = await fetch(resource.url).then(r => r.json());
  return cachedBoundaries;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WardGrid({ motions }) {
  const wardActivity = useMemo(() => getWardActivityMetrics(motions), [motions]);
  const topWard = [...wardActivity].sort((a, b) => b.count - a.count)[0];
  const totalWardMotions = wardActivity.reduce((s, w) => s + w.count, 0);

  const [locateState, setLocateState] = useState('idle'); // idle | locating | loading | found | not_found | denied | error
  const [locateMsg, setLocateMsg] = useState('');
  const [foundWardId, setFoundWardId] = useState(null);
  const wardRefs = useRef({});

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
        } catch {
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

  const isSearching = locateState === 'locating' || locateState === 'loading';
  const hasError = ['error', 'denied', 'not_found'].includes(locateState);

  return (
    <div className="space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wards</h1>
          <p className="text-sm text-slate-500 mt-0.5">25 wards · 2022–2026 term</p>
        </div>
        <div className="flex items-center gap-2">
          {locateState === 'found' && (
            <button
              onClick={() => { setLocateState('idle'); setFoundWardId(null); setLocateMsg(''); }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={isSearching ? undefined : handleLocate}
            disabled={isSearching}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
              locateState === 'found'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-white hover:bg-slate-700'
            )}
          >
            {isSearching
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Navigation className="w-4 h-4" />}
            {locateState === 'idle' && 'Find my ward'}
            {locateState === 'locating' && 'Requesting...'}
            {locateState === 'loading' && 'Detecting...'}
            {locateState === 'found' && `Ward ${foundWardId} found`}
            {hasError && 'Try again'}
          </button>
        </div>
      </div>

      {/* Error */}
      {hasError && locateMsg && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {locateMsg}
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Most Active</p>
          <p className="text-sm font-bold text-slate-900 truncate">W{topWard?.id} · {topWard?.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{topWard?.count} local motions</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Local Motions</p>
          <p className="text-2xl font-black text-[#004a99]">{totalWardMotions}</p>
          <p className="text-xs text-slate-400">across all wards</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Coverage</p>
          <p className="text-2xl font-black text-slate-900">25</p>
          <p className="text-xs text-slate-400">wards tracked</p>
        </div>
      </div>

      {/* Ward grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
      >
        {wardActivity.map((ward) => {
          const isFound = ward.id === foundWardId;
          const councillor = WARD_COUNCILLORS[ward.id];

          return (
            <motion.div
              key={ward.id}
              ref={el => { wardRefs.current[ward.id] = el; }}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } } }}
              className={cn(
                "group relative bg-white border rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200",
                isFound
                  ? 'border-[#004a99] shadow-lg shadow-blue-900/10 scale-[1.02]'
                  : 'border-slate-200 hover:border-[#004a99]/40 hover:shadow-md hover:-translate-y-0.5'
              )}
            >
              {isFound && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#004a99] text-white px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Your Ward
                </span>
              )}

              {/* Ward number + pulse dot */}
              <div className="flex items-center justify-between">
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", isFound ? 'text-[#004a99]' : 'text-slate-400')}>
                  Ward {ward.id}
                </span>
                {ward.count > 0 && !isFound && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>

              {/* Ward name + councillor */}
              <div className="flex-1">
                <p className={cn("text-sm font-semibold leading-snug transition-colors", isFound ? 'text-[#004a99]' : 'text-slate-900 group-hover:text-[#004a99]')}>
                  {ward.name}
                </p>
                {councillor && (
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{councillor}</p>
                )}
              </div>

              {/* Motion count */}
              <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className={cn("text-2xl font-black leading-none", isFound ? 'text-[#004a99]' : 'text-slate-800')}>
                    {ward.count}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">motions</span>
                </div>
                <ArrowRight className={cn("w-3.5 h-3.5 transition-colors", isFound ? 'text-[#004a99]' : 'text-slate-200 group-hover:text-[#004a99]')} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer note */}
      <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        Ward-specific motions are tagged based on geographic identifiers in council documents. Most council activity applies city-wide and appears across all councillor records.
      </div>
    </div>
  );
}
