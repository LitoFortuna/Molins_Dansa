import { Shield, LogOut, Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';
import { LanguageSwitcher } from './LanguageSwitcher';

const LINKS = [
  { view: 'gallery', path: '/galeria', label: 'nav.gallery' },
  { view: 'map', path: '/mapa', label: 'nav.map' },
  { view: 'prizes', path: '/premis', label: 'nav.prizes' },
];

// Marca: el quadrat rosa amb la M (la mateixa de la icona de la PWA).
const BrandMark = () => (
  <svg viewBox="0 0 512 512" className="h-8 w-8 shrink-0" aria-hidden="true">
    <rect width="512" height="512" rx="100" fill="var(--color-brand)" />
    <path d="M100 400V150l156 150 156-150v250" fill="none" stroke="#fff" strokeWidth="60" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Navbar = ({ user, isAdmin, mobileMenuOpen, setMobileMenuOpen, navigateTo, handleLogout }) => {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const loggedIn = user && !user.isAnonymous;

  const linkClass = (path) =>
    `tap inline-flex items-center text-small font-medium hover:text-brand-deep ${
      pathname === path ? 'underline decoration-[3px] underline-offset-[10px]' : ''
    }`;

  return (
    <header className="sticky top-0 z-50 bg-paper">
      <nav aria-label={t('nav.main')} className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-6 px-5 md:px-6">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
          className="display flex items-center gap-3 text-small tracking-[-0.02em]"
        >
          <BrandMark />
          <span translate="no">Molins Dansa</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.view}
              href={link.path}
              onClick={(e) => { e.preventDefault(); navigateTo(link.view); }}
              aria-current={pathname === link.path ? 'page' : undefined}
              className={linkClass(link.path)}
            >
              {t(link.label)}
            </a>
          ))}
          <LanguageSwitcher />
          {loggedIn ? (
            <div className="flex items-center gap-4">
              <span className="flex min-w-0 items-center gap-2 text-small font-medium">
                {isAdmin && <Shield size={14} className="shrink-0 text-brand-deep" role="img" aria-label="Admin" />}
                <span className="max-w-[16ch] truncate">{user.displayName || user.email}</span>
              </span>
              <button onClick={handleLogout} className="tap flex items-center justify-center hover:text-brand-deep" aria-label={t('nav.logout')}>
                <LogOut size={18} />
              </button>
              <button onClick={() => navigateTo('upload')} className="tap bg-brand px-6 py-2 font-semibold text-white transition-colors hover:bg-brand-deep">
                {t('nav.participate')}
              </button>
            </div>
          ) : (
            <button onClick={() => navigateTo('auth')} className="tap bg-brand px-6 py-2 font-semibold text-white transition-colors hover:bg-brand-deep">
              {t('nav.login')}
            </button>
          )}
        </div>

        {/* Botó hamburguesa (només mòbil) */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            className="tap flex items-center justify-center"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Menú mòbil desplegable */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="bg-paper-2 md:hidden">
          <div className="flex flex-col px-5 py-4 text-lead font-semibold">
            {loggedIn && (
              <div className="flex items-center gap-2 py-3 text-body font-medium text-ink-soft">
                {isAdmin && <Shield size={16} className="text-brand-deep" aria-label="Admin" />}
                {user.displayName || user.email}
              </div>
            )}
            {LINKS.map((link) => (
              <a
                key={link.view}
                href={link.path}
                onClick={(e) => { e.preventDefault(); navigateTo(link.view); }}
                aria-current={pathname === link.path ? 'page' : undefined}
                className="tap flex items-center py-3 hover:text-brand-deep"
              >
                {t(link.label)}
              </a>
            ))}
            {loggedIn ? (
              <>
                <button onClick={() => navigateTo('upload')} className="tap mt-3 bg-brand px-6 py-3 text-left font-semibold text-white hover:bg-brand-deep">
                  {t('nav.participate')}
                </button>
                <button onClick={handleLogout} className="tap flex items-center gap-2 py-3 text-body font-medium text-ink-soft hover:text-ink">
                  <LogOut size={16} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <button onClick={() => navigateTo('auth')} className="tap mt-3 bg-brand px-6 py-3 text-left font-semibold text-white hover:bg-brand-deep">
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
