import { PageShell } from '../components/PageShell';
import { useI18n } from '../i18n/useI18n';

const Section = ({ title, children }) => (
  <section>
    <h2 className="mb-2 text-lead font-semibold leading-snug">{title}</h2>
    {children}
  </section>
);

export const PrivacyView = ({ onBack }) => {
  const { t } = useI18n();

  return (
    <PageShell title={t('privacy.title')} onBack={onBack} backLabel={t('privacy.back')} narrow>
      <div className="max-w-[65ch] space-y-10 text-body">
        <Section title={t('privacy.s1Title')}>
          <p>{t('privacy.s1Text')}</p>
        </Section>

        <Section title={t('privacy.s2Title')}>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t('privacy.s2Item1')}</li>
            <li>{t('privacy.s2Item2')}</li>
            <li>{t('privacy.s2Item3')}</li>
            <li>{t('privacy.s2Item4')}</li>
          </ul>
        </Section>

        <Section title={t('privacy.s3Title')}>
          <p className="mb-3">{t('privacy.s3Intro')}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="font-semibold">{t('privacy.s3Item1Bold')}</strong> {t('privacy.s3Item1')}</li>
            <li><strong className="font-semibold">{t('privacy.s3Item2Bold')}</strong>{t('privacy.s3Item2')}</li>
            <li><strong className="font-semibold">{t('privacy.s3Item3Bold')}</strong>{t('privacy.s3Item3')}</li>
            <li><strong className="font-semibold">{t('privacy.s3Item4Bold')}</strong>{t('privacy.s3Item4')}</li>
            <li><strong className="font-semibold">{t('privacy.s3Item5Bold')}</strong>{t('privacy.s3Item5')}</li>
          </ul>
          <p className="mt-3">{t('privacy.s3NoCommercial')}</p>
        </Section>

        <Section title={t('privacy.s4Title')}>
          <p>{t('privacy.s4Text')}</p>
        </Section>

        <Section title={t('privacy.s5Title')}>
          <p>{t('privacy.s5Text')}</p>
        </Section>

        <Section title={t('privacy.s6Title')}>
          <p>{t('privacy.s6Text')}</p>
        </Section>
      </div>
    </PageShell>
  );
};
