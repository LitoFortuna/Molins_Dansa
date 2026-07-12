// CONSTANTE ADMIN UID (SEGURIDAD)
// Intermedi: la comprovació real d'admin viu a firestore.rules (isAdmin()).
// Aquí només serveix per mostrar/amagar UI. Objectiu: custom claim `admin`.
export const ADMIN_UID = 'go7iiu9IjRTuMsnHgEVM5ho8IZD2';

// Noms de vista (que fan servir les vistes via onNavigate) → rutes reals.
export const VIEW_PATHS = {
  home: '/', gallery: '/galeria', map: '/mapa', auth: '/identificacio',
  upload: '/participa', success: '/enviat', prizes: '/premis',
  bases: '/bases', privacy: '/privacitat', schools: '/escoles',
};

// --- MODERACIÓ: estat d'un vídeo ---
// Sense status (vídeos anteriors a aquesta funcionalitat) es tracta com 'aprovat'.
// Les etiquetes traduïdes viuen a src/i18n/dictionaries/{ca,es}.js (admin.status*).
export const STATUS_COLORS = {
  pendent: 'bg-amber-100 text-amber-800',
  aprovat: 'bg-green-100 text-green-800',
  rebutjat: 'bg-gray-200 text-gray-600'
};

// --- Dades Inicials (Seed Data, només per a l'admin) ---
export const SEED_VIDEOS = [
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
