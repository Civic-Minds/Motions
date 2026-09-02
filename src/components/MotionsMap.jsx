import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';
import { formatMotionDate } from '../utils/date';

// If a specific motion was requested (arrived here via a "see it on the map"
// link), center on that pin instead of fitting to every pin.
function FitPins({ pins, focusPin }) {
  const map = useMap();
  useMemo(() => {
    if (focusPin) {
      map.setView([focusPin.lat, focusPin.lng], 16);
      return;
    }
    if (pins.length === 0) return;
    try {
      map.fitBounds(pins.map(pin => [pin.lat, pin.lng]), { padding: [32, 32], maxZoom: 13 });
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusPin]);
  return null;
}

export default function MotionsMap({ jurisdiction, motions = [] }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const hasWards = jurisdiction.geography === 'ward';
  const [wards, setWards] = useState(null);
  const focusedMarkerRef = useRef(null);
  const [topicFilter, setTopicFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');

  useEffect(() => {
    if (!hasWards) return;
    const blobBase = import.meta.env.VITE_BLOB_BASE_URL;
    const url = blobBase ? `${blobBase}/wards.geojson` : '/data/wards.geojson';
    fetch(url).then(r => r.json()).then(setWards).catch(() => {});
  }, [hasWards]);

  const topics = useMemo(() => ['All', ...new Set(motions
    .filter(m => Array.isArray(m.locations) && m.locations.length > 0 && m.topic && m.topic !== 'General')
    .map(m => m.topic)
    .sort())], [motions]);
  const filteredMotions = useMemo(() => motions.filter(m => {
    const matchesTopic = topicFilter === 'All' || m.topic === topicFilter;
    const matchesOutcome = outcomeFilter === 'All'
      || (outcomeFilter === 'Adopted' ? m.status === 'Adopted' : m.status !== 'Adopted');
    return matchesTopic && matchesOutcome;
  }), [motions, outcomeFilter, topicFilter]);
  const pins = useMemo(() => filteredMotions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [filteredMotions]);
  const focusPin = useMemo(() =>
    focusId ? pins.find(pin => String(pin.motion.id) === focusId) : null,
  [pins, focusId]);

  useEffect(() => {
    focusedMarkerRef.current?.openTooltip();
  }, [focusPin]);
  const mappedMotionCount = useMemo(() =>
    filteredMotions.filter(m => Array.isArray(m.locations) && m.locations.length > 0).length,
  [filteredMotions]);
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
            ? <>Motions plotted at their exact address. To browse by ward instead, see <a href="/wards" className="font-semibold text-[#004a99] hover:underline">wards</a>. </>
            : jurisdiction.id === 'vancouver'
              ? `${jurisdiction.name} has no wards — every seat is elected citywide — so motions are plotted at their address instead. `
              : `Ward boundaries aren’t mapped for ${jurisdiction.name} yet, so motions are plotted at their address instead. `}
          {mappedMotionCount.toLocaleString()} of {motions.length.toLocaleString()} have an address on record{topTopics.length > 0 && (
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
          <FitPins pins={pins} focusPin={focusPin} />
          {pins.map((pin, i) => {
            const isFocused = focusId && String(pin.motion.id) === focusId;
            return (
            <CircleMarker
              key={`${pin.motion.id}-${i}`}
              ref={isFocused ? focusedMarkerRef : undefined}
              center={[pin.lat, pin.lng]}
              radius={isFocused ? 9 : 5}
              pathOptions={{
                color: isFocused ? '#004a99' : 'transparent',
                weight: isFocused ? 3 : 0,
                fillColor: pin.motion.status === 'Adopted' ? '#10b981' : '#f43f5e',
                fillOpacity: 0.8,
              }}
              eventHandlers={{ click: () => navigate(`/motions/${pin.motion.id}`) }}
            >
              <Tooltip direction="top" offset={[0, -6]} className="!w-56 !rounded-xl !border !border-slate-200 !bg-white !whitespace-normal !shadow-lg">
                <div className="text-xs leading-tight">
                  <p className="line-clamp-2 font-semibold">{pin.motion.title}</p>
                  {pin.address && <p className="mt-0.5 text-slate-500">{pin.address}</p>}
                  {pin.motion.summary && <p className="mt-1 line-clamp-2 text-slate-600">{pin.motion.summary}</p>}
                  <p className="mt-1 text-slate-500">{pin.motion.status} · {formatMotionDate(pin.motion.date)}</p>
                </div>
              </Tooltip>
            </CircleMarker>
            );
          })}
        </MapContainer>

        {(topics.length > 1 || motions.some(m => m.status !== 'Adopted')) && (
          <div className="absolute left-14 top-3 z-[500] flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md">
            {topics.length > 1 && (
              <label className="flex items-center gap-1.5">
                <span>Topic</span>
                <select value={topicFilter} onChange={event => setTopicFilter(event.target.value)} className="bg-transparent font-normal text-slate-600 outline-none">
                  <option value="All">All topics</option>
                  {topics.slice(1).map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>
              </label>
            )}
            <label className="flex items-center gap-1.5">
              <span>Outcome</span>
              <select value={outcomeFilter} onChange={event => setOutcomeFilter(event.target.value)} className="bg-transparent font-normal text-slate-600 outline-none">
                <option value="All">All outcomes</option>
                <option value="Adopted">Adopted</option>
                <option value="Not adopted">Not adopted</option>
              </select>
            </label>
          </div>
        )}

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
