import { useContext } from 'react';
import { I18nContext } from './context';

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n s\'ha de fer servir dins de <I18nProvider>');
  return ctx;
}
