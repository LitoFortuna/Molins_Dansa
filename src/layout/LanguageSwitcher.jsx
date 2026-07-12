import { useI18n } from '../i18n/useI18n';

export const LanguageSwitcher = ({ className = '' }) => {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center rounded-full border border-gray-200 overflow-hidden text-xs font-bold ${className}`}>
      <button
        onClick={() => setLocale('ca')}
        aria-pressed={locale === 'ca'}
        className={`px-2.5 py-1 transition-colors ${locale === 'ca' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
      >
        CA
      </button>
      <button
        onClick={() => setLocale('es')}
        aria-pressed={locale === 'es'}
        className={`px-2.5 py-1 transition-colors ${locale === 'es' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
      >
        ES
      </button>
    </div>
  );
};
