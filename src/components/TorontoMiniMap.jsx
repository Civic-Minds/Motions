import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// If a ward is saved, zoom to that ward's bounds after GeoJSON loads
function FocusWard({ geojson, wardId }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson || !wardId) return;
    const feature = geojson.features?.find(f =>
      String(f.properties?.AREA_SHORT_CODE || f.properties?.WARD_NUM || f.properties?.area_short_code) === String(wardId)
    );
    if (!feature) return;
    try {
      const L = window.L;
      const layer = L.geoJSON(feature);
      map.fitBounds(layer.getBounds(), { padding: [24, 24] });
    } catch {}
  }, [geojson, wardId, map]);
  return null;
}

export default function TorontoMiniMap({ motions }) {
  const navigate = useNavigate();
  const [wards, setWards] = useState(null);

  const savedWardId = (() => { try { const r = localStorage.getItem('motions_ward_id'); return r ? String(parseInt(r, 10)) : null; } catch { return null; } })();

  useEffect(() => {
    fetch('/data/wards.geojson').then(r => r.json()).then(setWards).catch(() => {});
  }, []);

  const pins = motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ lat: loc.lat, lng: loc.lng, status: m.status, id: m.id }))
  );

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group h-[480px]">
      <MapContainer
        center={[43.718, -79.385]}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {wards && (
          <>
            <FocusWard geojson={wards} wardId={savedWardId} />
            <GeoJSON
              data={wards}
              style={{ color: '#004a99', weight: 1.5, fillColor: '#004a99', fillOpacity: 0.05 }}
            />
          </>
        )}
        {pins.map((pin, i) => (
          <CircleMarker
            key={i}
            center={[pin.lat, pin.lng]}
            radius={4}
            pathOptions={{
              color: 'transparent',
              fillColor: pin.status === 'Adopted' ? '#10b981' : '#f43f5e',
              fillOpacity: 0.75,
              weight: 0,
            }}
          />
        ))}
      </MapContainer>

      {/* Click overlay — sits above Leaflet (z ≥ 400), captures all events */}
      <div
        className="absolute inset-0 z-[400] bg-transparent group-hover:bg-[#004a99]/5 transition-colors"
        onClick={() => navigate('/wards')}
      />

      {/* Label */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
        <span className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-[#004a99] shadow-sm group-hover:bg-[#004a99] group-hover:text-white transition-colors whitespace-nowrap">
          {savedWardId ? `Ward ${savedWardId} · Explore wards →` : 'Explore wards →'}
        </span>
      </div>
    </div>
  );
}
