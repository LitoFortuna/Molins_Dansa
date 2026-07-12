import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { app } from '../firebase';

// Inicialització mandrosa i tolerant a errors: si el navegador no suporta
// Analytics (isSupported() fals, p.ex. Safari privat) o el projecte de
// Firebase encara no té Google Analytics vinculat, l'app ha de continuar
// funcionant amb normalitat — l'analítica mai ha de trencar l'experiència.
let readyPromise = null;

function getAnalyticsInstance() {
  if (!readyPromise) {
    readyPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }
  return readyPromise;
}

export function trackEvent(name, params) {
  getAnalyticsInstance().then((instance) => {
    if (!instance) return;
    try {
      logEvent(instance, name, params);
    } catch {
      // silenciós: un error d'analítica no ha d'afectar l'usuari
    }
  });
}
