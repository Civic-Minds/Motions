import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Fit map to the ward boundary on load/change
function FitBounds({ feature }) {
  const map = useMap();
  useEffect(() => {
    if (!feature) return;
    const L = window.L;
    if (!L) return;
    try {
      const layer = L.geoJSON(feature);
      map.fitBounds(layer.getBounds(), { padding: [24, 24] });
    } catch {}
  }, [feature, map]);
  return null;
}

export default function WardMotionMap({ wardFeature, motions }) {
  const navigate = useNavigate();

  // Motions with location data
  const pins = motions.flatMap(m =>
    (m.locations ?? []).map(loc => ({ ...loc, motion: m }))
  );

  return (
    <MapContainer
      center={[43.7, -79.38]}
      zoom={12}
      className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 z-0"
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Ward boundary */}
      {wardFeature && (
        <>
          <FitBounds feature={wardFeature} />
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
  );
}
