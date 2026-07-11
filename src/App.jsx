import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera, Heart, MapPin, Play, Trophy, Users, Calendar, Upload, CheckCircle, Link as LinkIcon, Edit, Trash2, Shield, FileText, Lock, School, LogIn, UserPlus, LogOut, Phone, Mail, User, RefreshCw, Share2, Building2, Store, Search, Filter, Download, ExternalLink, LayoutGrid, X, Star, Menu } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import {
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
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
// Import initialized instances
import { auth, db } from './firebase';

// CONSTANTE ADMIN UID (SEGURIDAD)
// Intermedi: la comprovació real d'admin viu a firestore.rules (isAdmin()).
// Aquí només serveix per mostrar/amagar UI. Objectiu: custom claim `admin`.
const ADMIN_UID = 'go7iiu9IjRTuMsnHgEVM5ho8IZD2';

// --- Dades Inicials (Seed Data) ---
const SEED_VIDEOS = [
  {
    title: "Hip Hop al Pont",
    author: "Grup Jove Molins",
    location: "Pont de les 15 Arcades",
    votes: 124,
    thumbnail: "bg-blue-200",
    category: "Grup",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: Date.now(),
    status: "aprovat"
  },
  {
    title: "Dansa Contemporània al Castell",
    author: "Maria S.",
    location: "Carrer del Castell, 2",
    votes: 89,
    thumbnail: "bg-purple-200",
    category: "Individual",
    url: "https://instagram.com",
    createdAt: Date.now(),
    status: "aprovat"
  },
  {
    title: "Sardana Fusió",
    author: "Colla Nova",
    location: "Plaça de l'Ajuntament",
    votes: 210,
    thumbnail: "bg-red-200",
    category: "Grup",
    url: "https://www.youtube.com/watch?v=kYtGl1dX5qI",
    createdAt: Date.now(),
    status: "aprovat"
  }
];

// --- UTILS ---
const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  // Cobreix watch?v=, youtu.be/, shorts/, live/, embed/ i /v/ (id de 11 caràcters).
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/|v\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// --- CONFIG DEL CONCURS (dates de fases, doc config/concurs) ---
const parseConfigDate = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  return isNaN(d.getTime()) ? null : d;
};
const daysUntil = (date) => Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));

// --- COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyle = "px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg hover:shadow-rose-500/30",
    secondary: "bg-white text-rose-600 border-2 border-rose-600 hover:bg-rose-50",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-100 text-red-600 hover:bg-red-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    gold: "bg-amber-400 text-amber-900 hover:bg-amber-500 shadow-lg shadow-amber-200"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '', ...props }) => <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`} {...props}>{children}</div>;
const Badge = ({ children, color = 'bg-gray-100 text-gray-800' }) => <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${color}`}>{children}</span>;

// --- MODERACIÓ: estat d'un vídeo ---
// Sense status (vídeos anteriors a aquesta funcionalitat) es tracta com 'aprovat'.
const STATUS_LABELS = { pendent: 'Pendent', aprovat: 'Aprovat', rebutjat: 'Rebutjat' };
const STATUS_COLORS = {
  pendent: 'bg-amber-100 text-amber-800',
  aprovat: 'bg-green-100 text-green-800',
  rebutjat: 'bg-gray-200 text-gray-600'
};
const StatusBadge = ({ status }) => {
  const s = status || 'aprovat';
  return <Badge color={STATUS_COLORS[s]}>{STATUS_LABELS[s]}</Badge>;
};

