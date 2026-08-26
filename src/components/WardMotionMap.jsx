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
        map.fitBounds(L.latLngBounds(pins.map(pin => [pin.lat, pin.lng])), { padding: [24, 24] });
      }
    } catch {
      return;
    }
  }, [feature, map, pins]);
  return null;
}

export default function WardMotionMap({ wardFeature, motions, isFullscreen = false, onToggleFullscreen }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isFullscreen) return;
    const frame = requestAnimationFrame(() => mapRef.current?.invalidateSize());
    return () => cancelAnimationFrame(frame);
  }, [isFullscreen]);

  // Motions with location data
  const pins = useMemo(() => motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  ), [motions]);

  return (
    <div className={isFullscreen
      ? 'fixed inset-0 z-[60] w-screen h-screen overflow-hidden bg-white'
      : 'relative w-full h-72 rounded-2xl overflow-hidden border border-slate-200'}
    >
      <MapContainer
        ref={mapRef}
        center={[43.7, -79.38]}
        zoom={12}
        className="w-full h-full z-0"
        zoomControl={true}
        scrollWheelZoom={false}
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
            <div className="text-xs max-w-48">
              <p className="font-semibold leading-snug">{pin.motion.title.slice(0, 60)}{pin.motion.title.length > 60 ? '…' : ''}</p>
              <p className="text-slate-500 mt-0.5">{pin.address}</p>
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
          className="absolute top-3 right-3 z-[500] flex items-center justify-center w-9 h-9 rounded-xl bg-white/95 border border-slate-200 text-slate-600 shadow-sm hover:text-[#004a99] hover:border-[#004a99]/40 transition-colors"
        >
          {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
