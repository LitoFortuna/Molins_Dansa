import { MapPin, Shield, LogOut, Menu, X } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar = ({ user, isAdmin, mobileMenuOpen, setMobileMenuOpen, navigateTo, handleLogout }) => {
  const { t } = useI18n();

  return (
  <nav className="bg-white shadow-sm sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-rose-600 cursor-pointer" onClick={() => navigateTo('home')}>
        <div className="w-8 h-8 bg-rose-600 text-white rounded-lg flex items-center justify-center transform -rotate-6">M</div>MOLINS DANSA
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
        <button onClick={() => navigateTo('home')} className="hover:text-rose-600">{t('nav.home')}</button>
        <button onClick={() => navigateTo('gallery')} className="hover:text-rose-600">{t('nav.gallery')}</button>
        <button onClick={() => navigateTo('map')} className="hover:text-amber-600 flex items-center gap-1"><MapPin size={16} /> {t('nav.map')}</button>
        <LanguageSwitcher />
        {user && !user.isAnonymous ? (
          <div className="flex items-center gap-4 border-l pl-4 ml-2">
            <span className="text-gray-900 font-semibold flex items-center gap-2">
              {isAdmin && <Shield size={14} className="text-red-500" />}
              {user.displayName || user.email}
            </span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500" aria-label={t('nav.logout')}><LogOut size={18} /></button>
            <button onClick={() => navigateTo('upload')} className="px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md">{t('nav.participate')}</button>
          </div>
        ) : (<button onClick={() => navigateTo('auth')} className="px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md">{t('nav.login')}</button>)}
      </div>

      {/* BOTÓ HAMBURGUESA (només mòbil) */}
      <div className="md:hidden flex items-center gap-2">
        <LanguageSwitcher />
        <button
          className="text-gray-600 hover:text-rose-600 p-2 -mr-2"
          onClick={() => setMobileMenuOpen(o => !o)}
          aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
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
          <button onClick={() => navigateTo('home')} className="text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-600">{t('nav.home')}</button>
          <button onClick={() => navigateTo('gallery')} className="text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 hover:text-rose-600">{t('nav.gallery')}</button>
          <button onClick={() => navigateTo('map')} className="text-left px-3 py-2.5 rounded-lg hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2"><MapPin size={16} /> {t('nav.map')}</button>
          {user && !user.isAnonymous ? (
            <>
              <button onClick={() => navigateTo('upload')} className="text-left px-3 py-2.5 mt-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-semibold">{t('nav.participate')}</button>
              <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center gap-2"><LogOut size={16} /> {t('nav.logout')}</button>
            </>
          ) : (
            <button onClick={() => navigateTo('auth')} className="text-left px-3 py-2.5 mt-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-semibold">{t('nav.login')}</button>
          )}
        </div>
      </div>
    )}
  </nav>
  );
};
