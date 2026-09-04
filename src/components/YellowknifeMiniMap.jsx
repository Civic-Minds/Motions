import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function FitPins({ pins }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;
    try {
      map.fitBounds(pins.map(pin => [pin.lat, pin.lng]), { padding: [32, 32], maxZoom: 13 });
    } catch {
      return;
    }
  }, [map, pins]);

  return null;
}

// Clicking empty map area opens the full map, matching Toronto's mini-map.
// Pin clicks stop propagation before this fires, so they still go to the
// motion instead.
function ClickToMap() {
  const navigate = useNavigate();
  useMapEvents({ click: () => navigate('/map') });
  return null;
}

export default function YellowknifeMiniMap({ motions }) {
  const navigate = useNavigate();
  const pins = useMemo(() => motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [motions]);

  return (
    <div className="group relative h-[calc(100vh-7rem)] min-h-[480px] w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={[62.454, -114.372]}
        zoom={12}
        className="z-0 h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitPins pins={pins} />
        <ClickToMap />
        {pins.map((pin, i) => (
          <CircleMarker
            key={`${pin.motion.id}-${i}`}
            center={[pin.lat, pin.lng]}
            radius={4}
            pathOptions={{
              color: 'transparent',
              fillColor: pin.motion.status === 'Adopted' ? '#10b981' : '#f43f5e',
              fillOpacity: 0.75,
              weight: 0,
            }}
            eventHandlers={{
              click: e => {
                L.DomEvent.stopPropagation(e);
                navigate(`/motions/${pin.motion.id}`);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} className="!w-40 !whitespace-normal">
              <div className="text-[10px] leading-tight">
                <p className="line-clamp-2 font-semibold">{pin.motion.title.slice(0, 48)}{pin.motion.title.length > 48 ? '…' : ''}</p>
                {pin.address && <p className="mt-0.5 text-[9px] text-slate-500">{pin.address}</p>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Decorative hover tint — pointer-events-none so pin clicks pass through to Leaflet */}
      <div className="pointer-events-none absolute inset-0 z-[400] bg-transparent transition-colors group-hover:bg-[#004a99]/5" />

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2">
        <span className="whitespace-nowrap rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-[#004a99] shadow-sm backdrop-blur-sm transition-colors group-hover:bg-[#004a99] group-hover:text-white">
          Explore the map →
        </span>
      </div>
    </div>
  );
}
