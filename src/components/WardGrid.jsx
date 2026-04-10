import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, MapPin } from 'lucide-react';
import YourWardCard from './YourWardCard';
import { motion, AnimatePresence } from 'framer-motion';
import { getWardActivityMetrics } from '../utils/analytics';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { cn } from '../lib/utils';
import { fetchWardBoundaries, extractWardId, pointInFeature } from '../utils/ward';

const TOPIC_LIGHT = {
  Housing: 'bg-blue-50 text-blue-700',
  Transit: 'bg-amber-50 text-amber-700',
  Finance: 'bg-emerald-50 text-emerald-700',
  Parks:   'bg-green-50 text-green-700',
  Climate: 'bg-teal-50 text-teal-700',
  General: 'bg-slate-100 text-slate-600',
};

// Simple SVG map of a ward polygon from GeoJSON feature
function WardMap({ feature }) {
  if (!feature) return null;

  const geom = feature.geometry;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const allCoords = polys.flatMap(p => p[0]);

  const lons = allCoords.map(c => c[0]);
  const lats = allCoords.map(c => c[1]);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const rangeW = maxLon - minLon || 0.001;
  const rangeH = maxLat - minLat || 0.001;

  const W = 300, H = 140;
  const pad = 12;
  const toX = lon => pad + ((lon - minLon) / rangeW) * (W - pad * 2);
  const toY = lat => H - pad - ((lat - minLat) / rangeH) * (H - pad * 2);

  const pathStrings = polys.map(poly =>
    poly[0].map((c, i) => `${i === 0 ? 'M' : 'L'}${toX(c[0]).toFixed(1)},${toY(c[1]).toFixed(1)}`).join(' ') + ' Z'
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-50 border border-slate-200">
      {pathStrings.map((d, i) => (
        <path key={i} d={d} fill="#dbeafe" stroke="#004a99" strokeWidth="1.5" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WardGrid({ motions }) {
  const { wardId: wardIdParam } = useParams();
  const navigate = useNavigate();
  const wardActivity = useMemo(() => getWardActivityMetrics(motions), [motions]);
  const topWard = [...wardActivity].sort((a, b) => b.count - a.count)[0];

  const [selectedMotion, setSelectedMotion] = useState(null);
  const foundWardId = (() => { try { return localStorage.getItem('motions_ward_id'); } catch { return null; } })();
  const [geoData, setGeoData] = useState(null);
  const wardRefs = useRef({});

  const selectedWard = wardIdParam
    ? TORONTO_WARDS.find(w => w.id === wardIdParam) ?? null
    : null;

  // Eagerly load GeoJSON for ward maps
  useEffect(() => {
    fetchWardBoundaries().then(setGeoData).catch(() => {});
  }, []);

  useEffect(() => {
    if (foundWardId && wardRefs.current[foundWardId]) {
      setTimeout(() => {
        wardRefs.current[foundWardId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [foundWardId]);

  const wardMotions = useMemo(() => {
    if (!selectedWard) return [];
    return [...motions]
      .filter(m => m.ward === selectedWard.id)
      .sort((a, b) => (b.significance ?? 0) - (a.significance ?? 0));
  }, [selectedWard, motions]);

  const selectedWardFeature = useMemo(() => {
    if (!geoData || !selectedWard) return null;
    return geoData.features.find(f => extractWardId(f.properties) === selectedWard.id) ?? null;
  }, [geoData, selectedWard]);

  return (
    <div className="space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selectedWard && (
            <button onClick={() => navigate('/wards')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {selectedWard ? `Ward ${selectedWard.id} · ${selectedWard.name}` : 'Wards'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {selectedWard
                ? `${WARD_COUNCILLORS[selectedWard.id]} · ${wardMotions.length} ward-specific motions`
                : '25 wards · 2022–2026 term'}
            </p>
          </div>
        </div>
      </div>

      {!selectedWard ? (
        <>
          {/* Stats strip + Your Ward */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Most Active</p>
              <p className="text-sm font-bold text-slate-900 truncate">W{topWard?.id} · {topWard?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{topWard?.count} motions</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total Motions</p>
              <p className="text-2xl font-black text-[#004a99]">{motions.length}</p>
              <p className="text-xs text-slate-400">2022–2026 term</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Coverage</p>
              <p className="text-2xl font-black text-slate-900">25</p>
              <p className="text-xs text-slate-400">wards tracked</p>
            </div>
            <YourWardCard motions={motions} />
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
                <motion.button
                  key={ward.id}
                  ref={el => { wardRefs.current[ward.id] = el; }}
                  onClick={() => navigate(`/wards/${ward.id}`)}
                  variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } } }}
                  className={cn(
                    "group relative bg-white border rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 text-left w-full",
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

                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", isFound ? 'text-[#004a99]' : 'text-slate-400')}>
                      Ward {ward.id}
                    </span>
                    {ward.count > 0 && !isFound && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className={cn("text-sm font-semibold leading-snug transition-colors", isFound ? 'text-[#004a99]' : 'text-slate-900 group-hover:text-[#004a99]')}>
                      {ward.name}
                    </p>
                    {councillor && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{councillor}</p>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className={cn("text-2xl font-black leading-none", isFound ? 'text-[#004a99]' : 'text-slate-800')}>
                        {ward.count}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">motions</span>
                    </div>
                    <ArrowRight className={cn("w-3.5 h-3.5 transition-colors", isFound ? 'text-[#004a99]' : 'text-slate-200 group-hover:text-[#004a99]')} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
            Motion counts are all-time (2022–2026 term). Ward-specific motions are tagged based on geographic identifiers in council documents. Most council activity applies city-wide.
          </div>
        </>
      ) : (
        /* ── Ward detail: motion list ── */
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWard.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {wardMotions.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-sm">No ward-specific motions recorded.</p>
                <p className="text-slate-300 text-xs mt-1">Most council activity is city-wide and won't appear here.</p>
              </div>
            ) : (
              wardMotions.map((m, i) => (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => setSelectedMotion(m)}
                  className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3 hover:border-[#004a99]/40 hover:shadow-sm transition-all group"
                >
                  <div className={cn("w-1 self-stretch rounded-full shrink-0", m.status === 'Adopted' ? 'bg-emerald-400' : 'bg-rose-400')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#004a99] transition-colors line-clamp-2 leading-snug">{m.title}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", m.status === 'Adopted' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>{m.status}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", TOPIC_LIGHT[m.topic] || 'bg-slate-100 text-slate-600')}>{m.topic}</span>
                      {m.significance >= 90 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">High Impact</span>}
                      {m.significance >= 60 && m.significance < 90 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Notable</span>}
                      <span className="text-xs text-slate-400 ml-auto">{m.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004a99] shrink-0 mt-0.5 transition-colors" />
                </motion.button>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
      <MotionPanel motion={selectedMotion} onClose={() => setSelectedMotion(null)} allMotions={motions} />
    </div>
  );
}
