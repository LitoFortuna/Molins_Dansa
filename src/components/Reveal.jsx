import { useEffect, useRef, useState } from 'react';

// Entrada d'una part d'una secció: puja uns 24px i apareix, un sol cop, quan
// entra al viewport. `index` escalona les parts d'una mateixa secció (80ms).
// Les regles CSS només s'apliquen amb IntersectionObserver i sense moviment
// reduït (veure index.css); altrament el contingut és visible des del principi.
export function Reveal({ as = 'div', index = 0, className = '', children, ...rest }) {
  const Tag = as;
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? 'is-in' : ''} ${className}`}
      style={{ '--i': index }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
