import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import {
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  setDoc
} from "firebase/firestore";
import { auth, db } from './firebase';

import { ADMIN_UID, VIEW_PATHS, SEED_VIDEOS } from './lib/constants';
import { Button } from './components/ui';
import { AuthView } from './features/auth/AuthView';
import { UploadView } from './features/upload/UploadView';
import { GalleryView } from './features/videos/GalleryView';
import { HomeView } from './pages/HomeView';
import { PrizesView } from './pages/PrizesView';
import { BasesView } from './pages/BasesView';
import { PrivacyView } from './pages/PrivacyView';
import { SchoolsView } from './pages/SchoolsView';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';

// --- MAP VIEW ---
// Carregat de forma diferida: Leaflet + markercluster (~150 KB) queden fora del
// bundle inicial i només es descarreguen quan s'obre el mapa. Veure src/MapView.jsx.
const MapView = lazy(() => import('./MapView'));

// Torna a dalt en cada canvi de ruta.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

// Protegeix /participa: cal sessió no anònima (auth.currentUser és sempre actual).
function RequireAuth({ children }) {
  if (auth.currentUser && !auth.currentUser.isAnonymous) return children;
  return <Navigate to="/identificacio" replace />;
}

// Passa l'id de la ruta /video/:id al render.
function RouteWithVideoId({ render }) {
  const { id } = useParams();
  return render(id);
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Main />
    </BrowserRouter>
  );
}

