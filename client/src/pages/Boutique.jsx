import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Sparkles, ShoppingBag } from 'lucide-react';
import { useProducts, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { canBuy, formatPrice, stockLabel } from '../lib/format';
import { Button, Spinner } from '../components/ui';

/** A 3D carousel of glass showcases built with CSS transforms. Drag, swipe or use the arrows to walk the boutique. */
export default function Boutique() {
  useTitle('Virtual Boutique');
  const { products, loading } = useProducts({ limit: 12 });
  const { addToCart } = useStore();
  const [angle, setAngle] = useState(0);
  const [open, setOpen] = useState(null);
  const drag = useRef(null);
  const moved = useRef(false);
  const n = Math.max(products.length, 1);
  const step = 360 / n;
  const radius = Math.round(150 / Math.tan(Math.PI / n)) + 60;
  const current = ((Math.round(-angle / step) % n) + n) % n;

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowLeft') setAngle((a) => a + step);
      if (e.key === 'ArrowRight') setAngle((a) => a - step);
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [step]);

  const snap = () => setAngle((a) => Math.round(a / step) * step);

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,rgb(var(--gold-rgb)/0.16),transparent_60%)]">
      <div className="container-x pt-14 text-center">
        <p className="eyebrow mb-4">Basha Gadgets Virtual Boutique</p>
        <h1 className="display-xl text-5xl sm:text-7xl">STEP INSIDE.<span className="block text-primary">EXPLORE TIME.</span></h1>
        <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground">Walk the boutique, approach the glass showcases, inspect every timepiece and try it on your wrist.</p>
      </div>

      {loading ? <Spinner label="Opening the boutique…" /> : (
        <div
          className="relative mx-auto mt-6 h-[520px] touch-pan-y select-none [perspective:1400px]"
          onPointerDown={(e) => { drag.current = { x: e.clientX, a: angle }; moved.current = false; }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            if (Math.abs(e.clientX - drag.current.x) > 6) moved.current = true;
            setAngle(drag.current.a + (e.clientX - drag.current.x) * 0.25);
          }}
          onPointerUp={() => { drag.current = null; snap(); }}
          onPointerLeave={() => { if (drag.current) { drag.current = null; snap(); } }}
        >
          {/* floor */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gold/10 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d] transition-transform duration-500 ease-out"
            style={{ transform: `translateZ(-${radius}px) rotateY(${angle}deg)` }}>
            {products.map((p, i) => (
              <button
                key={p.id}
                onClick={() => { if (!moved.current) setOpen(p); }}
                className="absolute -left-[130px] -top-[200px] w-[260px] [backface-visibility:hidden]"
                style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)` }}
                aria-label={`Inspect ${p.name}`}
              >
                <div className="border border-gold/40 bg-gradient-to-b from-white/10 to-white/[0.02] p-4 shadow-[0_0_60px_rgb(var(--gold-rgb)/0.08)] backdrop-blur-[1px]">
                  <div className="relative bg-ivory/95 p-3">
                    <img src={p.image} alt="" className="aspect-square w-full object-contain" draggable={false} />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                  </div>
                  <p className="mt-3 text-[9px] uppercase tracking-[0.24em] text-primary">{p.brand}</p>
                  <p className="font-serif text-lg leading-tight">{p.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatPrice(p.price)}</p>
                </div>
                <div className="mx-auto h-24 w-3/4 bg-gradient-to-b from-deep to-transparent" />
              </button>
            ))}
          </div>
          <button onClick={() => setAngle((a) => a + step)} className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-background/70 hover:text-primary" aria-label="Previous showcase"><ChevronLeft /></button>
          <button onClick={() => setAngle((a) => a - step)} className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-background/70 hover:text-primary" aria-label="Next showcase"><ChevronRight /></button>
        </div>
      )}

      <div className="container-x flex flex-col items-center gap-3 pb-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Drag, swipe or use ← → to walk · tap a showcase to inspect</p>
        {products[current] && <p className="font-serif text-xl text-primary">Showcase {current + 1} of {products.length}</p>}
        <Link to="/collection" className="text-[11px] uppercase tracking-[0.22em] text-primary hover:underline">Prefer the 2D catalogue?</Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(null)}>
          <div className="animate-fade-up grid w-full max-w-3xl border border-gold/40 bg-card md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <div className="bg-ivory p-6"><img src={open.image} alt="" className="aspect-square w-full object-contain" /></div>
            <div className="relative p-6 sm:p-8">
              <button onClick={() => setOpen(null)} className="absolute right-3 top-3 h-9 w-9 hover:text-primary" aria-label="Close"><X className="mx-auto h-5 w-5" /></button>
              <p className="text-[10px] uppercase tracking-[0.24em] text-primary">{open.brand}</p>
              <h2 className="mt-2 font-serif text-3xl leading-tight">{open.name}</h2>
              <p className="mt-3 text-lg">{formatPrice(open.price)} {open.mrp > open.price && <span className="text-sm text-muted-foreground line-through">{formatPrice(open.mrp)}</span>}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-primary">{stockLabel(open)}</p>
              <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">{open.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button size="sm" disabled={!canBuy(open)} onClick={() => addToCart(open.id)}><ShoppingBag /> Add</Button>
                <Button size="sm" variant="outline" to={`/try-on?watch=${open.slug}`}><Sparkles /> Try on</Button>
                <Button size="sm" variant="ghost" to={`/product/${open.slug}`}>Details</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
