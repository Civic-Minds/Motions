import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { COVERED_CITIES, OTHER_CITIES } from '../constants/cities';

// Fixed Canada-wide frame — independent of which cities are pinned, so the
// map always shows the whole country instead of cropping to the pins' bounds.
const CANADA_BOUNDS = [
  [41.5, -141],
  [68, -52],
];

function FitCanada() {
  const map = useMap();

  useEffect(() => {
    try {
      map.fitBounds(CANADA_BOUNDS, { padding: [16, 16] });
    } catch {
      return;
    }
  }, [map]);

  return null;
}

function ViewportSync({ onVisibleChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const visible = COVERED_CITIES.filter(city => bounds.contains([city.lat, city.lng])).map(city => city.href);
      onVisibleChange(visible);
    },
  });
  return null;
}

export default function CitiesMap({ onVisibleChange }) {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200 sm:h-[420px]">
      <MapContainer
        center={[56, -96]}
        zoom={3}
        className="z-0 h-full w-full"
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitCanada />
        {onVisibleChange && <ViewportSync onVisibleChange={onVisibleChange} />}
        {OTHER_CITIES.map(city => (
          <CircleMarker
            key={city.name}
            center={[city.lat, city.lng]}
            radius={5}
            pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: '#94a3b8', fillOpacity: 0.9 }}
          >
            <Tooltip direction="top" offset={[0, -6]} className="!rounded-full !border !border-slate-200 !bg-white !px-2 !py-0.5 !text-[11px] !font-medium !text-slate-600 !shadow-sm">
              {city.name} — not covered yet
            </Tooltip>
          </CircleMarker>
        ))}
        {COVERED_CITIES.map(city => (
          <CircleMarker
            key={city.name}
            center={[city.lat, city.lng]}
            radius={9}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#004a99', fillOpacity: 1 }}
            eventHandlers={{ click: () => { window.location.href = city.href; } }}
          >
            <Tooltip direction="top" offset={[0, -10]} permanent opacity={1} className="!rounded-full !border !border-slate-200 !bg-white !px-2.5 !py-1 !text-xs !font-semibold !text-[#004a99] !shadow-sm">
              {city.name}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