// --- COMPONENT: VIDEO PLAYER ---
const VideoPlayer = ({ url, thumbnail, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeId = getYouTubeId(url);

  if (isPlaying && youtubeId) {
    return (
      <div className="relative aspect-video bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <button
          onClick={() => setIsPlaying(false)}
          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video ${!thumbnail && !youtubeId ? "bg-gray-200" : ""} flex items-center justify-center overflow-hidden bg-gray-200 group`}>
      {/* BACKGROUND THUMBNAIL */}
      {youtubeId ? (
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : thumbnail && !thumbnail.startsWith('bg-') ? (
        <img src={thumbnail} alt={title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className={`absolute inset-0 w-full h-full ${thumbnail || 'bg-gray-200'}`} />
      )}

      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

      {youtubeId ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm z-10 text-rose-600"
        >
          <Play fill="currentColor" size={28} className="ml-1" />
        </button>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm z-10 text-rose-600"
        >
          <LinkIcon size={28} />
        </a>
      )}

      {!youtubeId && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-1 rounded">
          Obrir enllaç extern
        </div>
      )}
    </div>
  );
};

// --- AUTH MODULE ---
const AuthView = ({ onLoginSuccess, onCancel }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!acceptTerms) throw new Error("Has d'acceptar les bases del concurs.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      let msg = "Error en l'autenticació.";
      if (err.code === 'auth/email-already-in-use') msg = "Aquest correu ja està registrat.";
      if (err.code === 'auth/wrong-password') msg = "Contrasenya incorrecta.";
      if (err.code === 'auth/user-not-found') msg = "Usuari no trobat.";
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          {isRegistering ? <UserPlus size={32} /> : <LogIn size={32} />}
        </div>
        <h2 className="text-3xl font-bold text-gray-900">{isRegistering ? "Crear Compte" : "Benvingut/da"}</h2>
        {isRegistering && <p className="text-rose-600 font-medium mt-2">Registra't i els teus vots valdran x5!</p>}
      </div>
      <Card className="p-8">
        <div className="flex border-b border-gray-200 mb-6">
          <button className={`flex-1 pb-3 text-sm font-semibold transition-colors ${!isRegistering ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-400'}`} onClick={() => { setIsRegistering(false); setError(''); }}>Iniciar Sessió</button>
          <button className={`flex-1 pb-3 text-sm font-semibold transition-colors ${isRegistering ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-400'}`} onClick={() => { setIsRegistering(true); setError(''); }}>Registrar-se</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2"><Shield size={16} className="mt-0.5 shrink-0" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-4 animate-in fade-in">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom i Cognoms</label><div className="relative"><User className="absolute left-3 top-2.5 text-gray-400" size={18} /><input required={isRegistering} type="text" className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Joan Garcia" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telèfon</label><div className="relative"><Phone className="absolute left-3 top-2.5 text-gray-400" size={18} /><input required={isRegistering} type="tel" className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="600 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div></div>
            </div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-2.5 text-gray-400" size={18} /><input required type="email" className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="hola@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Contrasenya</label><div className="relative"><Lock className="absolute left-3 top-2.5 text-gray-400" size={18} /><input required type="password" className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></div></div>
          {isRegistering && (<div className="flex items-start gap-2 pt-2"><input required type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 rounded text-rose-600 focus:ring-rose-500" /><label htmlFor="terms" className="text-sm text-gray-500">Accepto les bases.</label></div>)}
          <div className="pt-4 flex flex-col gap-3"><Button type="submit" className="w-full justify-center py-3" disabled={isLoading}>{isLoading ? 'Processant...' : (isRegistering ? 'Crear Compte' : 'Entrar')}</Button><Button variant="ghost" onClick={onCancel} className="w-full justify-center text-sm font-normal">Cancel·lar</Button></div>
        </form>
      </Card>
    </div>
  );
};



const HomeView = ({ onNavigate, contestConfig }) => {
  const votingEndsAt = parseConfigDate(contestConfig?.votingEndsAt);
  const submissionEndsAt = parseConfigDate(contestConfig?.submissionEndsAt);
  const now = new Date();

  let banner = null;
  if (votingEndsAt) {
    banner = now < votingEndsAt
      ? { text: `Queden ${daysUntil(votingEndsAt)} dies per votar!`, closed: false }
      : { text: 'La votació ha finalitzat. Gràcies per participar!', closed: true };
  } else if (submissionEndsAt && now < submissionEndsAt) {
    banner = { text: `Queden ${daysUntil(submissionEndsAt)} dies per inscriure el teu ball!`, closed: false };
  }

  return (
  <div className="space-y-12 animate-in fade-in duration-500">
    {banner && (
      <div className={`flex items-center justify-center gap-2 text-sm font-semibold rounded-xl px-4 py-3 ${banner.closed ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
        <Calendar size={16} /> {banner.text}
      </div>
    )}
    <section className="relative bg-gradient-to-br from-rose-900 via-rose-700 to-orange-500 text-white rounded-3xl overflow-hidden shadow-2xl p-8 md:p-16 text-center">
      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium border border-white/30">2a Edició</span>
        <h1 className="text-4xl md:text-6xl font-black mb-6 mt-4">MOLINS DANSA 2026</h1>
        <p className="text-lg md:text-xl mb-8 text-rose-100">Mostra el teu talent ballant a qualsevol racó de la nostra vila.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => onNavigate('upload')} className="px-8 py-3"><Camera size={20} />Participar</Button>
          <Button variant="secondary" onClick={() => onNavigate('gallery')} className="px-8 py-3"><Play size={20} />Veure Vídeos</Button>
        </div>
      </div>
    </section>

    <div className="grid md:grid-cols-3 gap-6">
      <Card className="p-6 text-center"><Calendar size={24} className="mx-auto text-rose-600 mb-2" /><h3 className="font-bold">Calendari</h3><p>Gravació: Febrer-Maig</p></Card>
      <Card onClick={() => onNavigate('map')} className="p-6 text-center cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-amber-200 transition-all"><MapPin size={24} className="mx-auto text-amber-600 mb-2" /><h3 className="font-bold">Ubicacions</h3><p>Veure mapa interactiu</p></Card>
      <Card onClick={() => onNavigate('prizes')} className="p-6 text-center cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-purple-200 transition-all"><Trophy size={24} className="mx-auto text-purple-600 mb-2" /><h3 className="font-bold">Premis</h3><p>Vot popular i Jurat</p></Card>
    </div>

    <section className="py-8 border-t border-gray-200 mt-12">
      {/* ORGANIZA */}
      <div className="text-center mb-10">
        <span className="text-rose-600 font-semibold uppercase tracking-wider text-sm">Organitza</span>
        <div className="flex flex-col items-center justify-center mt-4">
          <img
            src="https://lh3.googleusercontent.com/sitesv/APaQ0ST6zYhLtwrfdr0Pd30XlLk3JwV9TFZyDzE2nHyPOkvlT-P3eC6mmor86GnTgen5Ux5eg4VE_hu8Lnqw4P9b-De721utqyz8zmabGyzb22eR4n48DkeUe7qqEYEgxxeM-w_swEMKb_dJCJYMkzFofi7vzrlIbns77m96xorXGOXH0XagiuI2VbN2j-Y8-1g_RO_1zy-4g3wM1ykRNNua_BN0QcTfzKIfFsBuDfo=w400"
            alt="Associació Dance Space"
            loading="lazy"
            decoding="async"
            className="h-24 object-contain mb-2"
          />
          <h2 className="text-xl font-bold text-gray-900">Associació Dance Space</h2>
        </div>
      </div>

      {/* COLABORADORES */}
      <div className="text-center mb-8">
        <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">Amb la col·laboració de</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70">
        <div className="flex flex-col items-center gap-2"><Building2 size={32} /><span className="text-sm font-bold text-center">Ajuntament de<br />Molins de Rei</span></div>
        <div className="flex flex-col items-center gap-2"><Building2 size={32} /><span className="text-sm font-bold text-center">Generalitat de<br />Catalunya</span></div>
        <div className="flex flex-col items-center gap-2"><Store size={32} /><span className="text-sm font-bold text-center">Comerç Local</span></div>
        <div className="flex flex-col items-center gap-2"><School size={32} /><span className="text-sm font-bold text-center">Escoles Dansa</span></div>
      </div>
    </section>
  </div>
  );
};

const UploadView = ({ onUploadSuccess, onCancel, user }) => {
  const [formData, setFormData] = useState({ title: '', author: user ? user.displayName : '', location: '', category: 'Individual', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // SIMPLIFIED PATH: Just 'videos' implies root collection
      const newVideo = { ...formData, userId: user.uid, votes: 0, thumbnail: 'bg-gray-300', createdAt: Date.now(), status: 'pendent' };
      const docRef = await addDoc(collection(db, 'videos'), newVideo);

      // --- GOOGLE SHEETS INTEGRATION ---
      try {
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxoyDHdeL91KfFTamv6Kct4ZZXLRL4iIMFF_CNW_zez9i1dc0peX53DkTUwobpFoQ/exec';
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Importante para evitar error CORS con Google Scripts
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            userEmail: user.email || 'Anònim',
            timestamp: new Date().toISOString()
          })
        });
      } catch (sheetErr) {
        console.error("Error enviant a Sheets:", sheetErr);
        // No bloquem l'èxit si falla el Sheet, només ho loguejem
      }

      onUploadSuccess({ ...newVideo, id: docRef.id });
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button onClick={onCancel} className="mb-4">← Tornar</button>
      <Card className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Inscriu el teu Ball</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required className="w-full px-4 py-2 border rounded" placeholder="Títol" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input required className="w-full px-4 py-2 border rounded" placeholder="Nom Artístic" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
            <select className="w-full px-4 py-2 border rounded" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option>Individual</option><option>Grup</option><option>Escola de Dansa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicació / Adreça</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                required
                type="text"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                placeholder="Ex: Plaça de la Vila, 1"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Indica l'adreça exacta o coordenades per al mapa interactiu.</p>
          </div>
          <input required type="url" className="w-full px-4 py-2 border rounded" placeholder="Enllaç (YouTube/Instagram)..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
          <Button className="w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enviant...' : 'Enviar'}</Button>
        </form>
      </Card>
    </div>
  );
};

const GalleryView = ({ videos, onVote, onBack, isAdmin, onUpdateVotes, onDelete, onModerate, loading, onShare, user, onNavigate, highlightId, contestConfig, votedIds = new Set() }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tots');

  // Determinar si el vot es "Premium" o "Bàsic"
  const isPremiumVoter = user && !user.isAnonymous;
  const voteValue = isPremiumVoter ? 5 : 1;

  const votingEndsAt = parseConfigDate(contestConfig?.votingEndsAt);
  const votingClosed = votingEndsAt ? new Date() >= votingEndsAt : false;

  const pendingCount = useMemo(() => videos.filter(v => v.status === 'pendent').length, [videos]);

  const filteredVideos = useMemo(() => {
    // El públic només veu vídeos aprovats (o sense status, per compatibilitat
    // amb vídeos anteriors a la moderació). L'admin veu i modera tots.
    const visible = isAdmin ? videos : videos.filter(v => v.status === 'aprovat' || v.status == null);
    return visible.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Tots' || video.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (isAdmin) {
        const rank = (v) => v.status === 'pendent' ? 0 : v.status === 'rebutjat' ? 2 : 1;
        const diff = rank(a) - rank(b);
        if (diff !== 0) return diff;
      }
      return b.votes - a.votes;
    });
  }, [videos, searchTerm, filterCategory, isAdmin]);

  // Deep-link: quan s'arriba amb #v=<id>, desplaça (un sol cop) i ressalta aquell vídeo.
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (!highlightId || scrolledRef.current) return;
    const el = document.getElementById(`video-${highlightId}`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); scrolledRef.current = true; }
  }, [highlightId, filteredVideos]);

  const exportToCSV = () => {
    const headers = "ID,Titol,Autor,Categoria,Lloc,Vots,Enllaç,Data\n";
    const rows = videos.map(v =>
      `${v.id},"${v.title}","${v.author}","${v.category}","${v.location}",${v.votes},"${v.url}",${new Date(v.createdAt).toLocaleDateString()}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "molins_dansa_participants.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600">← Inici</button>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button variant="outline" onClick={exportToCSV} className="text-xs px-3 py-1">
                <Download size={14} /> Exportar Dades
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Galeria
              {isAdmin && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold uppercase">Admin</span>}
              {isAdmin && pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">{pendingCount} pendents</span>
              )}
            </h2>
            <p className="text-gray-500">Explora {filteredVideos.length} actuacions</p>
          </div>
        </div>

        {/* CALL TO ACTION FOR VOTING */}
        {!isPremiumVoter && !votingClosed && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full text-amber-600"><Star size={20} fill="currentColor" /></div>
              <div>
                <h4 className="font-bold text-amber-900">Vols que el teu vot valgui x5?</h4>
                <p className="text-sm text-amber-700">Els usuaris registrats tenen més poder de vot.</p>
              </div>
            </div>
            <Button variant="gold" onClick={() => onNavigate('auth')} className="text-sm">Registrar-me ara</Button>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" placeholder="Cercar..." className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="Tots">Totes les Categories</option><option value="Individual">Individual</option><option value="Grup">Grup</option><option value="Escola de Dansa">Escoles</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Carregant vídeos...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No s'han trobat vídeos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, idx) => (
            <Card key={video.id} id={`video-${video.id}`} className={`group hover:shadow-2xl transition-all duration-300 border ${video.id === highlightId ? 'ring-2 ring-rose-500 ring-offset-2' : isAdmin ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
              <VideoPlayer url={video.url} thumbnail={video.thumbnail} title={video.title} />
              <div className="relative">
                <div className="absolute -top-10 right-3 z-20"><Badge color="bg-black/50 text-white backdrop-blur-md">{video.category}</Badge></div>
                {idx < 3 && <div className="absolute -top-10 left-3 bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white z-20">#{idx + 1}</div>}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{video.title}</h3>
                <p className="text-gray-600 text-sm flex items-center gap-1 mb-2"><Users size={14} /> {video.author}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location + ", Molins de Rei")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-rose-600 hover:underline mb-4 font-medium"
                >
                  <MapPin size={12} /> {video.location} <ExternalLink size={10} />
                </a>

                {isAdmin ? (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 space-y-2">
                    <div className="flex items-center justify-between"><label className="text-xs font-bold text-red-800 uppercase">Admin</label><button onClick={() => onDelete(video.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></div>
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={video.status} />
                      <div className="flex gap-1">
                        <button onClick={() => onModerate(video.id, 'aprovat')} disabled={video.status === 'aprovat'} className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold">Aprovar</button>
                        <button onClick={() => onModerate(video.id, 'rebutjat')} disabled={video.status === 'rebutjat'} className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold">Rebutjar</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdateVotes(video.id, video.votes - 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-red-200 rounded">-</button>
                      <input type="number" value={video.votes} onChange={(e) => onUpdateVotes(video.id, parseInt(e.target.value) || 0)} className="w-full text-center font-bold text-lg bg-white border border-red-200 rounded py-1" />
                      <button onClick={() => onUpdateVotes(video.id, video.votes + 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-red-200 rounded">+</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 gap-2">
                    <div className="text-gray-500 text-sm"><span className="font-bold text-gray-900 text-lg">{video.votes}</span> vots</div>
                    <div className="flex gap-2">
                      <button onClick={() => onShare(video)} className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-full transition-colors" title="Compartir"><Share2 size={18} /></button>
                      {votingClosed ? (
                        <span className="text-xs text-gray-400 font-medium px-3 py-2 whitespace-nowrap">Votació tancada</span>
                      ) : votedIds.has(video.id) ? (
                        <span className="flex items-center gap-2 text-xs text-green-600 font-semibold px-3 py-2 whitespace-nowrap">
                          <CheckCircle size={16} /> Vot registrat
                        </span>
                      ) : (
                        <button onClick={() => onVote(video.id)} className={`flex items-center gap-2 px-4 py-2 ${isPremiumVoter ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600'} rounded-full transition-colors font-semibold group-active:scale-95`}>
                          <Heart size={18} className={isPremiumVoter ? "fill-amber-600 text-amber-600" : "group-hover:fill-rose-600"} />
                          Votar (+{voteValue})
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAP VIEW ---
// Carregat de forma diferida: Leaflet + markercluster (~150 KB) queden fora del
// bundle inicial i només es descarreguen quan s'obre el mapa. Veure src/MapView.jsx.
const MapView = lazy(() => import('./MapView'));

const PrizesView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8 md:p-12">
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <Trophy className="text-rose-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">Premis i Reconeixements</h2>
      </div>

      <div className="space-y-8">
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-amber-900">1r Premi del Jurat</h3>
          </div>
          <p className="text-amber-800 mb-4">Atorgat pel jurat professional format per membres de l'Associació Dance Space i directors/es d'escoles de dansa.</p>
          <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
            <li>Trofeu exclusiu Molins Dansa 2026.</li>
            <li>Val de compra de 150€ en comerç local.</li>
            <li>Masterclass gratuïta a una de les escoles col·laboradores.</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Star className="text-gray-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">2n Premi del Jurat</h3>
          </div>
          <p className="text-gray-700 mb-4">Reconeixement a la segona millor proposta artística segons el criteri tècnic.</p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Trofeu commemoratiu.</li>
            <li>Val de compra de 75€ en comerç local.</li>
          </ul>
        </div>

        <div className="bg-rose-50 p-6 rounded-xl border border-rose-200">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="text-rose-500" size={24} />
            <h3 className="text-xl font-bold text-rose-900">Premi del Públic</h3>
          </div>
          <p className="text-rose-800 mb-4">Atorgat al vídeo amb més vots registrats a través d'aquesta plataforma web.</p>
          <ul className="list-disc pl-5 text-sm text-rose-700 space-y-1">
            <li>Trofeu especial "Favorit del Públic".</li>
            <li>Sopar per a dues persones (o equivalent per grup) en restaurant local.</li>
            <li>Difusió especial a les xarxes socials de l'Ajuntament.</li>
          </ul>
        </div>

        <div className="text-center pt-6 text-sm text-gray-500 italic">
          * L'entrega de premis es realitzarà durant l'acte de clausura al Juny de 2026.
        </div>
      </div>
    </Card>
  </div>
);

const BasesView = ({ onBack, onNavigate }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8">
      <h2 className="text-3xl font-bold mb-6">Bases del Concurs</h2>
      <div className="prose prose-rose max-w-none text-gray-700 space-y-4">
        <p><strong>1. Participació:</strong> Obert a tothom sense límit d'edat. Els menors necessiten autorització.</p>
        <p><strong>2. Temàtica:</strong> Dansa en espais públics de Molins de Rei.</p>
        <p><strong>3. Format:</strong> Vídeos horitzontals de màxim 2 minuts.</p>

        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl my-6">
          <h3 className="font-bold text-rose-800 mb-2">Premis i Categories</h3>
          <p className="mb-4 text-sm">Hi ha diferents categories i premis valorats en més de 300€,</p>
          <Button variant="primary" onClick={() => onNavigate('prizes')} className="text-sm w-full md:w-auto">
            <Trophy size={16} /> Consultar tots els Premis
          </Button>
        </div>

        <p><strong>4. Dates:</strong> Submissió de vídeos fins al 30 de Maig de 2026.</p>
        <p><strong>5. Drets d'imatge:</strong> Els participants cedeixen els drets per a la difusió en xarxes socials de l'Ajuntament.</p>
      </div>
    </Card>
  </div>
);

const PrivacyView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Lock className="text-rose-600" /> Política de Privacitat</h2>
      <p className="mb-4">D'acord amb el RGPD, us informem que les vostres dades seran tractades per l'Associació Dance Space exclusivament per a la gestió del concurs.</p>
      <ul className="list-disc pl-5 space-y-2 mb-4">
        <li>No compartirem el vostre email amb tercers.</li>
        <li>Podeu exercir els vostres drets d'accés, rectificació i cancel·lació enviant un email.</li>
        <li>Les dades de localització només s'usen per al mapa interactiu.</li>
      </ul>
    </Card>
  </div>
);

const SchoolsView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6 text-center hover:shadow-xl transition-all">
        <School size={48} className="mx-auto text-rose-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Escola Municipal de Dansa</h3>
        <p className="text-gray-500">Fomentant la dansa des de 1990.</p>
      </Card>
      <Card className="p-6 text-center hover:shadow-xl transition-all">
        <Building2 size={48} className="mx-auto text-amber-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Estudi 15</h3>
        <p className="text-gray-500">Dansa urbana i contemporània.</p>
      </Card>
    </div>
  </div>
);

// --- ADMIN: EDITOR DE DATES DEL CONCURS ---
// Editor mínim (només admin) de config/concurs: dates d'inscripció, votació
// i gala que alimenten el comptador enrere de HomeView i el tancament
// automàtic del vot a GalleryView.
const AdminConfigPanel = ({ contestConfig, configLoaded, onSave }) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    await onSave({
      submissionEndsAt: fd.get('submissionEndsAt') || '',
      votingEndsAt: fd.get('votingEndsAt') || '',
      galaAt: fd.get('galaAt') || '',
    });
    setSaving(false);
  };

  return (
    // key: remunta el formulari (inputs no controlats) un sol cop, quan arriba
    // la primera càrrega de Firestore, per adoptar-ne els valors com a defaultValue.
    <form key={configLoaded ? 'loaded' : 'loading'} onSubmit={handleSave} className="space-y-2">
      <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">Dates del concurs</p>
      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Inscripció fins
          <input name="submissionEndsAt" type="date" defaultValue={contestConfig?.submissionEndsAt || ''} className="bg-gray-800 text-white rounded px-2 py-1 text-xs" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Votació fins
          <input name="votingEndsAt" type="date" defaultValue={contestConfig?.votingEndsAt || ''} className="bg-gray-800 text-white rounded px-2 py-1 text-xs" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Gala
          <input name="galaAt" type="date" defaultValue={contestConfig?.galaAt || ''} className="bg-gray-800 text-white rounded px-2 py-1 text-xs" />
        </label>
      </div>
      <button type="submit" disabled={saving} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-mono disabled:opacity-50">
        <Calendar size={12} /> {saving ? 'Desant...' : 'Desar dates'}
      </button>
    </form>
  );
};

// --- APP ---
// Noms de vista (que fan servir les vistes via onNavigate) → rutes reals.
const VIEW_PATHS = {
  home: '/', gallery: '/galeria', map: '/mapa', auth: '/identificacio',
  upload: '/participa', success: '/enviat', prizes: '/premis',
  bases: '/bases', privacy: '/privacitat', schools: '/escoles',
};

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

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'videos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(vids);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

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
      {/* NAVBAR UPDATED */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-rose-600 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-8 h-8 bg-rose-600 text-white rounded-lg flex items-center justify-center transform -rotate-6">M</div>MOLINS DANSA
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <button onClick={() => navigateTo('home')} className="hover:text-rose-600">Inici</button>
            <button onClick={() => navigateTo('gallery')} className="hover:text-rose-600">Galeria</button>
            <button onClick={() => navigateTo('map')} className="hover:text-amber-600 flex items-center gap-1"><MapPin size={16} /> Mapa</button>
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-4 border-l pl-4 ml-2">
                <span className="text-gray-900 font-semibold flex items-center gap-2">
                  {isAdmin && <Shield size={14} className="text-red-500" />}
                  {user.displayName || user.email}
                </span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500"><LogOut size={18} /></button>
                <button onClick={() => navigateTo('upload')} className="px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md">Participar</button>
              </div>
            ) : (<button onClick={() => navigateTo('auth')} className="px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md">Identificar-se</button>)}
          </div>

          {/* BOTÓ HAMBURGUESA (només mòbil) */}
          <button
            className="md:hidden text-gray-600 hover:text-rose-600 p-2 -mr-2"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label={mobileMenuOpen ? 'Tancar menú' : 'Obrir menú'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MENÚ MÒBIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1 text-gray-700 font-medium">
              {user && !user.isAnonymous && (
                <div className="flex items-center gap-2 px-3 py-2 mb-1 text-gray-900 font-semibold border-b border-gray-100">
                  {isAdmin && <Shield size={16} className="text-red-500" />}
                  {user.displayName || user.email}
                </div>
              )}
              <button onClick={() => navigateTo('home')} className="text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-600">Inici</button>
              <button onClick={() => navigateTo('gallery')} className="text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-600">Galeria</button>
              <button onClick={() => navigateTo('map')} className="text-left px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2"><MapPin size={16} /> Mapa</button>
              {user && !user.isAnonymous ? (
                <>
                  <button onClick={() => navigateTo('upload')} className="text-left px-3 py-2.5 mt-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-semibold">Participar</button>
                  <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center gap-2"><LogOut size={16} /> Tancar sessió</button>
                </>
              ) : (
                <button onClick={() => navigateTo('auth')} className="text-left px-3 py-2.5 mt-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-semibold">Identificar-se</button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex-grow w-full">
        {notification && <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50"><CheckCircle className="text-green-400" size={20} />{notification}</div>}
        <Routes>
          <Route path="/" element={<HomeView onNavigate={navigateTo} contestConfig={contestConfig} />} />
          <Route path="/galeria" element={<GalleryView videos={videos} loading={loading} onVote={handleVote} onBack={() => navigateTo('home')} isAdmin={isAdmin} onUpdateVotes={handleAdminUpdateVotes} onDelete={handleAdminDelete} onModerate={handleAdminModerate} onShare={handleShare} user={user} onNavigate={navigateTo} highlightId={null} contestConfig={contestConfig} votedIds={votedIds} />} />
          <Route path="/video/:id" element={<RouteWithVideoId render={(id) => <GalleryView videos={videos} loading={loading} onVote={handleVote} onBack={() => navigateTo('home')} isAdmin={isAdmin} onUpdateVotes={handleAdminUpdateVotes} onDelete={handleAdminDelete} onModerate={handleAdminModerate} onShare={handleShare} user={user} onNavigate={navigateTo} highlightId={id} contestConfig={contestConfig} votedIds={votedIds} />} />} />
          <Route path="/mapa" element={<Suspense fallback={<div className="text-center py-20 text-gray-400">Carregant mapa…</div>}><MapView onBack={() => navigateTo('home')} videos={approvedVideos} /></Suspense>} />
          <Route path="/identificacio" element={<AuthView onLoginSuccess={() => navigate('/participa')} onCancel={() => navigateTo('home')} />} />
          <Route path="/participa" element={<RequireAuth><UploadView onUploadSuccess={handleUploadSuccess} onCancel={() => navigateTo('home')} user={user} /></RequireAuth>} />
          <Route path="/enviat" element={<div className="text-center py-20"><div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div><h2 className="text-4xl font-bold mb-4">Rebut!</h2><p className="text-gray-500 max-w-md mx-auto mb-6">El teu vídeo serà revisat abans d'aparèixer a la galeria pública.</p><div className="flex justify-center gap-4"><Button onClick={() => navigateTo('gallery')}>Galeria</Button></div></div>} />
          <Route path="/premis" element={<PrizesView onBack={() => navigateTo('home')} />} />
          <Route path="/bases" element={<BasesView onBack={() => navigateTo('home')} onNavigate={navigateTo} />} />
          <Route path="/privacitat" element={<PrivacyView onBack={() => navigateTo('home')} />} />
          <Route path="/escoles" element={<SchoolsView onBack={() => navigateTo('home')} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h4 className="text-white font-bold text-lg mb-4">Molins Dansa 2026</h4>
            <p className="text-sm leading-relaxed max-w-xs">
              Organitzat per l'Associació Dance Space amb la col·laboració de l'Ajuntament de Molins de Rei.
            </p>
          </div>
          <div>
            <h5 className="text-white font-semibold mb-4">Enllaços</h5>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigateTo('bases')} className="hover:text-white text-left">Bases del Concurs</button></li>
              <li><button onClick={() => navigateTo('privacy')} className="hover:text-white text-left">Política de Privacitat</button></li>
              <li><button onClick={() => navigateTo('schools')} className="hover:text-white text-left">Escoles Col·laboradores</button></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-semibold mb-4">Contacte</h5>
            <ul className="space-y-2 text-sm"><li>info@dancespace.cat</li></ul>
            <div className="mt-8 pt-4 border-t border-gray-800 space-y-4">

              {isAdmin && (
                <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
                  <Shield size={14} /> Mode Administrador Actiu
                </div>
              )}

              {isAdmin && (
                <button onClick={seedDatabase} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-mono">
                  <RefreshCw size={12} /> Carregar Dades Exemple
                </button>
              )}

              {isAdmin && <AdminConfigPanel contestConfig={contestConfig} configLoaded={configLoaded} onSave={handleSaveConfig} />}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
