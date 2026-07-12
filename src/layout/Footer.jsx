import { Shield, RefreshCw } from 'lucide-react';
import { AdminConfigPanel } from '../features/admin/AdminConfigPanel';
import { useI18n } from '../i18n/useI18n';

export const Footer = ({ isAdmin, navigateTo, seedDatabase, contestConfig, configLoaded, handleSaveConfig }) => {
  const { t } = useI18n();

  return (
  <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
    <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-4 gap-8">
      <div className="col-span-2">
        <h4 className="text-white font-bold text-lg mb-4">Molins Dansa 2026</h4>
        <p className="text-sm leading-relaxed max-w-xs">
          {t('footer.tagline')}
        </p>
      </div>
      <div>
        <h5 className="text-white font-semibold mb-4">{t('footer.links')}</h5>
        <ul className="space-y-2 text-sm">
          <li><button onClick={() => navigateTo('bases')} className="hover:text-white text-left">{t('footer.bases')}</button></li>
          <li><button onClick={() => navigateTo('privacy')} className="hover:text-white text-left">{t('footer.privacy')}</button></li>
          <li><button onClick={() => navigateTo('schools')} className="hover:text-white text-left">{t('footer.schools')}</button></li>
        </ul>
      </div>
      <div>
        <h5 className="text-white font-semibold mb-4">{t('footer.contact')}</h5>
        <ul className="space-y-2 text-sm"><li>info@dancespace.cat</li></ul>
        <div className="mt-8 pt-4 border-t border-gray-800 space-y-4">

          {isAdmin && (
            <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
              <Shield size={14} /> {t('footer.adminActive')}
            </div>
          )}

          {isAdmin && (
            <button onClick={seedDatabase} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-mono">
              <RefreshCw size={12} /> {t('footer.loadSeedData')}
            </button>
          )}

          {isAdmin && <AdminConfigPanel contestConfig={contestConfig} configLoaded={configLoaded} onSave={handleSaveConfig} />}
        </div>
      </div>
    </div>
  </footer>
  );
};
