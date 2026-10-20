import { Button } from '../components/ui';
import { useI18n } from '../i18n/useI18n';

export const SuccessView = ({ onNavigate }) => {
  const { t } = useI18n();
  return (
    <div className="py-8 md:py-16">
      <h1 className="display text-[clamp(2.5rem,10vw,7.5rem)] leading-[0.85] tracking-[-0.05em]">{t('success.title')}</h1>
      <p className="mt-10 max-w-[34ch] text-lead">{t('success.text')}</p>
      <Button onClick={() => onNavigate('gallery')} className="mt-8 px-8 py-3 text-body">{t('success.galleryButton')}</Button>
    </div>
  );
};
