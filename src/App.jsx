import React, { useState, useEffect, useMemo } from 'react';
import { Camera, Heart, MapPin, Play, Trophy, Users, Calendar, Upload, CheckCircle, Link as LinkIcon, Edit, Trash2, Shield, FileText, Lock, School, LogIn, UserPlus, LogOut, Phone, Mail, User, RefreshCw, Share2, Building2, Store, Search, Filter, Download, ExternalLink, LayoutGrid, X, Star } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import {
  signInWithCustomToken,
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
  getDocs
} from "firebase/firestore";
// Import initialized instances
import { auth, db, appId } from './firebase';

// CONSTANTE ADMIN UID (SEGURIDAD)
const ADMIN_UID = 'go7iiu9IjRTuMsnHgEVM5ho8IZD2';

const VIDEOS_COLLECTION_PATH = ['artifacts', appId, 'public', 'data', 'videos'];

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
    createdAt: Date.now()
  },
  {
    title: "Dansa Contemporània al Castell",
    author: "Maria S.",
    location: "Carrer del Castell, 2",
    votes: 89,
    thumbnail: "bg-purple-200",
    category: "Individual",
    url: "https://instagram.com",
    createdAt: Date.now()
  },
  {
    title: "Sardana Fusió",
    author: "Colla Nova",
    location: "Plaça de l'Ajuntament",
    votes: 210,
    thumbnail: "bg-red-200",
    category: "Grup",
    url: "https://www.youtube.com/watch?v=kYtGl1dX5qI",
    createdAt: Date.now()
  }
];

// --- UTILS ---
const getYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

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
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : thumbnail && !thumbnail.startsWith('bg-') ? (
        <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
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

// --- STATIC PAGES ---

const BasesView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8 md:p-12">
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <FileText className="text-rose-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">Bases del Concurs 2026</h2>
      </div>

      <div className="prose prose-rose max-w-none text-gray-600 space-y-6">
        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-2">1. Objectiu</h3>
          <p>Fomentar la creativitat, l'expressió artística i la participació ciutadana a través de la dansa en un format innovador i digital, vinculant-la al patrimoni i espais de Molins de Rei.</p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-2">2. Participació</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>El concurs és obert a tots els molinencs i molinenques.</li>
            <li>Es pot participar de forma individual, en parella o en grup.</li>
            <li>No hi ha límit d'edat per participar.</li>
            <li>És necessari registrar-se a la plataforma per poder pujar l'enllaç del vídeo.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-2">3. Requisits Tècnics</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>La durada del vídeo no pot excedir els <strong>2 minuts</strong>.</li>
            <li>El vídeo ha d'estar gravat en format horitzontal o vertical (Reels/TikTok).</li>
            <li><strong>Ubicació:</strong> S'ha d'indicar clarament l'adreça o coordenades on s'ha gravat el vídeo dins de Molins de Rei.</li>
            <li>El vídeo ha d'estar pujat a YouTube o Instagram de forma pública.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-2">4. Votació i Premis</h3>
          <p>La puntuació final es calcularà mitjançant una combinació:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Votació Popular (50%):</strong> Realitzada a través d'aquesta web. Els usuaris registrats tenen un vot de valor x5, mentre que els no registrats tenen valor x1.</li>
            <li><strong>Jurat Professional (50%):</strong> Format per l'Associació Dance Space i directors de les escoles de dansa col·laboradores.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-2">5. Calendari</h3>
          <p><strong>Febrer - Maig 2026:</strong> Fase de gravació i presentació de vídeos.</p>
          <p><strong>Juny 2026:</strong> Període de votació popular i acte de lliurament de premis.</p>
        </section>
      </div>
    </Card>
  </div>
);

