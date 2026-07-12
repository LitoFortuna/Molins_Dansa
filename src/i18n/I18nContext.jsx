import { useState, useCallback, useMemo, useEffect } from 'react';
import { I18nContext } from './context';
import { ca } from './dictionaries/ca';
import { es } from './dictionaries/es';

const DICTIONARIES = { ca, es };
const STORAGE_KEY = 'md_locale';

const detectInitialLocale = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ca' || stored === 'es') return stored;
  } catch { /* localStorage no disponible */ }
  // navigator.language pot ser "es-ES", "ca-ES", "en-US"...
  const lang = (typeof navigator !== 'undefined' && navigator.language || '').toLowerCase();
  return lang.startsWith('es') ? 'es' : 'ca';
};

// Llegeix una clau anidada "gallery.search" del diccionari.
const lookup = (dict, key) => key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);

// Interpolació simple: reemplaça {{var}} pel valor donat a `vars`.
const interpolate = (str, vars) => {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{{${k}}}`));
};

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitialLocale);

  // Manté <html lang="..."> sincronitzat amb l'idioma actiu (accessibilitat/SEO).
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next) => {
    if (next !== 'ca' && next !== 'es') return;
    setLocaleState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignorem */ }
  }, []);

  const t = useCallback((key, vars) => {
    const dict = DICTIONARIES[locale] || ca;
    let value = lookup(dict, key);
    if (value === undefined) value = lookup(ca, key); // fallback al català
    if (value === undefined) return key; // últim recurs: la pròpia clau
    return interpolate(value, vars);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
