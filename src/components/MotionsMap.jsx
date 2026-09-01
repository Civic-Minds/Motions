import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { Link, useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';

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

export default function MotionsMap({ jurisdiction, motions = [] }) {
  const navigate = useNavigate();
  const hasWards = jurisdiction.geography === 'ward';
  const [wards, setWards] = useState(null);

  useEffect(() => {
    if (!hasWards) return;
    const blobBase = import.meta.env.VITE_BLOB_BASE_URL;
    const url = blobBase ? `${blobBase}/wards.geojson` : '/data/wards.geojson';
    fetch(url).then(r => r.json()).then(setWards).catch(() => {});
  }, [hasWards]);

  const pins = useMemo(() => motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [motions]);
  const mappedMotionCount = useMemo(() =>
    motions.filter(m => Array.isArray(m.locations) && m.locations.length > 0).length,
  [motions]);
  const topTopics = useMemo(() => {
    const counts = {};
    motions.forEach(m => {
      if (!Array.isArray(m.locations) || !m.locations.length || !m.topic || m.topic === 'General') return;
      counts[m.topic] = (counts[m.topic] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([topic]) => topic);
  }, [motions]);

  return (
    <div className="space-y-4 pb-20">
      <PageMeta
        title={`Map | Motions ${jurisdiction.name}`}
        description={`${jurisdiction.name} council motions plotted at their address, where one is on record.`}
      />

      <PageColumn>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Motions on the map</h1>
        <p className="mt-3 max-w-2xl text-slate-500">
          {hasWards
            ? <>This map plots motions at their exact address instead of by ward — see the <a href="/wards" className="font-semibold text-[#004a99] hover:underline">wards page</a> for that. </>
            : `${jurisdiction.name} doesn’t have wards — every seat is elected citywide — so this map plots motions at their address instead. `}
          Only {mappedMotionCount.toLocaleString()} of {motions.length.toLocaleString()} motions have one on record{topTopics.length > 0 && (
            <>, mostly {topTopics.map((topic, i) => (
              <span key={topic}>
                {i > 0 && ' and '}
                <Link to={`/?topic=${topic}`} className="font-semibold text-[#004a99] hover:underline">{topic.toLowerCase()}</Link>
              </span>
            ))} items</>
          )}.
        </p>
      </PageColumn>

      <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer
          center={jurisdiction.mapCenter}
          zoom={11}
          className="z-0 h-full w-full"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {wards && (
            <GeoJSON
              data={wards}
              interactive={false}
              style={{ color: '#004a99', weight: 1, fillColor: '#004a99', fillOpacity: 0.03 }}
            />
          )}
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
              <Tooltip direction="top" offset={[0, -6]} className="!w-52 !whitespace-normal">
                <div className="text-xs leading-tight">
                  <p className="line-clamp-2 font-semibold">{pin.motion.title}</p>
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
