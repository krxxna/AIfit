export function Button({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-ink text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
    accent: 'bg-mint text-slate-950 hover:bg-teal-300',
    ghost: 'bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800',
    danger: 'bg-coral text-white hover:bg-rose-500'
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
