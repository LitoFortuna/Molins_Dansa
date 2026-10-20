import { useState } from 'react';

// Fotograma d'un vídeo de YouTube. Demana la resolució alta (1280×720) i, si
// el vídeo no en té, cau a la normal (480×360). Cal passar `key={id}` des del
// pare perquè l'estat es reiniciï si canvia el vídeo.
export function YouTubeFrame({ id, className = '', alt = '', priority = false }) {
  const [quality, setQuality] = useState('maxresdefault');

  const fallback = () => {
    if (quality !== 'hqdefault') setQuality('hqdefault');
  };

  return (
    <img
      src={`https://img.youtube.com/vi/${id}/${quality}.jpg`}
      alt={alt}
      width="1280"
      height="720"
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onError={fallback}
      onLoad={(e) => {
        // YouTube serveix una imatge de 120px quan no existeix la versió HD.
        if (e.currentTarget.naturalWidth <= 120) fallback();
      }}
    />
  );
}
