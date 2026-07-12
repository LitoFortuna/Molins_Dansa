export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }) => {
  const baseStyle = "px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-rose-600 text-white hover:bg-rose-700 shadow-lg hover:shadow-rose-500/30",
    secondary: "bg-white text-rose-600 border-2 border-rose-600 hover:bg-rose-50",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-100 text-red-600 hover:bg-red-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    gold: "bg-amber-400 text-amber-900 hover:bg-amber-500 shadow-lg shadow-amber-200"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

export const Card = ({ children, className = '', ...props }) => <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`} {...props}>{children}</div>;

export const Badge = ({ children, color = 'bg-gray-100 text-gray-800' }) => <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${color}`}>{children}</span>;
