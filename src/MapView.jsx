import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { MapPin, Heart, Play, LocateFixed, Maximize2, Loader2, Users } from 'lucide-react';
import { getYouTubeId } from './lib/videoUrl';
import { categoryLabelKey } from './lib/categories';
import { trackEvent } from './lib/analytics';
import { useI18n } from './i18n/useI18n';

// Coordenades centrals de Molins de Rei
const MOLINS_COORDS = [41.408, 2.015];

/* ==========================================================================
   Geocodificació amb caché i cua seqüencial
   - Els resultats bons es desen a localStorage: cada adreça es geocodifica
     UNA vegada per navegador, no a cada visita del mapa.
   - Les peticions noves van en cua amb ~1,1 s de separació (política d'ús
     de Nominatim: màx. 1 req/s), no en ràfega paral·lela.
   - Els errors de xarxa NO es persisteixen (es reintenta en la propera
     visita); només es persisteix el resultat (coordenades o "sense resultat").
   ========================================================================== */
const GEO_CACHE_KEY = 'md_geo_cache_v1';

const loadGeoCache = () => {
  try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY)) || {}; }
  catch { return {}; }
};
const saveGeoCache = (cache) => {
  try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache)); }
  catch { /* localStorage ple o no disponible: seguim amb la caché en memòria */ }
};

// Adreces amb petició en curs, a nivell de mòdul: si l'efecte es re-executa
// (nova instància de MapView, StrictMode, etc.) mentre una cua és en marxa,
// evita disparar una segona petició concurrent per a la mateixa adreça.
const inFlightLocations = new Set();

