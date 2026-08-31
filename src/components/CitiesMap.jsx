import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { COVERED_CITIES, ROADMAP_CITIES } from '../constants/cities';
import { JURISDICTIONS } from '../constants/jurisdictions';
import { isOnOrAfter, formatElectionDateFull } from '../utils/electionDate';
import 'leaflet/dist/leaflet.css';

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

function ViewportSync({ onChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const inView = city => bounds.contains([city.lat, city.lng]);
      onChange({
        covered: COVERED_CITIES.filter(inView).map(city => city.href),
        roadmap: ROADMAP_CITIES.filter(inView).map(city => city.name),
      });
    },
  });
  return null;
}

export default function CitiesMap() {
  const [visible, setVisible] = useState({
    covered: COVERED_CITIES.map(city => city.href),
    roadmap: ROADMAP_CITIES.map(city => city.name),
  });
  const shownCovered = COVERED_CITIES.filter(city => visible.covered.includes(city.href));
  const shownRoadmap = ROADMAP_CITIES.filter(city => visible.roadmap.includes(city.name));
  const anyVisible = shownCovered.length > 0 || shownRoadmap.length > 0;
  const coveredCards = anyVisible ? shownCovered : COVERED_CITIES;
  const roadmapCards = anyVisible ? shownRoadmap : [];

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-slate-200 sm:h-[560px]">
      <MapContainer
        center={[56, -96]}
        zoom={3}
        className="z-0 h-full w-full"
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitCanada />
        <ViewportSync onChange={setVisible} />
        {ROADMAP_CITIES.map(city => (
          <CircleMarker
            key={city.name}
            center={[city.lat, city.lng]}
            radius={5}
            pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: '#94a3b8', fillOpacity: 0.9 }}
          >
            <Tooltip direction="top" offset={[0, -6]} className="!rounded-full !border !border-slate-200 !bg-white !px-2 !py-0.5 !text-[11px] !font-medium !text-slate-600 !shadow-sm">
              {city.name}
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

      {/* Card carousel — floats over bottom of map, matching TorontoFullMap */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[400] px-3 pb-3 pt-8"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.9) 60%, transparent)' }}
      >
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {coveredCards.map(city => {
            const election = JURISDICTIONS[city.id]?.election;
            const electionUpcoming = election && !isOnOrAfter(election.date);
            return (
              <a
                key={city.name}
                href={city.href}
                className={cn(
                  'shrink-0 w-56 rounded-xl border bg-white/95 px-3 py-2.5 text-left shadow-sm transition-all',
                  'border-slate-200 hover:border-[#004a99]/40 hover:shadow-md',
                )}
              >
                <p className="text-sm font-semibold text-slate-900">{city.name}</p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{city.tagline}</p>
                {electionUpcoming && (
                  <p className="mt-0.5 text-[11px] text-slate-500">Election {formatElectionDateFull(election.date)}</p>
                )}
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#004a99]">
                  Explore {city.name} <ArrowRight className="h-3 w-3" />
                </span>
              </a>
            );
          })}
          {roadmapCards.map(city => (
            <div
              key={city.name}
              className="shrink-0 w-48 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-left"
            >
              <p className="text-sm font-semibold text-slate-500">{city.name}</p>
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Planned</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
