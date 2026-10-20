// Primitives del sistema: botons rectangulars i plans (un sol radi a tot el
// lloc: cap), superfícies que es distingeixen per un esglaó de to, no per
// ombra ni per vora.
export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyle = "tap px-5 py-2.5 font-semibold transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-deep",
    secondary: "bg-ink text-paper hover:bg-ink-soft",
    outline: "bg-paper-2 text-ink hover:bg-ink hover:text-paper",
    danger: "bg-brand-deep/15 text-brand-deep hover:bg-brand-deep hover:text-white",
    ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-paper-2",
    gold: "bg-ink text-sun hover:bg-ink-soft"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

export const Card = ({ children, className = '', ...props }) => <div className={`bg-paper-2 overflow-hidden ${className}`} {...props}>{children}</div>;

export const Badge = ({ children, color = 'bg-paper-2 text-ink' }) => <span className={`inline-block px-2.5 py-1 text-small font-semibold ${color}`}>{children}</span>;
