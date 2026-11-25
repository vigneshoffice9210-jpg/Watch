import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Sparkles, Watch, Truck, ShieldCheck, Gift, RotateCcw } from 'lucide-react';
import { Button, Display } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';
import { BrandMark } from '../components/Brand';
import { useProducts, useTitle } from '../lib/hooks';
import { stagger } from '../lib/motion';
import { BRAND } from '../config';

const STEPS = [
  { n: '01', title: 'Upload your wrist', text: 'Take a clear photo or choose one from your library.', icon: Camera },
  { n: '02', title: 'Choose your timepiece', text: 'Explore the collection and select the watch that speaks to you.', icon: Watch },
  { n: '03', title: 'See it on you', text: 'Our AI creates a personalized, photorealistic preview.', icon: Sparkles },
];

const PROMISES = [
  [Truck, 'Free shipping over ₹999'], [ShieldCheck, 'Cash on delivery'], [Sparkles, 'AI virtual try-on'],
  [Gift, 'Signature gift wrap'], [RotateCcw, 'Easy damage returns'], [Watch, 'Curated timepieces'],
];

function SectionHead({ eyebrow, lines, to, linkLabel = 'View all' }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-4" data-reveal="fade">{eyebrow}</p>
        <Display lines={lines} className="text-4xl sm:text-5xl" />
      </div>
      {to && (
        <Link to={to} className="group flex shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary">
          {linkLabel} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  useTitle(null);
  const featured = useProducts({ featured: 1, limit: 4 });
  const fresh = useProducts({ isNew: 1, limit: 4, sort: 'newest' });

  return (
    <>
      {/* Hero — comic title card built around the logo */}
      <section className="relative isolate overflow-hidden border-b border-primary/30">
        <div className="animate-energy absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_38%,rgb(var(--gold-rgb)/0.38),transparent_58%),radial-gradient(ellipse_at_50%_110%,rgb(var(--gold-rgb)/0.2),transparent_55%)]" />
        <div className="speed-lines animate-slow-spin absolute left-1/2 top-[38%] -z-10 aspect-square w-[180vmax] -translate-x-1/2 -translate-y-1/2" />
        <div className="halftone absolute -left-10 -top-10 -z-10 h-[60%] w-[55%]" />
        <div className="halftone absolute -bottom-10 -right-10 -z-10 h-[55%] w-[50%] rotate-180" />
        {/* diagonal energy slashes */}
        <div className="absolute -left-1/4 top-[22%] -z-10 h-px w-[150%] -rotate-[8deg] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <div className="absolute -left-1/4 top-[78%] -z-10 h-px w-[150%] -rotate-[8deg] bg-gradient-to-r from-transparent via-silver/40 to-transparent" />

        <div className="container-x relative flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center py-14 text-center">
          <img src="/watches/valmont-racing-chrono.svg" alt="" className="animate-float pointer-events-none absolute left-[-4%] top-[18%] hidden w-56 opacity-90 drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)] lg:block xl:w-64" />
          <img src="/watches/maison-orlo-noir-chronograph.svg" alt="" className="animate-float pointer-events-none absolute bottom-[10%] right-[-3%] hidden w-52 opacity-90 drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)] [animation-delay:-3s] lg:block xl:w-60" />

          <h1 className="sr-only">Basha Gadgets — Premium Watches</h1>
          <div className="animate-fade-up w-full max-w-3xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" style={{ '--d': '100ms' }}>
            <BrandMark animated className="h-auto w-full" />
          </div>
          <p className="display-xl animate-fade-up mt-6 text-3xl sm:text-5xl" style={{ '--d': '450ms' }}>
            SUIT UP YOUR WRIST. <span className="text-shimmer">OWN EVERY SECOND.</span>
          </p>
          <p className="animate-fade-up mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base" style={{ '--d': '600ms' }}>
            Bold chronographs, sharp divers and everyday icons. Upload your wrist, pick your timepiece and see it on you before you buy.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap justify-center gap-3" style={{ '--d': '750ms' }}>
            <Button to="/collection" size="lg">Shop the collection <ArrowRight /></Button>
            <Button to="/try-on" size="lg" variant="outline"><Camera /> Try it on</Button>
          </div>
        </div>
      </section>

      {/* Promise marquee */}
      <div className="overflow-hidden border-b border-border/60 bg-deep py-4" aria-label="Store benefits">
        <div className="animate-marquee flex w-max gap-12 hover:[animation-play-state:paused]">
          {[...PROMISES, ...PROMISES].map(([Icon, label], i) => (
            <span key={i} className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              <Icon className="h-4 w-4 text-primary" strokeWidth={1.4} /> {label} <span className="ml-9 text-primary">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* Virtual boutique */}
      <section className="border-b border-border/60 bg-deep/60">
        <div className="container-x grid items-center gap-12 py-24 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-3 gap-3 [perspective:1000px]">
              {['kairos-meridian-classic', 'aeterna-heritage-gold', 'nordhavn-glacier-integrated'].map((s, i) => (
                <div key={s} data-reveal="scale" style={stagger(i, 150)}>
                  <div className="group rounded-md border border-gold/25 bg-gradient-to-b from-gold/10 to-transparent p-3 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:!transform-none hover:-translate-y-2" style={{ transform: `rotateY(${(i - 1) * -14}deg)` }}>
                    <div className="overflow-hidden rounded-sm bg-ivory/95 p-2">
                      <img src={`/watches/${s}.svg`} alt="" className="aspect-square w-full object-contain transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="mx-auto mt-3 h-1 w-2/3 rounded-full bg-gold/40 transition-all duration-500 group-hover:w-full group-hover:bg-gold" />
                  </div>
                </div>
              ))}
            </div>
            <div className="gold-line mt-8 opacity-50" data-reveal="fade" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground" data-reveal="fade">{BRAND.tagline}</p>
            <p className="eyebrow mt-3 mb-6" data-reveal="fade">Basha Gadgets Virtual Boutique</p>
            <Display lines={['STEP INSIDE.', 'GEAR UP.', 'ENTER THE ARMOURY.']} className="text-4xl sm:text-6xl" />
            <p data-reveal style={stagger(2, 100)} className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Your premium watch showroom, wherever you are. Walk the boutique, approach the glass showcases, inspect every timepiece and try it on your wrist — all from your phone or computer.
            </p>
            <div data-reveal style={stagger(3, 100)} className="mt-8 flex flex-wrap gap-3">
              <Button to="/virtual-boutique">Enter the 3D boutique</Button>
              <Button to="/collection" variant="outline">2D catalogue</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="container-x py-24">
        <p className="eyebrow mb-5" data-reveal="fade">Your origin story</p>
        <Display lines={['THREE STEPS.', 'ONE HERO LOOK.']} className="text-4xl sm:text-6xl" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ n, title, text, icon: Icon }, i) => (
            <div key={n} data-reveal style={stagger(i, 140)}>
              <div className="lift panel-cut group relative h-full overflow-hidden border border-border bg-card p-8 sm:p-10">
                <div className="halftone pointer-events-none absolute -right-6 -top-6 h-32 w-32 rotate-90 opacity-40 transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold to-gold-soft transition-transform duration-700 group-hover:scale-x-100" />
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl text-primary transition-transform duration-500 group-hover:scale-110">{n}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 transition-all duration-500 group-hover:rotate-12 group-hover:border-gold group-hover:bg-gold/10">
                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.4} />
                  </span>
                </div>
                <h3 className="mt-8 font-serif text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated */}
      <section className="container-x py-12">
        <SectionHead eyebrow="Featured timepieces" lines={['THE HERO LINEUP.']} to="/collection" />
        <ProductGrid {...featured} />
      </section>

      {/* New arrivals */}
      <section className="container-x py-12">
        <SectionHead eyebrow="Just in" lines={['NEW ARRIVALS.']} to="/collection?sort=newest" />
        <ProductGrid {...fresh} />
      </section>

      {/* CTA */}
      <section className="container-x pt-16">
        <div data-reveal="scale" className="panel-cut relative overflow-hidden border border-gold/40 bg-deep px-6 py-20 text-center sm:py-28">
          <div className="speed-lines absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 opacity-70" />
          <div className="animate-glow absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--gold-rgb)/0.16),transparent_65%)]" />
          <div className="absolute -left-20 -top-20 h-64 w-64 animate-slow-spin rounded-full border border-dashed border-gold/20" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 animate-slow-spin-rev rounded-full border border-gold/15" />
          <div className="relative">
            <p className="eyebrow mb-6">The new way to choose</p>
            <Display lines={["DON'T JUST IMAGINE HOW IT LOOKS."]} className="mx-auto max-w-4xl text-4xl sm:text-6xl" />
            <p className="mt-5 font-serif text-3xl font-extrabold italic uppercase text-shimmer">See it on your wrist.</p>
            <Button to="/try-on" size="lg" className="mt-9">Start your try-on <ArrowRight /></Button>
          </div>
        </div>
      </section>
    </>
  );
}
