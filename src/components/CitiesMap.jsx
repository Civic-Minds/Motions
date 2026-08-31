import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CITY_PINS = [
  { name: 'Toronto', href: '/toronto', lat: 43.6532, lng: -79.3832 },
  { name: 'Vancouver', href: '/vancouver', lat: 49.2827, lng: -123.1207 },
];

function FitPins({ pins }) {
  const map = useMap();

  useEffect(() => {
    try {
      map.fitBounds(pins.map(pin => [pin.lat, pin.lng]), { padding: [56, 56] });
    } catch {
      return;
    }
  }, [map, pins]);

  return null;
}

export default function CitiesMap() {
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200 sm:h-[420px]">
      <MapContainer
        center={[52, -96]}
        zoom={3}
        className="z-0 h-full w-full"
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitPins pins={CITY_PINS} />
        {CITY_PINS.map(city => (
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
