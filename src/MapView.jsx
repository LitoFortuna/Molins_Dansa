import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- COMPONENT: GEOCODED MARKER ---
// TODO (següent millora del mapa): geocodificar una vegada en pujar el vídeo i
// guardar lat/lng al document, en lloc de cridar Nominatim per cada marcador.
const GeocodedMarker = ({ location, title, author, url }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const geocode = async () => {
      try {
        // Afegim "Molins de Rei" per assegurar que busca a la ciutat correcta
        const query = encodeURIComponent(`${location}, Molins de Rei, Spain`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.error("Error geocoding:", location, err);
      }
    };
    if (location) geocode();
  }, [location]);

  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>
        <div className="text-center">
          <strong className="block text-rose-600 mb-1">{title}</strong>
          <span className="text-xs text-gray-500">{author}</span>
          <br />
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold underline mt-1 block">Veure Vídeo</a>
        </div>
      </Popup>
    </Marker>
  );
};

const LocationButton = () => {
  const map = useMap();

  const handleLocate = () => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 16);
      L.circle(e.latlng, { radius: e.accuracy / 2, color: 'blue', fillColor: '#3b82f6', fillOpacity: 0.2 }).addTo(map);
      L.marker(e.latlng).addTo(map).bindPopup("Ets aquí!").openPopup();
    });
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute top-4 right-4 z-[1000] bg-white text-gray-700 p-2 rounded-lg shadow-md hover:bg-gray-50 focus:outline-none border border-gray-200 font-bold text-xs flex items-center gap-2"
    >
      <MapPin size={16} className="text-rose-600" /> On soc?
    </button>
  );
};

const MapView = ({ onBack, videos = [] }) => {
  // Coordenades centrals de Molins de Rei
  const MOLINS_COORDS = [41.408, 2.015];

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-4 flex items-center gap-1">← Tornar</button>
      <div className="bg-white rounded-xl overflow-hidden flex-grow flex flex-col shadow-xl border-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 relative shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="text-rose-600" />
            <h2 className="font-bold text-lg">Mapa en Temps Real 2026</h2>
          </div>
          <span className="text-xs bg-rose-100 text-rose-800 px-2 py-1 rounded-full font-medium">
            {videos.length} ubicacions
          </span>
        </div>
        <div className="flex-grow relative z-0">
          <MapContainer center={MOLINS_COORDS} zoom={15} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationButton />
            <MarkerClusterGroup chunkedLoading>
              {videos.map(video => (
                <GeocodedMarker
                  key={video.id}
                  location={video.location}
                  title={video.title}
                  author={video.author}
                  url={video.url}
                />
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapView;
