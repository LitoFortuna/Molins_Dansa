import { Trophy, Star, Heart } from 'lucide-react';
import { Card } from '../components/ui';
import { useI18n } from '../i18n/useI18n';

export const PrizesView = ({ onBack }) => {
  const { t } = useI18n();
  return (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
    <button onClick={onBack} className="text-sm text-gray-500 hover:text-rose-600 mb-6 flex items-center gap-1">{t('prizes.back')}</button>
    <Card className="p-8 md:p-12">
      <div className="flex items-center gap-3 mb-8 border-b pb-6">
        <Trophy className="text-rose-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-900">{t('prizes.title')}</h2>
      </div>

      <div className="space-y-8">
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-amber-900">{t('prizes.firstTitle')}</h3>
          </div>
          <p className="text-amber-800 mb-4">{t('prizes.firstText')}</p>
          <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
            <li>{t('prizes.firstItem1')}</li>
            <li>{t('prizes.firstItem2')}</li>
            <li>{t('prizes.firstItem3')}</li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Star className="text-gray-500" size={24} />
            <h3 className="text-xl font-bold text-gray-800">{t('prizes.secondTitle')}</h3>
          </div>
          <p className="text-gray-700 mb-4">{t('prizes.secondText')}</p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>{t('prizes.secondItem1')}</li>
            <li>{t('prizes.secondItem2')}</li>
          </ul>
        </div>

        <div className="bg-rose-50 p-6 rounded-xl border border-rose-200">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="text-rose-500" size={24} />
            <h3 className="text-xl font-bold text-rose-900">{t('prizes.publicTitle')}</h3>
          </div>
          <p className="text-rose-800 mb-4">{t('prizes.publicText')}</p>
          <ul className="list-disc pl-5 text-sm text-rose-700 space-y-1">
            <li>{t('prizes.publicItem1')}</li>
            <li>{t('prizes.publicItem2')}</li>
            <li>{t('prizes.publicItem3')}</li>
          </ul>
        </div>

        <div className="text-center pt-6 text-sm text-gray-500 italic">
          {t('prizes.footnote')}
        </div>
      </div>
    </Card>
  </div>
  );
};
