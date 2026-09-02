import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Maximize2, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { PageMeta } from './PageMeta';
import PageColumn from './PageColumn';
import MapZoomControls from './MapZoomControls';
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
  const mapRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [topicFilters, setTopicFilters] = useState([]);
  const [outcomeFilters, setOutcomeFilters] = useState(['Adopted', 'Not adopted']);

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
    const matchesTopic = topicFilters.length === 0 || topicFilters.includes(m.topic);
    const motionOutcome = m.status === 'Adopted' ? 'Adopted' : 'Not adopted';
    const matchesOutcome = outcomeFilters.includes(motionOutcome);
    return matchesTopic && matchesOutcome;
  }), [motions, outcomeFilters, topicFilters]);
  const pins = useMemo(() => filteredMotions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [filteredMotions]);
  const focusPin = useMemo(() =>
    focusId ? pins.find(pin => String(pin.motion.id) === focusId) : null,
  [pins, focusId]);

  useEffect(() => {
    focusedMarkerRef.current?.openTooltip();
  }, [focusPin]);

  useEffect(() => {
    if (!isFullscreen) return;
    const frame = requestAnimationFrame(() => mapRef.current?.invalidateSize());
    return () => cancelAnimationFrame(frame);
  }, [isFullscreen]);
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

      <div className={`relative w-full overflow-hidden border border-slate-200 ${isFullscreen ? 'fixed inset-0 z-[60] h-screen rounded-none' : 'h-[560px] rounded-2xl'}`}>
        <MapContainer
          ref={mapRef}
          center={jurisdiction.mapCenter}
          zoom={11}
          className="z-0 h-full w-full"
          attributionControl={false}
          zoomControl={false}
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

        <button
          type="button"
          onClick={() => setIsFullscreen(open => !open)}
          aria-label={isFullscreen ? 'Close fullscreen map' : 'View map fullscreen'}
          title={isFullscreen ? 'Close fullscreen map' : 'View map fullscreen'}
          className="absolute right-3 top-3 z-[500] flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/95 text-slate-600 shadow-md transition-colors hover:border-[#004a99]/40 hover:text-[#004a99]"
        >
          {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <MapZoomControls mapRef={mapRef} className="top-[4.5rem]" />

        <div className="absolute left-3 top-3 z-[500] flex max-w-[calc(100%-7rem)] flex-wrap gap-2">
          {(topics.length > 1 || motions.some(m => m.status !== 'Adopted')) && (
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md">
              {topics.length > 1 && (
                <details className="relative">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
                    <span>Topic</span>
                    <span className="font-normal text-slate-600">{topicFilters.length === 0 ? 'All topics' : `${topicFilters.length} selected`}</span>
                    <span className="text-slate-500">⌄</span>
                  </summary>
                  <div className="absolute left-0 top-full z-10 mt-2 max-h-64 min-w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 font-normal text-slate-700 shadow-lg">
                    <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={topicFilters.length === 0}
                        onChange={() => setTopicFilters([])}
                        className="accent-[#004a99]"
                      />
                      All topics
                    </label>
                    {topics.slice(1).map(topic => (
                      <label key={topic} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={topicFilters.includes(topic)}
                          onChange={() => setTopicFilters(current => current.includes(topic)
                            ? current.filter(selected => selected !== topic)
                            : [...current, topic])}
                          className="accent-[#004a99]"
                        />
                        {topic}
                      </label>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 px-2 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm">
            {['Adopted', 'Not adopted'].map(outcome => {
              const active = outcomeFilters.includes(outcome);
              const adopted = outcome === 'Adopted';
              return (
                <button
                  key={outcome}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setOutcomeFilters(current => active
                    ? current.filter(selected => selected !== outcome)
                    : [...current, outcome])}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${active ? 'text-slate-600 hover:bg-slate-50' : 'bg-slate-100 text-slate-400'}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${active ? adopted ? 'bg-emerald-500' : 'bg-rose-500' : 'bg-slate-300'}`} />
                  {outcome}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-400">
        Locations are matched from addresses named in the motion record where one is available. Motions without a specific address (most citywide policy items) aren’t shown here, but remain in the full record.
      </p>
    </div>
  );
}
