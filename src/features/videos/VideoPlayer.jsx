import { useState } from 'react';
import { Play, Link as LinkIcon, X } from 'lucide-react';
import { getYouTubeId } from '../../lib/videoUrl';

export const VideoPlayer = ({ url, thumbnail, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeId = getYouTubeId(url);

  if (isPlaying && youtubeId) {
    return (
      <div className="relative aspect-video bg-black">
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
          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video ${!thumbnail && !youtubeId ? "bg-gray-200" : ""} flex items-center justify-center overflow-hidden bg-gray-200 group`}>
      {/* BACKGROUND THUMBNAIL */}
      {youtubeId ? (
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : thumbnail && !thumbnail.startsWith('bg-') ? (
        <img src={thumbnail} alt={title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className={`absolute inset-0 w-full h-full ${thumbnail || 'bg-gray-200'}`} />
      )}

      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

      {youtubeId ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm z-10 text-rose-600"
        >
          <Play fill="currentColor" size={28} className="ml-1" />
        </button>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm z-10 text-rose-600"
        >
          <LinkIcon size={28} />
        </a>
      )}

      {!youtubeId && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-1 rounded">
          Obrir enllaç extern
        </div>
      )}
    </div>
  );
};