const PrivacyView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>
    <Card className="p-8 md:p-12">
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <Lock className="text-rose-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">Política de Privacitat</h2>
      </div>

      <div className="space-y-6 text-gray-600">
        <p>A <strong>Molins Dansa</strong>, ens prenem molt seriosament la teva privacitat. Aquesta política descriu com tractem les dades personals recollides a través d'aquesta aplicació.</p>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-2">Responsable del Tractament</h4>
          <p className="text-sm"><strong>Associació Dance Space</strong> amb la col·laboració de l'Ajuntament de Molins de Rei.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-2">Drets d'Imatge</h4>
          <p className="mb-2">En participar en aquest concurs, els participants cedeixen els drets d'imatge i explotació dels vídeos enviats a l'Associació Dance Space per a la difusió cultural del concurs a xarxes socials i web.</p>
          <p>En cas de menors d'edat, serà necessària l'autorització expressa dels tutors legals per a la participació.</p>
        </div>

        <div>
          <h4 className="font-bold text-gray-800 mb-2">Protecció de Dades</h4>
          <p>Les dades personals recollides (nom, correu electrònic, telèfon) s'utilitzaran exclusivament per a:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>La gestió de la participació en el concurs.</li>
            <li>La comunicació amb els guanyadors.</li>
            <li>El control de la votació popular per evitar fraus.</li>
          </ul>
          <p className="mt-2">Les dades no es cediran a tercers excepte obligació legal.</p>
        </div>
      </div>
    </Card>
  </div>
);

const SchoolsView = ({ onBack }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">← Tornar</button>

    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Escoles Col·laboradores</h2>
      <p className="text-gray-600 max-w-2xl mx-auto">Aquest projecte és possible gràcies a la implicació i el talent de les escoles de dansa de Molins de Rei.</p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="p-6 text-center hover:shadow-lg transition-all group cursor-pointer border border-gray-100">
          <div className="w-20 h-20 bg-rose-50 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
            <School className="text-rose-500" size={32} />
          </div>
          <h3 className="font-bold text-xl text-gray-800 mb-2">Escola de Dansa {i}</h3>
          <p className="text-sm text-gray-500 mb-4">Especialitat: Dansa Clàssica i Contemporània</p>
          <button className="text-rose-600 font-semibold text-sm hover:underline">Visitar Web</button>
        </Card>
      ))}
    </div>

    <div className="mt-12 bg-rose-900 text-white rounded-2xl p-8 text-center">
      <h3 className="text-2xl font-bold mb-4">Tens una escola de dansa?</h3>
      <p className="mb-6 opacity-90">Si vols col·laborar amb Molins Dansa 2026, posa't en contacte amb nosaltres.</p>
      <Button variant="secondary" className="mx-auto" onClick={() => window.location.href = 'mailto:associaciods@gmail.com'}>Contactar Organització</Button>
    </div>
  </div>
);

