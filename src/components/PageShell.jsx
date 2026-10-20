// Marc comú de les pàgines interiors: enllaç de tornada, títol en tipografia de
// visualització i el contingut en una columna de lectura. `narrow` limita
// l'amplada per a textos llargs (bases, privacitat).
export function PageShell({ title, onBack, backLabel, narrow = false, children }) {
  return (
    <div className={narrow ? 'max-w-3xl' : ''}>
      {onBack && (
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); onBack(); }}
          className="tap -ml-2 mb-6 inline-flex items-center px-2 text-small font-medium text-ink-soft hover:text-ink"
        >
          {backLabel}
        </a>
      )}
      <h1 className="display max-w-4xl text-head">{title}</h1>
      <div className="mt-10 md:mt-14">{children}</div>
    </div>
  );
}
