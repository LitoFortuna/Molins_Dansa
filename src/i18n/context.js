import { createContext } from 'react';

// Context cru, sense JSX: viu en un fitxer a part perquè tant I18nContext.jsx
// (el Provider, un component) com useI18n.js (el hook) el puguin importar sense
// que cap dels dos fitxers exporti res que no sigui "només components" o
// "només el hook" (exigit per react-refresh/only-export-components).
export const I18nContext = createContext(null);