const HomeView = ({ onNavigate }) => (
  <div className="space-y-12 animate-in fade-in duration-500">
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
            src="https://lh3.googleusercontent.com/sitesv/APaQ0ST6zYhLtwrfdr0Pd30XlLk3JwV9TFZyDzE2nHyPOkvlT-P3eC6mmor86GnTgen5Ux5eg4VE_hu8Lnqw4P9b-De721utqyz8zmabGyzb22eR4n48DkeUe7qqEYEgxxeM-w_swEMKb_dJCJYMkzFofi7vzrlIbns77m96xorXGOXH0XagiuI2VbN2j-Y8-1g_RO_1zy-4g3wM1ykRNNua_BN0QcTfzKIfFsBuDfo=w1280"
            alt="Associació Dance Space"
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

const UploadView = ({ onUploadSuccess, onCancel, user }) => {
  const [formData, setFormData] = useState({ title: '', author: user ? user.displayName : '', location: '', category: 'Individual', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // SIMPLIFIED PATH: Just 'videos' implies root collection
      const newVideo = { ...formData, userId: user.uid, votes: 0, thumbnail: 'bg-gray-300', createdAt: Date.now() };
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

const GalleryView = ({ videos, onVote, onBack, isAdmin, onUpdateVotes, onDelete, loading, onShare, user, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tots');

  // Determinar si el vot es "Premium" o "Bàsic"
  const isPremiumVoter = user && !user.isAnonymous;
  const voteValue = isPremiumVoter ? 5 : 1;

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Tots' || video.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => b.votes - a.votes);
  }, [videos, searchTerm, filterCategory]);

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
            </h2>
            <p className="text-gray-500">Explora {filteredVideos.length} actuacions</p>
          </div>
        </div>

        {/* CALL TO ACTION FOR VOTING */}
        {!isPremiumVoter && (
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
            <Card key={video.id} className={`group hover:shadow-2xl transition-all duration-300 border ${isAdmin ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
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
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between mb-2"><label className="text-xs font-bold text-red-800 uppercase">Admin</label><button onClick={() => onDelete(video.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button></div>
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
                      <button onClick={() => onVote(video.id)} className={`flex items-center gap-2 px-4 py-2 ${isPremiumVoter ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600'} rounded-full transition-colors font-semibold group-active:scale-95`}>
                        <Heart size={18} className={isPremiumVoter ? "fill-amber-600 text-amber-600" : "group-hover:fill-rose-600"} />
                        Votar (+{voteValue})
                      </button>
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

// --- LEAFLET MAP IMPORTS ---
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- COMPONENT: GEOCODED MARKER ---
const GeocodedMarker = ({ location, title, author, url }) => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const geocode = async () => {
      try {
        // Añadimos "Molins de Rei" para asegurar que busca en la ciudad correcta
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
  // Coordenadas centrales de Molins de Rei
  const MOLINS_COORDS = [41.408, 2.015];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto h-[80vh] flex flex-col">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-4 flex items-center gap-1">← Tornar</button>
      <Card className="flex-grow overflow-hidden flex flex-col shadow-xl border-0">
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
      </Card>
    </div>
  );
};

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

// --- APP ---
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [videos, setVideos] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); }
        catch (e) { await signInAnonymously(auth); }
      } else { await signInAnonymously(auth); }
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

  const handleUploadSuccess = () => setCurrentView('success');

  // --- LOGICA DE VOT DUAL ---
  const handleVote = async (id) => {
    const video = videos.find(v => v.id === id);
    if (!video) return;

    // Determinar valor del vot
    const isPremium = user && !user.isAnonymous;
    const points = isPremium ? 5 : 1;

    try {
      await updateDoc(doc(db, 'videos', id), { votes: video.votes + points });
      setNotification(`Vot registrat (+${points} punts)!`);
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      console.error(err);
      setNotification("Error: " + err.message);
    }
  };

  const handleShare = async (video) => {
    const shareData = { title: video.title, text: `Vota ${video.title} a Molins Dansa!`, url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch (err) { } }
    else { navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); setNotification("Enllaç copiat!"); setTimeout(() => setNotification(null), 3000); }
  };
  const handleAdminUpdateVotes = async (id, newVotes) => { try { await updateDoc(doc(db, 'videos', id), { votes: Math.max(0, newVotes) }); } catch (err) { } };
  const handleAdminDelete = async (id) => { if (confirm("Eliminar?")) { try { await deleteDoc(doc(db, 'videos', id)); } catch (err) { } } };
  const navigateTo = (view) => {
    if (view === 'upload' && (!user || user.isAnonymous)) { setNotification("Registra't primer"); setTimeout(() => setNotification(null), 3000); setCurrentView('auth'); }
    else { setCurrentView(view); } window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleLogout = async () => { await signOut(auth); setNotification("Adéu!"); setCurrentView('home'); setTimeout(() => setNotification(null), 3000); await signInAnonymously(auth); };


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
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex-grow w-full">
        {notification && <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50"><CheckCircle className="text-green-400" size={20} />{notification}</div>}
        {currentView === 'home' && <HomeView onNavigate={navigateTo} />}
        {currentView === 'auth' && <AuthView onLoginSuccess={() => navigateTo('upload')} onCancel={() => navigateTo('home')} />}
        {currentView === 'upload' && <UploadView onUploadSuccess={handleUploadSuccess} onCancel={() => navigateTo('home')} user={user} />}
        {currentView === 'success' && <div className="text-center py-20"><div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div><h2 className="text-4xl font-bold mb-4">Rebut!</h2><div className="flex justify-center gap-4"><Button onClick={() => navigateTo('gallery')}>Galeria</Button></div></div>}
        {currentView === 'gallery' && <GalleryView videos={videos} loading={loading} onVote={handleVote} onBack={() => navigateTo('home')} isAdmin={isAdmin} onUpdateVotes={handleAdminUpdateVotes} onDelete={handleAdminDelete} onShare={handleShare} user={user} onNavigate={navigateTo} />}
        {currentView === 'map' && <MapView onBack={() => navigateTo('home')} videos={videos} />}
        {currentView === 'prizes' && <PrizesView onBack={() => navigateTo('home')} />}
        {currentView === 'bases' && <BasesView onBack={() => navigateTo('home')} />}
        {currentView === 'privacy' && <PrivacyView onBack={() => navigateTo('home')} />}
        {currentView === 'schools' && <SchoolsView onBack={() => navigateTo('home')} />}
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

              {(isAdmin || (videos.length === 0 && !loading)) && (
                <button onClick={seedDatabase} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-mono">
                  <RefreshCw size={12} /> Carregar Dades Exemple
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
