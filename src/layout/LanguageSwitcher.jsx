import { useI18n } from '../i18n/useI18n';

export const LanguageSwitcher = ({ className = '' }) => {
  const { locale, setLocale } = useI18n();

  const option = (code, label) => (
    <button
      onClick={() => setLocale(code)}
      aria-pressed={locale === code}
      lang={code}
      className={`tap px-3 text-small font-semibold transition-colors ${
        locale === code ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`flex items-center bg-paper-2 ${className}`}>
      {option('ca', 'CA')}
      {option('es', 'ES')}
    </div>
  );
};
