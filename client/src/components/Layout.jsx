import { useEffect, useRef, useState } from 'react';
import { stagger, useRevealObserver, useScrollProgress } from '../lib/motion';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Heart, Menu, ShoppingBag, User, X, MessageCircle, ArrowUpRight, LayoutDashboard } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BRAND, EXPERIENCES } from '../config';
import { cx } from './ui';
import { Emblem } from './Brand';

const NAV = [
  { to: '/collection', label: 'Collection' },
  { to: '/try-on', label: 'AI Try-On' },
  { to: '/discover', label: 'Discover' },
  { to: '/budget', label: 'By budget' },
];

export function Logo({ compact }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Basha Gadgets home">
      <Emblem className="h-10 w-10 drop-shadow-[0_0_10px_rgb(var(--gold-rgb)/0.55)] transition-transform duration-700 ease-out group-hover:rotate-[360deg] sm:h-11 sm:w-11" />
      <span className="leading-none">
        <span className="block font-serif text-[1.55rem] font-extrabold italic tracking-[0.02em] sm:text-[1.8rem]">
          <span className="text-chrome">BASHA</span><span className="text-hero-red">GADGETS</span>
        </span>
        {!compact && <span className="mt-0.5 block text-[8px] font-medium uppercase tracking-[0.42em] text-foreground/80 sm:text-[9px]">{BRAND.tagline}</span>}
      </span>
    </Link>
  );
}

function Header({ onMenu }) {
  const { cartCount, favorites, user } = useStore();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={cx('animate-slide-down sticky top-0 z-40 border-b transition-all duration-500', scrolled ? 'border-border/70 bg-background/85 shadow-[0_10px_30px_-15px_rgb(0_0_0/0.6)] backdrop-blur-md' : 'border-transparent bg-background/40 backdrop-blur-sm')}>
      <div className="container-x flex h-18 items-center justify-between gap-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => cx('nav-link text-[11px] uppercase tracking-[0.24em] transition-colors hover:text-primary', isActive ? 'active text-primary' : 'text-foreground/80')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link to="/saved" className="relative flex h-10 w-10 items-center justify-center hover:text-primary" aria-label={`${favorites.length} saved watches`}>
            <Heart className="h-[18px] w-[18px]" />
            {favorites.length > 0 && <Badge n={favorites.length} />}
          </Link>
          <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center hover:text-primary" aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && <Badge n={cartCount} />}
          </Link>
          <Link to={user ? '/account' : '/auth'} className="hidden h-10 w-10 items-center justify-center hover:text-primary sm:flex" aria-label={user ? 'Your account' : 'Sign in'}>
            <User className="h-[18px] w-[18px]" />
          </Link>
          <button onClick={onMenu} className="flex h-10 w-10 items-center justify-center hover:text-primary" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      <nav className="no-scrollbar flex gap-6 overflow-x-auto border-t border-border/50 px-5 py-2.5 lg:hidden">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => cx('shrink-0 text-[10px] uppercase tracking-[0.22em]', isActive ? 'text-primary' : 'text-foreground/75')}>{n.label}</NavLink>
        ))}
      </nav>
    </header>
  );
}

// key={n} re-mounts the badge so it pops every time the count changes
const Badge = ({ n }) => (
  <span key={n} className="animate-pop absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-primary-foreground">{n}</span>
);

function Drawer({ open, onClose }) {
  const { user, logout } = useStore();
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return (
    <div className={cx('fixed inset-0 z-50 transition', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
      <div className={cx('absolute inset-0 bg-black/70 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <aside className={cx('absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-gold/20 bg-deep/95 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]', open ? 'drawer-open translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-5">
          <Logo compact />
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center hover:text-primary" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="eyebrow mb-4">Mission control</p>
          <ul className="space-y-0.5">
            {EXPERIENCES.map((e, i) => (
              <li key={e.to} className="drawer-item" style={stagger(i, 40, 14)}>
                <NavLink to={e.to} onClick={onClose} className={({ isActive }) => cx('group flex items-center justify-between py-2.5 font-serif text-xl transition-all duration-300 hover:translate-x-1.5 hover:text-primary', isActive && 'text-primary')}>
                  {e.label}
                  <ArrowUpRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="gold-line my-6 opacity-40" />
          {user ? (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Signed in as <span className="text-foreground">{user.name}</span></p>
              <div className="flex flex-wrap gap-4">
                <Link to="/account" onClick={onClose} className="text-[11px] uppercase tracking-[0.2em] text-primary">Account</Link>
                {user.role === 'admin' && <Link to="/admin" onClick={onClose} className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-primary"><LayoutDashboard className="h-3.5 w-3.5" /> Admin</Link>}
                <button onClick={() => { logout(); onClose(); }} className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">Sign out</button>
              </div>
            </div>
          ) : (
            <Link to="/auth" onClick={onClose} className="text-[11px] uppercase tracking-[0.22em] text-primary">Sign in / Create account</Link>
          )}
        </div>
        <div className="border-t border-border/70 px-6 py-5 text-sm">
          <p className="eyebrow mb-3">Private assistance</p>
          <a href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
            <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp {BRAND.whatsappDisplay}
          </a>
        </div>
      </aside>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-gold/20 bg-deep">
      <div className="gold-line animate-draw opacity-50" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.2fr_2fr_1fr]">
        <div data-reveal>
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Premium watches with hero-grade style — picked for power, precision and presence, and seen on your own wrist before you buy.
          </p>
        </div>
        <div data-reveal style={stagger(1, 120)}>
          <p className="eyebrow mb-5">Experience</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-3">
            {EXPERIENCES.map((e) => (
              <li key={e.to}><Link to={e.to} className="text-foreground/75 transition-colors hover:text-primary">{e.label}</Link></li>
            ))}
          </ul>
        </div>
        <div data-reveal style={stagger(2, 120)}>
          <p className="eyebrow mb-5">Private assistance</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-foreground/75 hover:text-primary">
                <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp <span className="text-foreground">{BRAND.whatsappDisplay}</span>
              </a>
            </li>
            <li><Link to="/policies" className="text-foreground/75 hover:text-primary">Shipping, returns &amp; policies</Link></li>
            <li><Link to="/orders" className="text-foreground/75 hover:text-primary">Track an order</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container-x flex flex-col gap-2 py-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.shortName}. {BRAND.tagline}.</p>
          <p>Product imagery and warranties are subject to verification.</p>
        </div>
      </div>
    </footer>
  );
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className={cx('animate-toast glass rounded-md border px-4 py-3 text-sm shadow-2xl', t.tone === 'error' ? 'border-destructive/50 text-destructive' : 'border-primary/40')}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function Layout() {
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();
  const progress = useRef(null);
  useRevealObserver();
  useScrollProgress(progress);
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <div ref={progress} className="scroll-progress" aria-hidden />
      <Header onMenu={() => setMenu(true)} />
      {/* key on pathname replays the entrance animation on every route change */}
      <main key={pathname} className="page-enter flex-1"><Outlet /></main>
      <Footer />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <Toasts />
    </div>
  );
}
