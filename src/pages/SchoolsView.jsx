import { PageShell } from '../components/PageShell';
import { Reveal } from '../components/Reveal';
import { useI18n } from '../i18n/useI18n';

const SCHOOLS = ['school1', 'school2'];

export const SchoolsView = ({ onBack }) => {
  const { t } = useI18n();
  return (
    <PageShell title={t('footer.schools')} onBack={onBack} backLabel={t('schools.back')}>
      <ul className="grid gap-14 md:gap-20">
        {SCHOOLS.map((school, i) => (
          <Reveal as="li" key={school} index={i}>
            <h2 className="font-display text-head font-extrabold leading-[1.05] tracking-[-0.03em]">{t(`schools.${school}Name`)}</h2>
            <p className="mt-3 max-w-[34ch] text-body text-ink-soft">{t(`schools.${school}Text`)}</p>
          </Reveal>
        ))}
      </ul>
    </PageShell>
  );
};
