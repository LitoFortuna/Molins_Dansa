import { useEffect, useRef } from 'react';
import { MillWheel } from './MillWheel';

// MOLINS com a monument: la paraula ocupa l'amplada i la O és la roda del
// molí. Amb el desplaçament, la roda gira i la paraula es redueix un 6% (el
// monument "pesa"). Tot via variables CSS i transform; sense moviment reduït
// no s'escriu res i el nom queda quiet.
export function Monument({ label, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const progress = Math.min(1, Math.max(0, y / window.innerHeight));
      el.style.setProperty('--p', progress.toFixed(3));
      el.style.setProperty('--turn', (y * 0.35).toFixed(1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <h1
      ref={ref}
      aria-label={label}
      className={`display monument ${className}`}
      style={{
        transform: 'scale(calc(1 - var(--p, 0) * 0.06))',
        transformOrigin: '0 100%',
      }}
    >
      <span aria-hidden="true">M</span>
      <MillWheel className="monument-wheel wheel-scroll" />
      <span aria-hidden="true">L</span>
      <span className="monument-br" aria-hidden="true" />
      <span aria-hidden="true">INS</span>
    </h1>
  );
}