function Main() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // Vídeos ja votats EN AQUESTA CÀRREGA de la pàgina: viu només en memòria,
  // així que un refresc del navegador el reinicia i es pot tornar a votar.
  // No és una protecció anti-frau (això requeriria un vot per usuari al
  // servidor); és només per evitar votar el mateix vídeo diverses vegades
  // clicant repetidament dins la mateixa visita.
  const [votedIds, setVotedIds] = useState(() => new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contestConfig, setContestConfig] = useState({});
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
      } catch (e) {
        console.error("Error en l'inici de sessió anònim:", e);
      }
    };
    initAuth();
    // AUTH LISTENER PARA ADMIN Y USER
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // CHECK ADMIN STATUS AUTOMATICALLY
      if (currentUser && currentUser.uid === ADMIN_UID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Lectura pública (firestore.rules: allow read: if true), independent de
  // l'auth: si signInAnonymously falla, la galeria ha de carregar igualment
  // en lloc de quedar-se "Carregant vídeos..." per sempre.
  useEffect(() => {
    const q = query(collection(db, 'videos'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const vids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(vids);
        setLoading(false);
      },
      (err) => {
        console.error("Error carregant els vídeos:", err);
        setLoading(false);
        setNotification("Error carregant els vídeos: " + err.message);
        setTimeout(() => setNotification(null), 5000);
      }
    );
    return () => unsubscribe();
  }, []);

  // Config del concurs (dates de fases): lectura pública, no depèn de l'auth.
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'concurs'), (snap) => {
      setContestConfig(snap.exists() ? snap.data() : {});
      setConfigLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Vídeos visibles públicament (aprovats, o sense status per compatibilitat
  // amb vídeos anteriors a la moderació): és el que mostra el mapa.
  const approvedVideos = useMemo(
    () => videos.filter(v => v.status === 'aprovat' || v.status == null),
    [videos]
  );

  const seedDatabase = async () => {
    if (!user) return;
    try {
      setNotification("Sembrant base de dades...");
      for (const video of SEED_VIDEOS) { await addDoc(collection(db, 'videos'), { ...video, userId: 'system' }); }
      setNotification("Dades d'exemple carregades!"); setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
      setNotification("Error: " + e.message);
    }
  };

  const handleUploadSuccess = () => navigate('/enviat');

  // --- LOGICA DE VOT DUAL ---
  const handleVote = async (id) => {
    if (votedIds.has(id)) return; // ja votat en aquesta càrrega de pàgina
    const video = videos.find(v => v.id === id);
    if (!video) return;

    // Determinar valor del vot
    const isPremium = user && !user.isAnonymous;
    const points = isPremium ? 5 : 1;

    // Marca el vot ABANS de l'escriptura: evita que un doble clic ràpid
    // (dues invocacions abans que React re-renderitzi) passi el guard de dalt
    // dues vegades. Si l'escriptura falla, es desfà per permetre reintentar.
    setVotedIds(prev => new Set(prev).add(id));

    try {
      await updateDoc(doc(db, 'videos', id), { votes: video.votes + points });
      setNotification(`Vot registrat (+${points} punts)!`);
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      console.error(err);
      setVotedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      setNotification("Error: " + err.message);
    }
  };

  const handleShare = async (video) => {
    const url = `${window.location.origin}/video/${video.id}`;
    const shareData = { title: video.title, text: `Vota ${video.title} a Molins Dansa!`, url };
    if (navigator.share) { try { await navigator.share(shareData); } catch { /* compartir cancel·lat per l'usuari */ } }
    else { navigator.clipboard.writeText(`${shareData.text} ${url}`); setNotification("Enllaç copiat!"); setTimeout(() => setNotification(null), 3000); }
  };
  const handleAdminUpdateVotes = async (id, newVotes) => {
    try { await updateDoc(doc(db, 'videos', id), { votes: Math.max(0, newVotes) }); }
    catch (err) { console.error(err); setNotification("Error en actualitzar els vots: " + err.message); setTimeout(() => setNotification(null), 3000); }
  };
  const handleAdminDelete = async (id) => {
    if (confirm("Eliminar?")) {
      try { await deleteDoc(doc(db, 'videos', id)); }
      catch (err) { console.error(err); setNotification("Error en eliminar: " + err.message); setTimeout(() => setNotification(null), 3000); }
    }
  };
  const handleAdminModerate = async (id, status) => {
    try { await updateDoc(doc(db, 'videos', id), { status }); }
    catch (err) { console.error(err); setNotification("Error en moderar: " + err.message); setTimeout(() => setNotification(null), 3000); }
  };
  const handleSaveConfig = async (dates) => {
    try {
      await setDoc(doc(db, 'config', 'concurs'), dates, { merge: true });
      setNotification("Dates desades!"); setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
      setNotification("Error en desar les dates: " + err.message); setTimeout(() => setNotification(null), 3000);
    }
  };
  const navigateTo = (view) => {
    setMobileMenuOpen(false);
    if (view === 'upload' && (!user || user.isAnonymous)) {
      setNotification("Registra't primer"); setTimeout(() => setNotification(null), 3000);
      navigate(VIEW_PATHS.auth);
      return;
    }
    navigate(VIEW_PATHS[view] || '/');
  };
  const handleLogout = async () => { setMobileMenuOpen(false); await signOut(auth); setNotification("Adéu!"); navigate('/'); setTimeout(() => setNotification(null), 3000); await signInAnonymously(auth); };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 flex flex-col">
      <Navbar
        user={user}
        isAdmin={isAdmin}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigateTo={navigateTo}
        handleLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex-grow w-full">
        {notification && <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50"><CheckCircle className="text-green-400" size={20} />{notification}</div>}
        <Routes>
          <Route path="/" element={<HomeView onNavigate={navigateTo} contestConfig={contestConfig} />} />
          <Route path="/galeria" element={<GalleryView videos={videos} loading={loading} onVote={handleVote} onBack={() => navigateTo('home')} isAdmin={isAdmin} onUpdateVotes={handleAdminUpdateVotes} onDelete={handleAdminDelete} onModerate={handleAdminModerate} onShare={handleShare} user={user} onNavigate={navigateTo} highlightId={null} contestConfig={contestConfig} votedIds={votedIds} />} />
          <Route path="/video/:id" element={<RouteWithVideoId render={(id) => <GalleryView videos={videos} loading={loading} onVote={handleVote} onBack={() => navigateTo('home')} isAdmin={isAdmin} onUpdateVotes={handleAdminUpdateVotes} onDelete={handleAdminDelete} onModerate={handleAdminModerate} onShare={handleShare} user={user} onNavigate={navigateTo} highlightId={id} contestConfig={contestConfig} votedIds={votedIds} />} />} />
          <Route path="/mapa" element={<Suspense fallback={<div className="text-center py-20 text-gray-400">Carregant mapa…</div>}><MapView onBack={() => navigateTo('home')} videos={approvedVideos} /></Suspense>} />
          <Route path="/identificacio" element={<AuthView onLoginSuccess={() => navigate('/participa')} onCancel={() => navigateTo('home')} />} />
          <Route path="/participa" element={<RequireAuth><UploadView onUploadSuccess={handleUploadSuccess} onCancel={() => navigateTo('home')} onNavigate={navigateTo} user={user} /></RequireAuth>} />
          <Route path="/enviat" element={<div className="text-center py-20"><div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div><h2 className="text-4xl font-bold mb-4">Rebut!</h2><p className="text-gray-500 max-w-md mx-auto mb-6">El teu vídeo serà revisat abans d'aparèixer a la galeria pública.</p><div className="flex justify-center gap-4"><Button onClick={() => navigateTo('gallery')}>Galeria</Button></div></div>} />
          <Route path="/premis" element={<PrizesView onBack={() => navigateTo('home')} />} />
          <Route path="/bases" element={<BasesView onBack={() => navigateTo('home')} onNavigate={navigateTo} />} />
          <Route path="/privacitat" element={<PrivacyView onBack={() => navigateTo('home')} />} />
          <Route path="/escoles" element={<SchoolsView onBack={() => navigateTo('home')} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer
        isAdmin={isAdmin}
        navigateTo={navigateTo}
        seedDatabase={seedDatabase}
        contestConfig={contestConfig}
        configLoaded={configLoaded}
        handleSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
