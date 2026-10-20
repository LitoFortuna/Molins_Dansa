// La roda del molí: el nom del poble (Molins = molins d'aigua) fet lletra.
// Dibuixada en codi, en un sol llenguatge pla (anell, radis i cub). Hereda el
// color del text (currentColor); el cub agafa el color de marca.
const SPOKES = Array.from({ length: 12 }, (_, i) => i * 30);

export function MillWheel({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g className="wheel-idle">
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="12" />
        {SPOKES.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="12"
            x2="50"
            y2="38"
            stroke="currentColor"
            strokeWidth="5.5"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="13" fill="var(--color-brand)" />
        <circle cx="50" cy="50" r="4.5" fill="currentColor" />
      </g>
    </svg>
  );
}
