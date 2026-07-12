import { Trophy } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { useI18n } from '../i18n/useI18n';

export const BasesView = ({ onBack, onNavigate }) => {
  const { t } = useI18n();
  return (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">{t('bases.back')}</button>
    <Card className="p-8">
      <h2 className="text-3xl font-bold mb-6">{t('bases.title')}</h2>
      <div className="prose prose-rose max-w-none text-gray-700 space-y-4">
        <p><strong>{t('bases.clause1Title')}</strong> {t('bases.clause1Text')}</p>
        <p><strong>{t('bases.clause2Title')}</strong> {t('bases.clause2Text')}</p>
        <p><strong>{t('bases.clause3Title')}</strong> {t('bases.clause3Text')}</p>

        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl my-6">
          <h3 className="font-bold text-rose-800 mb-2">{t('bases.prizesBoxTitle')}</h3>
          <p className="mb-4 text-sm">{t('bases.prizesBoxText')}</p>
          <Button variant="primary" onClick={() => onNavigate('prizes')} className="text-sm w-full md:w-auto">
            <Trophy size={16} /> {t('bases.prizesBoxButton')}
          </Button>
        </div>

        <p><strong>{t('bases.clause4Title')}</strong> {t('bases.clause4Text')}</p>
        <p><strong>{t('bases.clause5Title')}</strong> {t('bases.clause5Text')}</p>
      </div>
    </Card>
  </div>
  );
};
