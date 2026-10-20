import { PageShell } from '../components/PageShell';
import { Button } from '../components/ui';
import { useI18n } from '../i18n/useI18n';

export const BasesView = ({ onBack, onNavigate }) => {
  const { t } = useI18n();

  const clause = (n) => (
    <p key={n}>
      <strong className="font-semibold">{t(`bases.clause${n}Title`)}</strong> {t(`bases.clause${n}Text`)}
    </p>
  );

  return (
    <PageShell title={t('bases.title')} onBack={onBack} backLabel={t('bases.back')} narrow>
      <div className="max-w-[65ch] space-y-7 text-body">
        {clause(1)}
        {clause(2)}
        {clause(3)}

        <div className="bg-sun p-6 text-ink md:p-8">
          <h2 className="display mb-3 text-lead">{t('bases.prizesBoxTitle')}</h2>
          <p className="mb-6">{t('bases.prizesBoxText')}</p>
          <Button variant="secondary" onClick={() => onNavigate('prizes')}>
            {t('bases.prizesBoxButton')}
          </Button>
        </div>

        {clause(4)}
        {clause(5)}
      </div>
    </PageShell>
  );
};
