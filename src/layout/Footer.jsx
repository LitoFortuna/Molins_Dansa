import { Shield, RefreshCw } from 'lucide-react';
import { AdminConfigPanel } from '../features/admin/AdminConfigPanel';
import { MillWheel } from '../components/MillWheel';
import { useI18n } from '../i18n/useI18n';

const LINKS = [
  { view: 'bases', path: '/bases', label: 'footer.bases' },
  { view: 'privacy', path: '/privacitat', label: 'footer.privacy' },
  { view: 'schools', path: '/escoles', label: 'footer.schools' },
];

// Peu de pàgina: camp invers (tinta), una invitació, els enllaços legals i el
// nom tallat per la vora inferior. A la portada ocupa tota la pantalla; a la
// resta de pàgines és més baix (`compact`).
export const Footer = ({ compact = false, isAdmin, navigateTo, seedDatabase, contestConfig, configLoaded, handleSaveConfig }) => {
  const { t } = useI18n();

  return (
    <footer className={`on-dark relative flex flex-col justify-between overflow-hidden bg-ink px-5 pt-16 text-paper md:px-6 md:pt-24 ${compact ? 'min-h-[64svh]' : 'min-h-svh'}`}>
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="display max-w-[15ch] text-head leading-[1.04]">{t('footer.invite')}</p>
          <a
            href="mailto:info@dancespace.cat"
            className="tap mt-8 inline-flex items-center bg-brand px-8 py-3 font-semibold text-white transition-colors hover:bg-paper hover:text-brand-deep"
          >
            {t('footer.write')}
          </a>
        </div>

        <ul className="grid content-start gap-1 text-body md:col-span-5 lg:col-span-3 lg:col-start-10">
          {LINKS.map((link) => (
            <li key={link.view}>
              <a
                href={link.path}
                onClick={(e) => { e.preventDefault(); navigateTo(link.view); }}
                className="tap inline-flex items-center hover:underline hover:decoration-2 hover:underline-offset-4"
              >
                {t(link.label)}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div className="mt-12 grid max-w-3xl gap-4 bg-paper/10 p-5 text-small">
          <div className="flex items-center gap-2 font-semibold text-sun">
            <Shield size={16} aria-hidden="true" /> {t('footer.adminActive')}
          </div>
          <button onClick={seedDatabase} className="tap flex items-center gap-2 self-start text-paper hover:underline">
            <RefreshCw size={14} aria-hidden="true" /> {t('footer.loadSeedData')}
          </button>
          <AdminConfigPanel contestConfig={contestConfig} configLoaded={configLoaded} onSave={handleSaveConfig} />
        </div>
      )}

      <div className="mt-16 md:mt-24">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1 pb-3 text-small text-paper/80">
          <span>{t('footer.credits')}</span>
          <a href="mailto:info@dancespace.cat" className="hover:text-paper hover:underline">info@dancespace.cat</a>
        </div>
        {/* El nom torna, enorme i tallat per la vora inferior. */}
        <div aria-hidden="true" className="display monument pointer-events-none flex-nowrap translate-y-[27%] select-none text-[27vw] md:text-[calc((100vw-3rem)/4.78)]">
          <span>M</span>
          <MillWheel className="monument-wheel" />
          <span>LINS</span>
        </div>
      </div>
    </footer>
  );
};
