import { PageShell } from '../components/PageShell';
import { PrizeLineup } from '../components/PrizeLineup';
import { useI18n } from '../i18n/useI18n';

export const PrizesView = ({ onBack }) => {
  const { t } = useI18n();
  return (
    <PageShell title={t('prizes.title')} onBack={onBack} backLabel={t('prizes.back')}>
      <PrizeLineup detailed />
      <p className="mt-16 max-w-2xl text-body text-ink-soft">{t('prizes.footnote')}</p>
    </PageShell>
  );
};
