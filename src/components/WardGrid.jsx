import { getWardId } from '../utils/storage';
import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, MapPin } from 'lucide-react';
import YourWardCard from './YourWardCard';
const WardMotionMap = lazy(() => import('./WardMotionMap'));
const TorontoFullMap = lazy(() => import('./TorontoFullMap'));
import { motion, AnimatePresence } from 'framer-motion';
import { getWardActivityMetrics } from '../utils/analytics';
import { WARD_COUNCILLORS, TOPIC_LIGHT } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { cn } from '../lib/utils';
import { fetchWardBoundaries, extractWardId, pointInFeature } from '../utils/ward';
import { nameToSlug } from '../utils/slug';

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

  const foundWardId = getWardId();
  const [geoData, setGeoData] = useState(null);

  const selectedWard = wardIdParam
    ? TORONTO_WARDS.find(w => w.id === wardIdParam) ?? null
    : null;

  // Eagerly load GeoJSON for ward maps
  useEffect(() => {
    fetchWardBoundaries().then(setGeoData).catch(() => {});
  }, []);


  const wardMotions = useMemo(() => {
    if (!selectedWard) return [];
    return [...motions]
      .filter(m => !m.parentId && m.ward === selectedWard.id)
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.significance ?? 0) - (a.significance ?? 0);
      });
  }, [selectedWard, motions]);

  const selectedWardFeature = useMemo(() => {
    if (!geoData || !selectedWard) return null;
    return geoData.features.find(f => extractWardId(f.properties) === selectedWard.id) ?? null;
  }, [geoData, selectedWard]);

  return (
    <div className="space-y-8 pb-20">

      {selectedWard && (
        <h1 className="text-2xl font-bold text-slate-900">
          Ward {selectedWard.id} · {selectedWard.name}
        </h1>
      )}

      {!selectedWard ? (
        <>
          {/* Stats strip + Your Ward */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-stretch [&>*]:h-full">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Most Active</p>
              <p className="text-sm font-bold text-slate-900 truncate">W{topWard?.id} · {topWard?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{topWard?.count} motions</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total Motions</p>
              <p className="text-2xl font-black text-[#004a99]">{motions.length.toLocaleString()}</p>
              <p className="text-xs text-slate-400">2022–2026 term</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Coverage</p>
              <p className="text-2xl font-black text-slate-900">25</p>
              <p className="text-xs text-slate-400">wards tracked</p>
            </div>
            <YourWardCard motions={motions} />
          </div>

          {/* Full Toronto map */}
          <Suspense fallback={<div className="w-full h-[400px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />}>
            <TorontoFullMap geojson={geoData} wardActivity={wardActivity} />
          </Suspense>

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
            {/* Councillor callout */}
            {WARD_COUNCILLORS[selectedWard.id] && (() => {
              const name = WARD_COUNCILLORS[selectedWard.id];
              const lastName = name.split(' ').at(-1);
              const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
              const isMyWard = selectedWard.id === foundWardId;
              return (
                <div className="flex items-center gap-4 bg-[#004a99]/5 border border-[#004a99]/20 rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-xl bg-[#004a99] flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={`/images/councillors/${lastName}.jpg`}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                    />
                    <span className="text-white font-bold text-sm hidden w-full h-full items-center justify-center">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#004a99] uppercase tracking-wide mb-0.5">
                      {isMyWard ? 'Your Councillor' : 'Councillor'}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{name}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/councillors/${nameToSlug(name)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004a99] text-white text-xs font-semibold rounded-lg hover:bg-[#003875] transition-colors shrink-0"
                  >
                    View profile <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })()}
            {/* Map */}
            {(selectedWardFeature || wardMotions.some(m => m.locations?.length)) && (
              <Suspense fallback={<div className="w-full h-72 rounded-2xl bg-slate-100 animate-pulse" />}>
                <WardMotionMap
                  wardFeature={selectedWardFeature}
                  motions={wardMotions}
                />
              </Suspense>
            )}

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
                  onClick={() => navigate(`/motions/${m.id}`)}
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
    </div>
  );
}
