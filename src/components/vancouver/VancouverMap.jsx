import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { PageMeta } from '../PageMeta';
import { CivicSectionLabel } from '../ui/CivicCard';

function FitPins({ pins }) {
  const map = useMap();
  useMemo(() => {
    if (pins.length === 0) return;
    try {
      map.fitBounds(pins.map(pin => [pin.lat, pin.lng]), { padding: [32, 32], maxZoom: 13 });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function VancouverMap({ motions = [] }) {
  const navigate = useNavigate();
  const pins = useMemo(() => motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [motions]);
  const mappedMotionCount = useMemo(() =>
    motions.filter(m => Array.isArray(m.locations) && m.locations.length > 0).length,
  [motions]);

  return (
    <div className="space-y-4 pb-20">
      <PageMeta
        title="Map | Motions Vancouver"
        description="Vancouver council motions plotted at their address, where one is on record."
      />

      <div>
        <CivicSectionLabel>MAP</CivicSectionLabel>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Motions on the map</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          Vancouver doesn’t have wards — every seat is elected citywide — so this map shows individual motions at their address instead. Not every motion has one: {mappedMotionCount.toLocaleString()} of {motions.length.toLocaleString()} have a mapped location on record, mostly rezoning, development, and other address-specific items.
        </p>
      </div>

      <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer
          center={[49.25, -123.1]}
          zoom={11}
          className="z-0 h-full w-full"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitPins pins={pins} />
          {pins.map((pin, i) => (
            <CircleMarker
              key={`${pin.motion.id}-${i}`}
              center={[pin.lat, pin.lng]}
              radius={5}
              pathOptions={{
                color: 'transparent',
                fillColor: pin.motion.status === 'Adopted' ? '#10b981' : '#f43f5e',
                fillOpacity: 0.8,
                weight: 0,
              }}
              eventHandlers={{ click: () => navigate(`/motions/${pin.motion.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="max-w-52 text-xs leading-tight">
                  <p className="font-semibold">{pin.motion.title}</p>
                  {pin.address && <p className="mt-0.5 text-slate-500">{pin.address}</p>}
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Adopted</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Not adopted</span>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        Locations are matched from addresses named in the motion record where one is available. Motions without a specific address (most citywide policy items) aren’t shown here, but remain in the full record.
      </p>
    </div>
  );
}
