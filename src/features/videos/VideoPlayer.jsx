import { useState } from 'react';
import { Play, Link as LinkIcon, X } from 'lucide-react';
import { getYouTubeId } from '../../lib/videoUrl';
import { useI18n } from '../../i18n/useI18n';

export const VideoPlayer = ({ url, thumbnail, title }) => {
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeId = getYouTubeId(url);

  if (isPlaying && youtubeId) {
    return (
      <div className="relative aspect-video bg-ink">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <button
          onClick={() => setIsPlaying(false)}
          aria-label={t('gallery.close')}
          className="tap absolute right-0 top-0 flex items-center justify-center bg-ink/85 text-paper transition-colors hover:bg-brand"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative flex aspect-video items-center justify-center overflow-hidden bg-paper-2">
      {/* BACKGROUND THUMBNAIL */}
      {youtubeId ? (
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          width="480"
          height="360"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : thumbnail && !thumbnail.startsWith('bg-') ? (
        <img src={thumbnail} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 h-full w-full bg-paper-2" />
      )}

      <div className="absolute inset-0 bg-ink/20 transition-colors group-hover:bg-ink/40" />

      {youtubeId ? (
        <button
          onClick={() => setIsPlaying(true)}
          aria-label={`${t('gallery.play')}: ${title}`}
          className="relative z-10 flex h-16 w-16 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-deep"
        >
          <Play fill="currentColor" size={26} className="ml-0.5" />
        </button>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('gallery.externalLink')}: ${title}`}
          className="relative z-10 flex h-16 w-16 items-center justify-center bg-brand text-white transition-colors hover:bg-brand-deep"
        >
          <LinkIcon size={26} />
        </a>
      )}

      {!youtubeId && (
        <div className="absolute bottom-0 left-0 bg-ink/85 px-3 py-1.5 text-small text-paper">
          {t('gallery.externalLink')}
        </div>
      )}
    </div>
  );
};
