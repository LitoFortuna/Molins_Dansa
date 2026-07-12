import { Camera, MapPin, Play, Trophy, Calendar, Building2, Store, School } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { parseConfigDate, daysUntil } from '../lib/contestConfig';
import { useI18n } from '../i18n/useI18n';

export const HomeView = ({ onNavigate, contestConfig }) => {
  const { t } = useI18n();
  const votingEndsAt = parseConfigDate(contestConfig?.votingEndsAt);
  const submissionEndsAt = parseConfigDate(contestConfig?.submissionEndsAt);
  const now = new Date();

  let banner = null;
  if (votingEndsAt) {
    banner = now < votingEndsAt
      ? { text: t('home.daysUntilVoting', { n: daysUntil(votingEndsAt) }), closed: false }
      : { text: t('home.votingClosedBanner'), closed: true };
  } else if (submissionEndsAt && now < submissionEndsAt) {
    banner = { text: t('home.daysUntilSubmission', { n: daysUntil(submissionEndsAt) }), closed: false };
  }

  return (
  <div className="space-y-12 animate-in fade-in duration-500">
    {banner && (
      <div className={`flex items-center justify-center gap-2 text-sm font-semibold rounded-xl px-4 py-3 ${banner.closed ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
        <Calendar size={16} /> {banner.text}
      </div>
    )}
    <section className="relative bg-gradient-to-br from-rose-900 via-rose-700 to-orange-500 text-white rounded-3xl overflow-hidden shadow-2xl p-8 md:p-16 text-center">
      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium border border-white/30">{t('home.edition')}</span>
        <h1 className="text-4xl md:text-6xl font-black mb-6 mt-4">MOLINS DANSA 2026</h1>
        <p className="text-lg md:text-xl mb-8 text-rose-100">{t('home.tagline')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => onNavigate('upload')} className="px-8 py-3"><Camera size={20} />{t('home.participate')}</Button>
          <Button variant="secondary" onClick={() => onNavigate('gallery')} className="px-8 py-3"><Play size={20} />{t('home.watchVideos')}</Button>
        </div>
      </div>
    </section>

    <div className="grid md:grid-cols-3 gap-6">
      <Card className="p-6 text-center"><Calendar size={24} className="mx-auto text-rose-600 mb-2" /><h3 className="font-bold">{t('home.calendarTitle')}</h3><p>{t('home.calendarText')}</p></Card>
      <Card onClick={() => onNavigate('map')} className="p-6 text-center cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-amber-200 transition-all"><MapPin size={24} className="mx-auto text-amber-600 mb-2" /><h3 className="font-bold">{t('home.locationsTitle')}</h3><p>{t('home.locationsText')}</p></Card>
      <Card onClick={() => onNavigate('prizes')} className="p-6 text-center cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-purple-200 transition-all"><Trophy size={24} className="mx-auto text-purple-600 mb-2" /><h3 className="font-bold">{t('home.prizesTitle')}</h3><p>{t('home.prizesText')}</p></Card>
    </div>

    <section className="py-8 border-t border-gray-200 mt-12">
      {/* ORGANIZA */}
      <div className="text-center mb-10">
        <span className="text-rose-600 font-semibold uppercase tracking-wider text-sm">{t('home.organizedBy')}</span>
        <div className="flex flex-col items-center justify-center mt-4">
          <img
            src="https://lh3.googleusercontent.com/sitesv/APaQ0ST6zYhLtwrfdr0Pd30XlLk3JwV9TFZyDzE2nHyPOkvlT-P3eC6mmor86GnTgen5Ux5eg4VE_hu8Lnqw4P9b-De721utqyz8zmabGyzb22eR4n48DkeUe7qqEYEgxxeM-w_swEMKb_dJCJYMkzFofi7vzrlIbns77m96xorXGOXH0XagiuI2VbN2j-Y8-1g_RO_1zy-4g3wM1ykRNNua_BN0QcTfzKIfFsBuDfo=w400"
            alt="Associació Dance Space"
            loading="lazy"
            decoding="async"
            className="h-24 object-contain mb-2"
          />
          <h2 className="text-xl font-bold text-gray-900">Associació Dance Space</h2>
        </div>
      </div>

      {/* COLABORADORES */}
      <div className="text-center mb-8">
        <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">{t('home.collaboration')}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70">
        <div className="flex flex-col items-center gap-2"><Building2 size={32} /><span className="text-sm font-bold text-center whitespace-pre-line">{t('home.cityCouncil')}</span></div>
        <div className="flex flex-col items-center gap-2"><Building2 size={32} /><span className="text-sm font-bold text-center whitespace-pre-line">{t('home.generalitat')}</span></div>
        <div className="flex flex-col items-center gap-2"><Store size={32} /><span className="text-sm font-bold text-center">{t('home.localShops')}</span></div>
        <div className="flex flex-col items-center gap-2"><School size={32} /><span className="text-sm font-bold text-center">{t('home.danceSchools')}</span></div>
      </div>
    </section>
  </div>
  );
};
