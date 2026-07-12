import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui';
import { useI18n } from '../i18n/useI18n';

export const SuccessView = ({ onNavigate }) => {
  const { t } = useI18n();
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
      <h2 className="text-4xl font-bold mb-4">{t('success.title')}</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{t('success.text')}</p>
      <div className="flex justify-center gap-4"><Button onClick={() => onNavigate('gallery')}>{t('success.galleryButton')}</Button></div>
    </div>
  );
};
