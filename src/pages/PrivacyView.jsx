import { Lock } from 'lucide-react';
import { Card } from '../components/ui';
import { useI18n } from '../i18n/useI18n';

export const PrivacyView = ({ onBack }) => {
  const { t } = useI18n();
  return (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">{t('privacy.back')}</button>
    <Card className="p-8">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><Lock className="text-rose-600" /> {t('privacy.title')}</h2>

      <div className="prose prose-rose max-w-none text-gray-700 space-y-4 text-sm">
        <p><strong>{t('privacy.s1Title')}</strong><br />{t('privacy.s1Text')}</p>

        <p><strong>{t('privacy.s2Title')}</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('privacy.s2Item1')}</li>
          <li>{t('privacy.s2Item2')}</li>
          <li>{t('privacy.s2Item3')}</li>
          <li>{t('privacy.s2Item4')}</li>
        </ul>

        <p><strong>{t('privacy.s3Title')}</strong><br />{t('privacy.s3Intro')}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>{t('privacy.s3Item1Bold')}</strong> {t('privacy.s3Item1')}</li>
          <li><strong>{t('privacy.s3Item2Bold')}</strong>{t('privacy.s3Item2')}</li>
          <li><strong>{t('privacy.s3Item3Bold')}</strong>{t('privacy.s3Item3')}</li>
          <li><strong>{t('privacy.s3Item4Bold')}</strong>{t('privacy.s3Item4')}</li>
        </ul>
        <p>{t('privacy.s3NoCommercial')}</p>

        <p><strong>{t('privacy.s4Title')}</strong><br />{t('privacy.s4Text')}</p>

        <p><strong>{t('privacy.s5Title')}</strong><br />{t('privacy.s5Text')}</p>

        <p><strong>{t('privacy.s6Title')}</strong><br />{t('privacy.s6Text')}</p>
      </div>
    </Card>
  </div>
  );
};
