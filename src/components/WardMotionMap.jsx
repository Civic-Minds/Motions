import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Maximize2, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fit map to the ward boundary on load/change
function FitBounds({ feature, pins }) {
  const map = useMap();
  useEffect(() => {
    const L = window.L;
    if (!L) return;
    try {
      if (feature) {
        map.fitBounds(L.geoJSON(feature).getBounds(), { padding: [24, 24] });
      } else if (pins.length > 0) {
        map.fitBounds(L.latLngBounds(pins.map(pin => [pin.lat, pin.lng])), { padding: [24, 24], maxZoom: 15 });
      }
    } catch {
      return;
    }
  }, [feature, map, pins]);
  return null;
}

export default function WardMotionMap({ wardFeature, motions, mapCenter = [43.7, -79.38], isFullscreen = false, onToggleFullscreen }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => mapRef.current?.invalidateSize());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  // Motions with location data
  const pins = useMemo(() => motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [motions]);

  return (
    <div className={isFullscreen
      ? 'fixed inset-0 z-[70] w-screen h-screen overflow-hidden bg-white'
      : 'relative w-full h-72 rounded-2xl overflow-hidden border border-slate-200'}
    >
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={12}
        className="w-full h-full z-0"
        zoomControl={true}
        scrollWheelZoom={isFullscreen}
      >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {!wardFeature && <FitBounds pins={pins} />}

      {/* Ward boundary */}
      {wardFeature && (
        <>
          <FitBounds feature={wardFeature} pins={pins} />
          <GeoJSON
            key={wardFeature.properties?.AREA_ID}
            data={wardFeature}
            style={{ color: '#004a99', weight: 2, fillColor: '#004a99', fillOpacity: 0.06 }}
          />
        </>
      )}

      {/* Motion pins */}
        {pins.map((pin, i) => (
        <CircleMarker
          key={i}
          center={[pin.lat, pin.lng]}
          radius={7}
          pathOptions={{
            color: '#004a99',
            fillColor: pin.motion.status === 'Adopted' ? '#10b981' : '#f43f5e',
            fillOpacity: 0.9,
            weight: 1.5,
          }}
          eventHandlers={{ click: () => navigate(`/motions/${pin.motion.id}`) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <div className="max-w-40 text-[10px] leading-tight">
              <p className="line-clamp-2 font-semibold">{pin.motion.title.slice(0, 48)}{pin.motion.title.length > 48 ? '…' : ''}</p>
              <p className="mt-0.5 text-[9px] text-slate-500">{pin.address}</p>
            </div>
          </Tooltip>
        </CircleMarker>
        ))}
      </MapContainer>

      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Close fullscreen map' : 'View map fullscreen'}
          title={isFullscreen ? 'Close fullscreen map' : 'View map fullscreen'}
          className="absolute right-4 top-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-600 shadow-md hover:border-[#004a99]/40 hover:text-[#004a99] transition-colors"
        >
          {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
