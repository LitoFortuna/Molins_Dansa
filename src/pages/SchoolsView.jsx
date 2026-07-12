import { School, Building2 } from 'lucide-react';
import { Card } from '../components/ui';
import { useI18n } from '../i18n/useI18n';

export const SchoolsView = ({ onBack }) => {
  const { t } = useI18n();
  return (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">{t('schools.back')}</button>
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6 text-center hover:shadow-xl transition-all">
        <School size={48} className="mx-auto text-rose-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">{t('schools.school1Name')}</h3>
        <p className="text-gray-500">{t('schools.school1Text')}</p>
      </Card>
      <Card className="p-6 text-center hover:shadow-xl transition-all">
        <Building2 size={48} className="mx-auto text-amber-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">{t('schools.school2Name')}</h3>
        <p className="text-gray-500">{t('schools.school2Text')}</p>
      </Card>
    </div>
  </div>
  );
};
