import { Link } from 'react-router-dom';

const cx = (...c) => c.filter(Boolean).join(' ');
export { cx };

const VARIANTS = {
  default: 'btn-sheen bg-gradient-to-r from-primary to-gold-soft text-primary-foreground shadow-[0_8px_24px_-10px_rgb(var(--gold-rgb)/0.6)] hover:shadow-[0_12px_32px_-8px_rgb(var(--gold-rgb)/0.75)] hover:-translate-y-0.5',
  outline: 'border border-primary/60 text-foreground hover:border-primary hover:bg-primary/10 hover:-translate-y-0.5',
  ghost: 'text-foreground hover:bg-accent',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-accent hover:-translate-y-0.5',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};
const SIZES = {
  default: 'h-11 px-6 text-[11px] tracking-[0.22em]',
  sm: 'h-9 px-4 text-[10px] tracking-[0.2em]',
  lg: 'h-12 px-8 text-xs tracking-[0.24em]',
  icon: 'h-9 w-9',
};

export function Button({ variant = 'default', size = 'default', className, to, href, children, ...props }) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-md uppercase font-normal transition-all duration-300 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
    VARIANTS[variant], SIZES[size], className,
  );
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  if (href) return <a href={href} className={cls} {...props}>{children}</a>;
  return <button className={cls} {...props}>{children}</button>;
}

/** Uppercase serif display heading split across lines, e.g. ["THREE STEPS.", "ONE PERFECT VIEW."] */
// h1 lines rise in one by one on load; h2 headings reveal as they scroll into view.
// The last line of a multi-line heading gets the animated gold shimmer.
export function Display({ lines, as: Tag = 'h2', className, delay = 0 }) {
  const isHero = Tag === 'h1';
  return (
    <Tag className={cx('display-xl', className)} {...(isHero ? {} : { 'data-reveal': '' })}>
      {lines.map((l, i) => {
        const accent = i > 0 && i === lines.length - 1 && lines.length > 1;
        const text = <span className={cx('block', accent && 'text-shimmer')}>{l}</span>;
        return isHero
          ? <span key={i} className="line-mask"><span className="line-in" style={{ '--d': `${delay + i * 130}ms` }}>{text}</span></span>
          : <span key={i} className="block">{text}</span>;
      })}
    </Tag>
  );
}

export function PageHeader({ eyebrow, lines, children }) {
  return (
    <header className="relative overflow-hidden border-b border-border/70">
      <div className="animate-glow pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgb(var(--gold-rgb)/0.14),transparent_70%)]" />
      <div className="container-x relative py-14 sm:py-20">
        {eyebrow && <p className="eyebrow animate-fade-up mb-5">{eyebrow}</p>}
        <Display as="h1" lines={lines} delay={80} className="text-[2.6rem] sm:text-7xl" />
        {children && <div className="animate-fade-up mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base" style={{ '--d': `${200 + lines.length * 130}ms` }}>{children}</div>}
      </div>
    </header>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
      <span className="h-4 w-4 animate-spin rounded-full border border-primary border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorNote({ error, className }) {
  if (!error) return null;
  return <p className={cx('animate-fade-up rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive', className)}>{error.message || String(error)}</p>;
}

export function Empty({ title, children, action }) {
  return (
    <div className="animate-fade-up rounded-md border border-dashed border-border px-6 py-16 text-center">
      <p className="font-serif text-2xl">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Field({ label, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
