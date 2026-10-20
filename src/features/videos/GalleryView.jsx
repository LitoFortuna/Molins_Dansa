import { useState, useMemo, useRef, useEffect } from 'react';
import { Heart, MapPin, Users, Share2, Trash2, Search, Download, CheckCircle } from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { VideoPlayer } from './VideoPlayer';
import { StatusBadge } from './StatusBadge';
import { parseConfigDate } from '../../lib/contestConfig';
import { categoryLabelKey } from '../../lib/categories';
import { trackEvent } from '../../lib/analytics';
import { useI18n } from '../../i18n/useI18n';

export const GalleryView = ({ videos, onVote, onBack, isAdmin, onUpdateVotes, onDelete, onModerate, loading, onShare, user, onNavigate, highlightId, contestConfig, votedIds = new Set() }) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tots');

  useEffect(() => { trackEvent('view_gallery'); }, []);

  // Determinar si el vot es "Premium" o "Bàsic"
  const isPremiumVoter = user && !user.isAnonymous;
  const voteValue = isPremiumVoter ? 5 : 1;

  const votingEndsAt = parseConfigDate(contestConfig?.votingEndsAt);
  const votingClosed = votingEndsAt ? new Date() >= votingEndsAt : false;

  const pendingCount = useMemo(() => videos.filter(v => v.status === 'pendent').length, [videos]);

  const filteredVideos = useMemo(() => {
    // El públic només veu vídeos aprovats (o sense status, per compatibilitat
    // amb vídeos anteriors a la moderació). L'admin veu i modera tots.
    const visible = isAdmin ? videos : videos.filter(v => v.status === 'aprovat' || v.status == null);
    return visible.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Tots' || video.category === filterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (isAdmin) {
        const rank = (v) => v.status === 'pendent' ? 0 : v.status === 'rebutjat' ? 2 : 1;
        const diff = rank(a) - rank(b);
        if (diff !== 0) return diff;
      }
      return b.votes - a.votes;
    });
  }, [videos, searchTerm, filterCategory, isAdmin]);

  // Deep-link: quan s'arriba amb #v=<id>, desplaça (un sol cop) i ressalta aquell vídeo.
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (!highlightId || scrolledRef.current) return;
    const el = document.getElementById(`video-${highlightId}`);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); scrolledRef.current = true; }
  }, [highlightId, filteredVideos]);

  const exportToCSV = () => {
    const headers = t('gallery.csvHeaders') + "\n";
    const rows = videos.map(v =>
      `${v.id},"${v.title}","${v.author}","${v.category}","${v.location}",${v.votes},"${v.url}",${new Date(v.createdAt).toLocaleDateString()}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", t('gallery.csvFilename'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-10 flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <a href="/" onClick={(e) => { e.preventDefault(); onBack(); }} className="tap -ml-2 mb-6 inline-flex items-center px-2 text-small font-medium text-ink-soft hover:text-ink">{t('gallery.back')}</a>
            <h1 className="display flex flex-wrap items-center gap-x-4 gap-y-2 text-head">
              {t('gallery.title')}
              {isAdmin && <span className="bg-brand-deep px-2.5 py-1 font-sans text-small font-semibold normal-case tracking-normal text-white">{t('gallery.admin')}</span>}
              {isAdmin && pendingCount > 0 && (
                <span className="bg-sun px-2.5 py-1 font-sans text-small font-semibold normal-case tracking-normal text-ink">{t('gallery.pendingCount', { n: pendingCount })}</span>
              )}
            </h1>
            <p className="mt-3 text-body text-ink-soft">{t('gallery.exploreCount', { n: filteredVideos.length })}</p>
          </div>
          {isAdmin && (
            <Button variant="outline" onClick={exportToCSV} className="shrink-0 text-small">
              <Download size={16} aria-hidden="true" /> {t('gallery.exportData')}
            </Button>
          )}
        </div>

        {/* CALL TO ACTION FOR VOTING */}
        {!isPremiumVoter && !votingClosed && (
          <div className="flex flex-col gap-4 bg-sun p-5 text-ink md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <h2 className="text-lead font-semibold leading-snug">{t('gallery.x5Title')}</h2>
              <p className="text-body">{t('gallery.x5Text')}</p>
            </div>
            <Button variant="secondary" onClick={() => onNavigate('auth')} className="shrink-0 px-6">{t('gallery.registerNow')}</Button>
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-grow">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={18} aria-hidden="true" />
            <input type="text" aria-label={t('gallery.searchPlaceholder')} placeholder={t('gallery.searchPlaceholder')} className="field pl-11" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select aria-label={t('gallery.allCategories')} className="field md:w-64" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="Tots">{t('gallery.allCategories')}</option>
            <option value="Individual">{t('gallery.categoryIndividual')}</option>
            <option value="Grup">{t('gallery.categoryGroup')}</option>
            <option value="Escola de Dansa">{t('gallery.categorySchool')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-body text-ink-soft">{t('gallery.loading')}</div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-paper-2 py-20 text-center">
          <p className="text-lead text-ink-soft">{t('gallery.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video, idx) => (
            <Card key={video.id} id={`video-${video.id}`} className={`group ${video.id === highlightId ? 'outline outline-4 outline-offset-4 outline-brand-deep' : ''}`}>
              <div className="relative">
                <VideoPlayer url={video.url} thumbnail={video.thumbnail} title={video.title} />
                <div className="pointer-events-none absolute left-0 top-0 z-20 flex">
                  {idx < 3 && <span className="bg-sun px-3 py-1.5 text-small font-semibold text-ink">#{idx + 1}</span>}
                  <Badge color="bg-ink text-paper">{categoryLabelKey(video.category) ? t(categoryLabelKey(video.category)) : video.category}</Badge>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <h3 className="break-words text-lead font-semibold leading-snug">{video.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-small text-ink-soft"><Users size={14} aria-hidden="true" /> {video.author}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(video.location + ", Molins de Rei")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-text mt-3 inline-flex items-start gap-1.5 text-small font-medium"
                >
                  <MapPin size={14} className="mt-1 shrink-0" aria-hidden="true" /> {video.location}
                </a>

                {isAdmin ? (
                  <div className="mt-5 space-y-3 bg-paper p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-small font-semibold text-brand-deep">{t('gallery.admin')}</span>
                      <button onClick={() => onDelete(video.id)} className="tap flex items-center justify-center text-brand-deep hover:text-ink" aria-label={t('gallery.delete')}><Trash2 size={18} /></button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge status={video.status} />
                      <div className="flex gap-2">
                        <button onClick={() => onModerate(video.id, 'aprovat')} disabled={video.status === 'aprovat'} className="tap bg-sun px-3 text-small font-semibold text-ink hover:bg-ink hover:text-sun disabled:cursor-not-allowed disabled:opacity-40">{t('gallery.approve')}</button>
                        <button onClick={() => onModerate(video.id, 'rebutjat')} disabled={video.status === 'rebutjat'} className="tap bg-paper-2 px-3 text-small font-semibold text-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40">{t('gallery.reject')}</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdateVotes(video.id, video.votes - 1)} aria-label={`${t('gallery.votes')} −1`} className="tap flex items-center justify-center bg-paper-2 hover:bg-ink hover:text-paper">−</button>
                      <input type="number" aria-label={t('gallery.votes')} value={video.votes} onChange={(e) => onUpdateVotes(video.id, parseInt(e.target.value) || 0)} className="field text-center font-semibold tabular-nums" />
                      <button onClick={() => onUpdateVotes(video.id, video.votes + 1)} aria-label={`${t('gallery.votes')} +1`} className="tap flex items-center justify-center bg-paper-2 hover:bg-ink hover:text-paper">+</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <p className="text-small text-ink-soft"><span className="font-display text-lead font-extrabold tabular-nums text-ink">{video.votes}</span> {t('gallery.votes')}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onShare(video)} className="tap flex items-center justify-center bg-paper hover:bg-ink hover:text-paper" title={t('gallery.share')} aria-label={t('gallery.share')}><Share2 size={18} /></button>
                      {votingClosed ? (
                        <span className="px-3 py-2 text-small font-medium text-ink-soft">{t('gallery.votingClosed')}</span>
                      ) : votedIds.has(video.id) ? (
                        <span className="flex items-center gap-2 px-3 py-2 text-small font-semibold text-ink">
                          <CheckCircle size={18} className="text-brand-deep" aria-hidden="true" /> {t('gallery.voteRegistered')}
                        </span>
                      ) : (
                        <button onClick={() => onVote(video.id)} className={`tap flex items-center gap-2 px-5 font-semibold transition-colors ${isPremiumVoter ? 'bg-sun text-ink hover:bg-ink hover:text-sun' : 'bg-brand text-white hover:bg-brand-deep'}`}>
                          <Heart size={18} aria-hidden="true" />
                          {t('gallery.voteButton', { n: voteValue })}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