function useGeocodedLocations(videos) {
  const [resolved, setResolved] = useState(loadGeoCache);

  // Clau estable de les adreces úniques: NOMÉS canvia si el conjunt d'adreces
  // canvia de veritat, no a cada snapshot nou de Firestore (que crea un array
  // `videos` nou encara que el contingut sigui idèntic).
  const locKey = useMemo(
    () => [...new Set(videos.map(v => (v.location || '').trim()).filter(Boolean))].sort().join('\n'),
    [videos]
  );

  const locs = useMemo(() => (locKey ? locKey.split('\n') : []), [locKey]);

  const pending = useMemo(
    () => locs.filter(loc => !(loc in resolved)).length,
    [locs, resolved]
  );

  useEffect(() => {
    let cancelled = false;
    const cache = loadGeoCache();
    const missing = locs.filter(loc => !(loc in cache) && !inFlightLocations.has(loc));

    if (missing.length === 0) return;
    missing.forEach(loc => inFlightLocations.add(loc));

    (async () => {
      for (let i = 0; i < missing.length; i++) {
        if (cancelled) break;
        const loc = missing[i];
        try {
          const q = encodeURIComponent(`${loc}, Molins de Rei, Spain`);
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}&email=info@dancespace.cat`
          );
          // Un error HTTP (429/500/...) amb cos JSON no llençaria en fer .json():
          // cal comprovar resp.ok explícitament perquè caigui al catch (no persistit).
          if (!resp.ok) throw new Error(`Nominatim HTTP ${resp.status}`);
          const data = await resp.json();
          if (!Array.isArray(data)) throw new Error('Resposta inesperada de Nominatim');
          if (cancelled) break;
          const value = data[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
          // Merge sobre l'estat actual del disc (no sobre `cache`, que pot estar
          // obsolet si una altra execució ha escrit mentrestant): evita que una
          // execució cancel·lada esborri entrades ja persistides per una altra.
          saveGeoCache({ ...loadGeoCache(), [loc]: value });
          cache[loc] = value;
          setResolved(prev => ({ ...prev, [loc]: value }));
        } catch (err) {
          // Error transitori (xarxa): es marca només en memòria, SENSE persistir,
          // perquè es reintenti en la propera visita al mapa.
          console.error('Error geocodificant:', loc, err);
          if (!cancelled) setResolved(prev => ({ ...prev, [loc]: prev[loc] ?? null }));
        } finally {
          inFlightLocations.delete(loc);
        }
        // Respectar el límit d'1 petició/segon de Nominatim
        if (!cancelled && i < missing.length - 1) await new Promise(r => setTimeout(r, 1100));
      }
    })();

    return () => { cancelled = true; };
  }, [locs]);

  return { resolved, pending };
}

/* --- Icones ---------------------------------------------------------------- */
// Només hi ha 4 icones possibles (sense rànquing, #1, #2, #3): es creen UN
// SOL COP a nivell de mòdul. Si es construïssin inline a cada render, react-
// leaflet detectaria una identitat nova a cada snapshot de Firestore i faria
// setIcon() a TOTS els marcadors, reiniciant l'animació de pols cada cop.
const buildMarkerIcon = (rank) => {
  const rankCls = rank != null && rank < 3 ? ` rank-${rank + 1}` : '';
  const badge = rank != null && rank < 3 ? `<span class="md-rank">${rank + 1}</span>` : '';
  return L.divIcon({
    className: 'md-marker-wrap',
    html: `<div class="md-marker${rankCls}">${badge}<div class="md-ring"></div><div class="md-dot"></div></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -12],
  });
};
const MARKER_ICONS = {
  none: buildMarkerIcon(null),
  0: buildMarkerIcon(0),
  1: buildMarkerIcon(1),
  2: buildMarkerIcon(2),
};
const markerIcon = (rank) => MARKER_ICONS[rank != null && rank < 3 ? rank : 'none'];

const createClusterIcon = (cluster) => L.divIcon({
  html: `<div class="md-cluster">${cluster.getChildCount()}</div>`,
  className: 'md-cluster-wrap',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

// Evita que gestos (roda, arrossegar, doble clic) sobre un overlay HTML
// situat DINS del MapContainer arribin al mapa de Leaflet (zoom/pan no
// volguts). Cal per a qualsevol overlay que faci servir useMap().
const useStopMapPropagation = () => {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, [map]);
  return ref;
};

/* --- Controls sobre el mapa ------------------------------------------------ */
const MapControls = ({ positions }) => {
  const map = useMap();
  const { t } = useI18n();
  const wrapRef = useStopMapPropagation();
  const layerRef = useRef(null);
  const [locating, setLocating] = useState(false);

  // Deps [map] a propòsit: registra els listeners un sol cop per instància del
  // mapa. Re-executar-ho en canviar `t` (idioma) tornaria a registrar-los
  // duplicats; el text del popup "Ets aquí!" pot quedar-se en l'idioma actiu
  // en el moment del primer muntatge, acceptable per a aquest cas puntual.
  useEffect(() => {
    const onFound = (e) => {
      setLocating(false);
      if (layerRef.current) layerRef.current.remove();
      layerRef.current = L.layerGroup([
        L.circle(e.latlng, {
          radius: e.accuracy / 2,
          color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.12, weight: 1,
        }),
        L.circleMarker(e.latlng, {
          radius: 7, color: '#fff', weight: 2, fillColor: '#22d3ee', fillOpacity: 1,
        }).bindPopup(t('map.youAreHere')),
      ]).addTo(map);
      map.flyTo(e.latlng, 16, { duration: 1 });
    };
    const onError = () => setLocating(false);
    map.on('locationfound', onFound);
    map.on('locationerror', onError);
    return () => {
      map.off('locationfound', onFound);
      map.off('locationerror', onError);
      if (layerRef.current) layerRef.current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const handleLocate = () => { setLocating(true); map.locate(); };
  const handleFitAll = () => {
    if (positions.length === 0) return;
    // maxZoom evita que, amb un sol punt (bounds d'àrea zero), flyToBounds
    // voli fins al zoom màxim de la capa (20): és desorientador i les tiles
    // es veuen borroses/escalades.
    map.flyToBounds(L.latLngBounds(positions), { padding: [60, 60], duration: 1, maxZoom: 17 });
  };

  const btnCls = "w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900/85 text-gray-100 border border-white/15 shadow-lg backdrop-blur-md hover:bg-gray-800 hover:text-white transition-colors";

  return (
    <div ref={wrapRef} className="absolute top-20 right-3 z-[1000] flex flex-col gap-2">
      <button onClick={handleLocate} className={btnCls} aria-label={t('map.findMe')} title={t('map.findMe')}>
        {locating ? <Loader2 size={18} className="animate-spin text-cyan-400" /> : <LocateFixed size={18} className="text-cyan-400" />}
      </button>
      <button onClick={handleFitAll} className={btnCls} aria-label={t('map.fitAll')} title={t('map.fitAll')}>
        <Maximize2 size={18} className="text-rose-400" />
      </button>
    </div>
  );
};

/* --- Carrusel inferior d'actuacions ---------------------------------------- */
const VideoCarousel = ({ items, markerRefs, clusterRef, onOpenVideo }) => {
  const map = useMap();
  const { t } = useI18n();
  const wrapRef = useStopMapPropagation();

  const flyToVideo = ({ video, pos }) => {
    const marker = markerRefs.current[video.id];
    const cluster = clusterRef.current;
    // zoomToShowLayer gestiona el zoom I el spiderfy si el marcador està
    // agrupat en un clúster (Marker.openPopup() és un no-op si el marcador
    // no és al mapa, que és el cas de qualsevol marcador dins d'un clúster).
    if (cluster && marker) {
      cluster.zoomToShowLayer(marker, () => marker.openPopup());
    } else {
      map.flyTo(pos, 17, { duration: 0.9 });
    }
  };

  if (items.length === 0) return null;

  return (
    <div ref={wrapRef} className="md-carousel absolute bottom-3 left-3 right-3 z-[1000] flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const ytId = getYouTubeId(item.video.url);
        return (
          <div
            key={item.video.id}
            className="shrink-0 w-48 rounded-xl overflow-hidden bg-gray-900/85 border border-white/15 backdrop-blur-md shadow-lg hover:border-rose-500/60 transition-colors"
          >
            {/* Un únic <button> per a "anar-hi al mapa": no s'hi nia cap altre
                control interactiu (HTML no permet <button> dins de <button>,
                i ARIA prohibeix descendents interactius d'un rol button). */}
            <button
              onClick={() => flyToVideo(item)}
              className="relative h-16 w-full bg-gradient-to-br from-rose-900 to-gray-900 block text-left cursor-pointer"
              aria-label={t('map.goToVideo', { title: item.video.title })}
            >
              {ytId && (
                <img
                  src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 to-transparent" />
              <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-white truncate">{item.video.title}</span>
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-300 shrink-0">
                  <Heart size={9} className="fill-rose-400 text-rose-400" /> {item.video.votes ?? 0}
                </span>
              </div>
            </button>
            <div className="px-2 py-1 flex items-center justify-between gap-1">
              <span className="text-[10px] text-gray-400 truncate">{item.video.author}</span>
              <button
                onClick={() => onOpenVideo(item.video.id)}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 shrink-0"
              >
                {t('map.viewMore')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* --- Vista principal -------------------------------------------------------- */
const MapView = ({ onBack, videos = [] }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const markerRefs = useRef({});
  const clusterRef = useRef(null);
  const { resolved, pending } = useGeocodedLocations(videos);

  useEffect(() => { trackEvent('view_map'); }, []);

  const openVideo = useCallback((id) => navigate(`/video/${id}`), [navigate]);

  // Rànquing per vots (top 3 destacats al mapa)
  const rankById = useMemo(() => {
    const sorted = [...videos].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const m = {};
    sorted.slice(0, 3).forEach((v, i) => { m[v.id] = i; });
    return m;
  }, [videos]);

  // Vídeos amb coordenades resoltes, ordenats per vots (el carrusel segueix el rànquing)
  const located = useMemo(() => {
    return videos
      .map(v => ({ video: v, pos: resolved[(v.location || '').trim()] }))
      .filter(item => Array.isArray(item.pos))
      .sort((a, b) => (b.video.votes || 0) - (a.video.votes || 0));
  }, [videos, resolved]);

  const positions = useMemo(() => located.map(item => item.pos), [located]);

  return (
    <div className="max-w-6xl mx-auto h-[82vh] flex flex-col">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-4 flex items-center gap-1">← Tornar</button>

      <div className="relative flex-grow rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-950">
        {/* Capçalera de vidre sobre el mapa */}
        <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-gray-900/85 border border-white/15 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={18} className="text-rose-500 shrink-0" />
            <h2 className="font-bold text-sm md:text-base text-white truncate">{t('map.title')}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {pending > 0 && (
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
                <Loader2 size={12} className="animate-spin" /> {t('map.locating', { n: pending })}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-200 bg-rose-500/20 border border-rose-400/30 px-2.5 py-1 rounded-full">
              <Users size={12} /> {located.length}/{videos.length}
            </span>
          </div>
        </div>

        <MapContainer
          center={MOLINS_COORDS}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={false}
          className="md-map"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />

          <MapControls positions={positions} />

          <MarkerClusterGroup ref={clusterRef} chunkedLoading iconCreateFunction={createClusterIcon} maxClusterRadius={45}>
            {located.map(({ video, pos }) => {
              const rank = rankById[video.id];
              const ytId = getYouTubeId(video.url);
              return (
                <Marker
                  key={video.id}
                  position={pos}
                  icon={markerIcon(rank)}
                  ref={(m) => { markerRefs.current[video.id] = m; }}
                >
                  <Popup
                    className="md-popup"
                    offset={[0, -6]}
                    autoPanPaddingTopLeft={[16, 70]}
                    autoPanPaddingBottomRight={[16, 110]}
                  >
                    <div className="w-56">
                      <div
                        className="relative h-28 bg-gradient-to-br from-rose-900 to-gray-900 cursor-pointer group/thumb"
                        onClick={() => openVideo(video.id)}
                      >
                        {ytId && (
                          <img
                            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                            alt={video.title}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <span className="w-10 h-10 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                          </span>
                        </div>
                        {rank != null && rank < 3 && (
                          <span className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-wide text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full shadow">
                            {t('map.rankBadge', { n: rank + 1 })}
                          </span>
                        )}
                      </div>
                      <div className="px-3 py-2.5">
                        <h3 className="font-bold text-sm text-white leading-tight truncate">{video.title}</h3>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{video.author} · {categoryLabelKey(video.category) ? t(categoryLabelKey(video.category)) : video.category}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="flex items-center gap-1 text-xs font-bold text-rose-300">
                            <Heart size={12} className="fill-rose-400 text-rose-400" /> {video.votes ?? 0} {t('map.votes')}
                          </span>
                          <button
                            onClick={() => openVideo(video.id)}
                            className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-full transition-colors"
                          >
                            {t('map.viewAndVote')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>

          <VideoCarousel items={located} markerRefs={markerRefs} clusterRef={clusterRef} onOpenVideo={openVideo} />
        </MapContainer>

        {/* Estats buits */}
        {videos.length === 0 && (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center pointer-events-none">
            <span className="px-4 py-2 rounded-xl bg-gray-900/85 border border-white/15 text-sm text-gray-300 backdrop-blur-md">
              {t('map.empty')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
