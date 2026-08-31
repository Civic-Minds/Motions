import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
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

export default function VancouverMiniMap({ motions }) {
  const navigate = useNavigate();
  const pins = useMemo(() => motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [motions]);

  return (
    <div className="relative h-[calc(100vh-7rem)] min-h-[480px] w-full overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer
        center={[49.25, -123.1]}
        zoom={11}
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
            eventHandlers={{ click: () => navigate(`/motions/${pin.motion.id}`) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div className="max-w-48 text-xs">
                <p className="font-semibold leading-snug">{pin.motion.title.slice(0, 60)}{pin.motion.title.length > 60 ? '…' : ''}</p>
                {pin.address && <p className="mt-0.5 text-slate-500">{pin.address}</p>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2">
        <span className="whitespace-nowrap rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-[#004a99] shadow-sm backdrop-blur-sm">
          Mapped Vancouver motions
        </span>
      </div>
    </div>
  );
}
