import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { Monument } from '../components/Monument';
import { MillWheel } from '../components/MillWheel';
import { Reveal } from '../components/Reveal';
import { PrizeLineup } from '../components/PrizeLineup';
import { YouTubeFrame } from '../components/YouTubeFrame';
import { parseConfigDate, daysUntil } from '../lib/contestConfig';
import { getYouTubeId } from '../lib/videoUrl';
import { rankVideos } from '../lib/ranking';
import { useI18n } from '../i18n/useI18n';

// Talls de la franja segons quants vídeos hi ha (mòbil: dues files 64/36 i
// 36/64; escriptori: una fila amb pesos 5·2·3·2).
const MOBILE_BASIS = {
  1: ['100%'],
  2: ['100%', '100%'],
  3: ['64%', '36%', '100%'],
  4: ['64%', '36%', '36%', '64%'],
};
const DESKTOP_GROW = { 1: [1], 2: [5, 3], 3: [5, 2, 3], 4: [5, 2, 3, 2] };

const STEPS = ['step1', 'step2', 'step3', 'step4'];
const STEP_START = ['md:col-start-1', 'md:col-start-3', 'md:col-start-5', 'md:col-start-7'];

export const HomeView = ({ onNavigate, contestConfig, videos = [] }) => {
  const { t, locale } = useI18n();
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

  const submissionOpen = submissionEndsAt && now < submissionEndsAt;
  const deadline = submissionOpen
    ? t('home.ctaDeadline', {
        date: submissionEndsAt.toLocaleDateString(locale, { day: 'numeric', month: 'long' }),
      })
    : '';

  // El rànquing en directe: el primer vídeo és el de la portada; els quatre
  // primers omplen la franja.
  const ranked = useMemo(() => rankVideos(videos), [videos]);
  const leader = ranked[0];
  const leaderId = leader ? getYouTubeId(leader.url) : null;
  const panels = ranked.slice(0, 4);

  const votes = (n) => (n === 1 ? t('home.voteOne') : t('home.voteMany', { n }));

  return (
    <div>
      {banner && (
        <div className={`flex items-center justify-center gap-2 px-5 py-2.5 text-small font-medium ${banner.closed ? 'bg-paper-2 text-ink' : 'bg-sun text-ink'}`}>
          <Calendar size={16} aria-hidden="true" /> {banner.text}
        </div>
      )}

      {/* ---------------------------------------------------------------- Portada */}
      <section className="grid min-h-[calc(100svh-4rem)] grid-rows-[minmax(280px,58fr)_auto_auto]">
        <div className="on-brand relative overflow-hidden bg-brand text-white">
          {leader && leaderId ? (
            <Link to={`/video/${leader.id}`} className="absolute inset-0 block">
              <YouTubeFrame
                key={leaderId}
                id={leaderId}
                priority
                className="photo-drift absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute bottom-0 left-0 block max-w-[calc(100%-1.25rem)] bg-ink/85 px-5 py-4 text-lead leading-snug text-paper md:max-w-lg md:px-6">
                {t('home.leaderCaption', { title: leader.title, votes: votes(leader.votes || 0) })}
              </span>
            </Link>
          ) : (
            // Sense vídeos encara: la roda, en gran i tallada, ocupa el camp.
            <MillWheel className="pointer-events-none absolute -bottom-[38%] -right-[8%] aspect-square h-[150%] w-auto text-brand-deep" />
          )}
        </div>

        <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="max-w-xl text-lead">{t('home.tagline')}</p>
          <a
            href="/participa"
            onClick={(e) => { e.preventDefault(); onNavigate('upload'); }}
            className="tap inline-flex items-center self-start bg-brand px-8 py-3 text-lead font-semibold text-white transition-colors hover:bg-brand-deep md:self-auto"
          >
            {t('home.participate')}
          </a>
        </div>

        <div className="overflow-hidden px-5 pb-5 md:px-6 md:pb-7">
          <Monument label={t('home.heroTitle')} />
        </div>
      </section>

      {/* ------------------------------------------------- Franja: ja s'està ballant */}
      {panels.length > 0 && (
        <section className="pt-28 md:pt-44">
          <div className="px-5 md:pl-[16.5vw] md:pr-6">
            <Reveal as="h2" className="display mb-10 text-head md:mb-16">
              {t('home.showcaseTitle')}
            </Reveal>
          </div>

          <div className="band h-[84svh] md:h-[68svh] md:min-h-[460px]">
            {panels.map((video, i) => {
              const ytId = getYouTubeId(video.url);
              const n = panels.length;
              return (
                <Link
                  key={video.id}
                  to={`/video/${video.id}`}
                  className="band-panel group block bg-ink text-paper"
                  style={{
                    '--m-basis': MOBILE_BASIS[n][i],
                    '--m-h': n === 1 ? '100%' : '50%',
                    '--grow': DESKTOP_GROW[n][i],
                  }}
                >
                  {ytId && (
                    <YouTubeFrame
                      key={ytId}
                      id={ytId}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-0 left-0 block max-w-full bg-ink/85 px-4 py-3 md:px-5 md:py-4">
                    <span className="line-clamp-2 block text-lead font-semibold leading-snug">{video.title}</span>
                    <span className="block text-small">{votes(video.votes || 0)}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <Reveal className="flex flex-wrap items-baseline gap-x-8 gap-y-2 px-5 pt-6 text-body md:pl-[16.5vw] md:pr-6">
            <p className="text-ink-soft">{t('home.showcaseCaption')}</p>
            <Link to="/galeria" className="link-text font-medium">{t('home.showcaseCta')}</Link>
            <Link to="/mapa" className="link-text font-medium">{t('home.showcaseMap')}</Link>
          </Reveal>
        </section>
      )}

      {/* ----------------------------------------------- Com es participa: l'escala */}
      <section className="px-5 pt-32 md:px-6 md:pt-52" aria-labelledby="how-title">
        <h2 id="how-title" className="sr-only">{t('home.howTitle')}</h2>
        <ol className="grid gap-y-12 md:grid-cols-12 md:gap-y-16">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={`${STEP_START[i]} md:col-end-13 ml-[calc(var(--k)*6vw)] md:ml-0`}
              style={{ '--k': i }}
            >
              <Reveal
                as="h3"
                className={`font-display text-balance text-head font-extrabold leading-[1.05] tracking-[-0.03em] ${i === STEPS.length - 1 ? 'text-brand-deep' : ''}`}
              >
                {t(`home.${step}Title`)}
              </Reveal>
              <Reveal as="p" index={1} className="mt-3 max-w-[34ch] text-body text-ink-soft">
                {t(`home.${step}Text`)}
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* --------------------------------------------------------- Els premis */}
      <section className="mt-32 bg-sun px-5 py-20 text-ink md:mt-52 md:px-6 md:py-32">
        <Reveal as="h2" className="display mb-12 max-w-4xl text-head md:mb-20">
          {t('home.prizesTitle')}
        </Reveal>
        <PrizeLineup />
        <Reveal index={3} className="mt-14">
          <Link
            to="/premis"
            className="text-body font-medium underline decoration-2 underline-offset-4 hover:text-brand-deep"
          >
            {t('home.prizesCta')}
          </Link>
        </Reveal>
      </section>

      {/* ------------------------------------------------- Qui hi col·labora */}
      <section className="bg-paper-2 px-5 py-20 md:px-6 md:py-32">
        <Reveal as="p" className="max-w-4xl text-balance text-lead font-medium leading-snug">
          {t('home.proofStatement')}
        </Reveal>
        <div className="mt-14 flex flex-wrap items-end gap-x-14 gap-y-8 md:mt-20">
          <Reveal as="p" index={1} className="w-full text-body text-ink-soft">{t('home.collaboration')}</Reveal>
          <Reveal as="img" index={2} src="/logos/ajuntament.png" alt={t('home.cityCouncilAlt')} width="1394" height="459" className="h-16 w-auto md:h-24" />
          <Reveal as="img" index={3} src="/logos/generalitat.png" alt={t('home.generalitatAlt')} width="1464" height="400" className="h-20 w-auto md:h-28" />
        </div>
      </section>

      {/* ------------------------------------------- Una paraula és el botó */}
      <a
        href="/participa"
        onClick={(e) => { e.preventDefault(); onNavigate('upload'); }}
        className="swap-band on-brand relative flex min-h-[46svh] flex-col justify-between overflow-hidden px-5 pb-6 pt-6 md:min-h-[60svh] md:px-6"
      >
        <span className="flex items-start justify-between gap-6">
          <span className="max-w-md text-lead">
            {t('home.ctaText')} {deadline}
          </span>
          <ArrowUpRight className="h-8 w-8 shrink-0 md:h-12 md:w-12" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span className="display block whitespace-nowrap text-[calc((100vw-2.5rem)/4.4)] leading-[0.8] tracking-[-0.05em] md:text-[calc((100vw-3rem)/4.4)]">
          {t('home.ctaWord')}
        </span>
      </a>
    </div>
  );
};
