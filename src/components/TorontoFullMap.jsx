import { useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { extractWardId } from '../utils/ward';
import { WARD_COUNCILLORS } from '../constants/data';
import { TORONTO_WARDS } from '../constants/wards';
import { getWardId } from '../utils/storage';
import { cn } from '../lib/utils';

export default function TorontoFullMap({ geojson, wardActivity }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const savedWardId = getWardId();
  const [hoveredWardId, setHoveredWardId] = useState(null);

  // Pre-compute bounds per ward from GeoJSON
  const wardBounds = useMemo(() => {
    if (!geojson || !window.L) return {};
    const out = {};
    geojson.features.forEach(f => {
      const id = extractWardId(f.properties);
      try { out[id] = window.L.geoJSON(f).getBounds(); } catch {}
    });
    return out;
  }, [geojson]);

  function flyToWard(wardId) {
    const map = mapRef.current;
    if (!map || !wardBounds[wardId]) return;
    map.flyToBounds(wardBounds[wardId], { duration: 0.4, padding: [48, 48] });
  }

  function resetView() {
    mapRef.current?.flyTo([43.718, -79.385], 11, { duration: 0.4 });
  }

  function wardStyle(feature) {
    const id = extractWardId(feature.properties);
    const isHovered = id === hoveredWardId;
    const isSaved = id === savedWardId;
    return {
      color: '#004a99',
      weight: isHovered || isSaved ? 2.5 : 1,
      fillColor: '#004a99',
      fillOpacity: isHovered ? 0.28 : isSaved ? 0.18 : 0.06,
    };
  }

  function onEachFeature(feature, layer) {
    const wardId = extractWardId(feature.properties);
    layer.on({ click: () => navigate(`/wards/${wardId}`) });
  }

  if (!geojson) return (
    <div className="w-full h-[420px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
  );

  const sortedWards = wardActivity
    ? [...wardActivity].sort((a, b) => Number(a.id) - Number(b.id))
    : TORONTO_WARDS.map(w => ({ ...w, count: 0 }));

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[420px]">
      <MapContainer
        ref={mapRef}
        center={[43.718, -79.385]}
        zoom={11}
        className="w-full h-full z-0"
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON
          key={hoveredWardId} // re-render style on hover change
          data={geojson}
          style={wardStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Card carousel — floats over bottom of map */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[400] px-3 pb-3 pt-8"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.85) 60%, transparent)' }}
      >
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
          onMouseLeave={() => { setHoveredWardId(null); resetView(); }}
        >
          {sortedWards.map(ward => {
            const councillor = WARD_COUNCILLORS[ward.id];
            const isSaved = ward.id === savedWardId;
            const isHovered = ward.id === hoveredWardId;
            return (
              <button
                key={ward.id}
                onMouseEnter={() => { setHoveredWardId(ward.id); flyToWard(ward.id); }}
                onClick={() => navigate(`/wards/${ward.id}`)}
                className={cn(
                  "shrink-0 w-36 text-left rounded-xl px-3 py-2 border transition-all",
                  isSaved
                    ? "bg-[#004a99] text-white border-[#004a99]"
                    : isHovered
                    ? "bg-white border-[#004a99]/40 shadow-md"
                    : "bg-white/90 border-slate-200 hover:border-[#004a99]/40"
                )}
              >
                <p className={cn("text-[9px] font-bold uppercase tracking-wide", isSaved ? "text-white/70" : "text-[#004a99]")}>
                  Ward {ward.id}
                </p>
                <p className={cn("text-xs font-semibold leading-snug mt-0.5 line-clamp-1", isSaved ? "text-white" : "text-slate-800")}>
                  {ward.name}
                </p>
                {councillor && (
                  <p className={cn("text-[9px] mt-0.5 truncate", isSaved ? "text-white/70" : "text-slate-400")}>
                    {councillor}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
