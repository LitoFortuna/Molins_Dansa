import { useMemo } from 'react';
import { Camera, MapPin, Play, Trophy, Calendar, Store, School, Heart } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { parseConfigDate, daysUntil } from '../lib/contestConfig';
import { getYouTubeId } from '../lib/videoUrl';
import { useI18n } from '../i18n/useI18n';

// L'Ajuntament i la Generalitat tenen logotip institucional real; Comerç
// Local i Escoles Dansa representen categories senceres (no una sola
// entitat), així que mantenen una icona.
const COLLABORATORS = [
  { logo: '/logos/ajuntament.png', labelKey: 'home.cityCouncil' },
  { logo: '/logos/generalitat.png', labelKey: 'home.generalitat' },
  { icon: Store, labelKey: 'home.localShops', color: 'text-amber-600 bg-amber-50' },
  { icon: School, labelKey: 'home.danceSchools', color: 'text-purple-600 bg-purple-50' },
];

export const HomeView = ({ onNavigate, contestConfig, videos = [] }) => {
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

  // Les inscripcions més recents (les 4 últimes), per donar vida a la portada
  // amb participacions reals en lloc de deixar un buit entre el hero i el peu.
  const latestVideos = useMemo(
    () => [...videos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 4),
    [videos]
  );

  return (
  <div className="space-y-16 animate-in fade-in duration-500">
    {banner && (
      <div className={`flex items-center justify-center gap-2 text-sm font-semibold rounded-xl px-4 py-3 ${banner.closed ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
        <Calendar size={16} /> {banner.text}
      </div>
    )}
    <section className="relative bg-gradient-to-br from-rose-900 via-rose-700 to-orange-500 text-white rounded-3xl overflow-hidden shadow-2xl p-8 md:p-16 text-center">
      {/* Textura decorativa: taques de color difuminades, purament CSS (cap asset extern). */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
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
      <Card className="p-6 text-center hover:shadow-lg hover:ring-2 hover:ring-rose-100 transition-all"><Calendar size={24} className="mx-auto text-rose-600 mb-2" /><h3 className="font-bold">{t('home.calendarTitle')}</h3><p>{t('home.calendarText')}</p></Card>
      <Card onClick={() => onNavigate('map')} className="p-6 text-center cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-amber-200 transition-all"><MapPin size={24} className="mx-auto text-amber-600 mb-2" /><h3 className="font-bold">{t('home.locationsTitle')}</h3><p>{t('home.locationsText')}</p></Card>
      <Card onClick={() => onNavigate('prizes')} className="p-6 text-center cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-purple-200 transition-all"><Trophy size={24} className="mx-auto text-purple-600 mb-2" /><h3 className="font-bold">{t('home.prizesTitle')}</h3><p>{t('home.prizesText')}</p></Card>
    </div>

    {latestVideos.length > 0 && (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('home.latestTitle')}</h2>
          <button onClick={() => onNavigate('gallery')} className="text-sm font-semibold text-rose-600 hover:text-rose-700">{t('home.latestCta')}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {latestVideos.map((video) => {
            const ytId = getYouTubeId(video.url);
            return (
              <button
                key={video.id}
                onClick={() => onNavigate('gallery')}
                className="group text-left rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-video bg-gray-200">
                  {ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={video.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400"><Play size={24} /></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 truncate">{video.title}</p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1"><Heart size={12} className="text-rose-400" />{video.votes ?? 0}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    )}

    <section className="py-10 px-6 md:px-10 bg-gray-50 rounded-3xl">
      {/* ORGANIZA */}
      <div className="text-center mb-10">
        <span className="text-rose-600 font-semibold uppercase tracking-wider text-sm">{t('home.organizedBy')}</span>
        <div className="flex flex-col items-center justify-center mt-4">
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center mb-3">
            <Heart size={36} className="text-rose-500" fill="currentColor" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Associació Dance Space</h2>
        </div>
      </div>

      {/* COLABORADORES */}
      <div className="text-center mb-8">
        <span className="text-gray-500 font-semibold uppercase tracking-wider text-xs">{t('home.collaboration')}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {COLLABORATORS.map((collaborator) => {
          const Icon = collaborator.icon;
          return (
            <div key={collaborator.labelKey} className="flex flex-col items-center gap-3 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              {collaborator.logo ? (
                <div className="h-12 flex items-center justify-center">
                  <img src={collaborator.logo} alt={t(collaborator.labelKey)} className="max-h-12 max-w-full object-contain" />
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${collaborator.color}`}><Icon size={24} /></div>
              )}
              <span className="text-sm font-bold text-center whitespace-pre-line text-gray-700">{t(collaborator.labelKey)}</span>
            </div>
          );
        })}
      </div>
    </section>
  </div>
  );
};
