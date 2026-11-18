import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, Sparkles, Star, Truck, ShieldCheck, RotateCcw, MessageCircle } from 'lucide-react';
import { useApi, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { canBuy, discountPercent, formatDate, formatPrice, stockLabel, TYPE_LABELS } from '../lib/format';
import { Button, ErrorNote, Spinner, cx, Empty } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';
import { BRAND } from '../config';

export default function Product({ vault }) {
  const { slug } = useParams();
  const { data, loading, error, reload } = useApi(`/products/${slug}`);
  const p = data?.product;
  useTitle(p ? `${p.brand} ${p.name}` : 'Timepiece');

  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-20"><Empty title="Timepiece not found">{error.message}</Empty></div>;
  return <ProductView key={p.id} p={p} related={data.related} reviews={data.reviews} vault={vault} onReviewed={reload} />;
}

function ProductView({ p, related, reviews, vault, onReviewed }) {
  const nav = useNavigate();
  const { addToCart, isFavorite, toggleFavorite } = useStore();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(p.images?.[0] || p.image);
  const off = discountPercent(p.price, p.mrp);
  const buyable = canBuy(p);
  const maxQty = p.stockStatus === 'preorder' ? 10 : Math.max(1, Math.min(10, p.stock));
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const fav = isFavorite(p.id);

  return (
    <>
      <div className="container-x py-8">
        <nav className="mb-8 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link> / <Link to={vault ? '/vault' : '/collection'} className="hover:text-primary">{vault ? 'The Vault' : 'Collection'}</Link> / <span className="text-foreground">{p.name}</span>
        </nav>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div data-reveal="left">
            <div className="relative border border-border bg-ivory">
              {off && <span className="absolute left-3 top-3 z-10 bg-primary px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground">−{off}%</span>}
              <img src={img} alt={`${p.brand} ${p.name}`} className="aspect-square w-full object-contain p-8" />
            </div>
            {p.images?.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {p.images.map((src) => (
                  <button key={src} onClick={() => setImg(src)} className={cx('border bg-ivory', src === img ? 'border-primary' : 'border-border')}>
                    <img src={src} alt="" className="aspect-square w-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div data-reveal="right" style={{ '--d': '120ms' }}>
            {(vault || p.isVault) && <p className="eyebrow mb-2">From The Vault</p>}
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary">{p.brand}</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{p.name}</h1>
            {reviews.length > 0 && (
              <a href="#reviews" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Stars value={avg} /> {avg.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? 's' : ''}
              </a>
            )}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-normal">{formatPrice(p.price)}</span>
              {off && <span className="text-sm text-muted-foreground line-through">{formatPrice(p.mrp)}</span>}
              {off && <span className="text-xs uppercase tracking-[0.14em] text-primary">Save {formatPrice(p.mrp - p.price)}</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
            <p className={cx('mt-5 inline-block border px-3 py-1 text-[10px] uppercase tracking-[0.2em]', p.stockStatus === 'out_of_stock' ? 'border-destructive/50 text-destructive' : 'border-primary/40 text-primary')}>
              {stockLabel(p)}{p.stockStatus === 'low_stock' && ` — only ${p.stock} left`}
            </p>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{p.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex h-11 items-center border border-border">
                <button className="flex h-full w-11 items-center justify-center hover:text-primary disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button className="flex h-full w-11 items-center justify-center hover:text-primary disabled:opacity-30" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
              </div>
              <Button className="flex-1" disabled={!buyable} onClick={() => addToCart(p.id, qty)}>
                {p.stockStatus === 'preorder' ? 'Pre-order' : buyable ? 'Add to selection' : 'Out of stock'}
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => toggleFavorite(p.id)} aria-label={fav ? 'Remove from saved' : 'Save'}>
                <Heart className={cx(fav && 'fill-primary text-primary')} />
              </Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Button variant="outline" disabled={!buyable} onClick={() => { addToCart(p.id, qty, { silent: true }); nav('/checkout'); }}>Buy now</Button>
              {p.tryOnImage && <Button variant="secondary" to={`/try-on?watch=${p.slug}`}><Sparkles /> Try it on your wrist</Button>}
            </div>

            <ul className="mt-8 grid gap-3 border-y border-border py-6 text-sm text-muted-foreground sm:grid-cols-3">
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Free shipping over {formatPrice(BRAND.freeShippingAbove)}</li>
              <li className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-primary" /> Easy damage returns</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Cash on delivery</li>
            </ul>

            <dl className="mt-6 divide-y divide-border/70 text-sm">
              <Row k="Type" v={TYPE_LABELS[p.type]} />
              <Row k="For" v={p.gender === 'unisex' ? 'Everyone' : p.gender === 'men' ? 'Men' : 'Women'} />
              {Object.entries(p.specs || {}).map(([k, v]) => <Row key={k} k={k} v={v} />)}
            </dl>

            <a href={`https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(`Hi, I'd like to know more about the ${p.brand} ${p.name}.`)}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary hover:underline">
              <MessageCircle className="h-4 w-4" /> Ask about this watch on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Reviews productId={p.id} reviews={reviews} onReviewed={onReviewed} />

      {related.length > 0 && (
        <section className="container-x py-16">
          <p className="eyebrow mb-4" data-reveal="fade">You may also like</p>
          <h2 className="display-xl mb-10 text-4xl">PAIRS WELL WITH TASTE.</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}

const Row = ({ k, v }) => (
  <div className="flex justify-between gap-6 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>
);

function Stars({ value, onPick, size = 'h-3.5 w-3.5' }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onPick} onClick={() => onPick?.(n)} className={onPick ? 'cursor-pointer' : 'cursor-default'} aria-label={`${n} star`}>
          <Star className={cx(size, n <= Math.round(value) ? 'fill-primary text-primary' : 'text-muted-foreground')} />
        </button>
      ))}
    </span>
  );
}

function Reviews({ productId, reviews, onReviewed }) {
  const { user, toast } = useStore();
  const [form, setForm] = useState({ rating: 5, comment: '', authorName: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api(`/products/${productId}/reviews`, { method: 'POST', body: form });
      setForm({ rating: 5, comment: '', authorName: '' });
      toast('Thank you for your review');
      onReviewed();
    } catch (e2) { setErr(e2); } finally { setBusy(false); }
  };

  return (
    <section id="reviews" className="border-t border-border/60 bg-deep">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow mb-4">Reviews</p>
          <h2 className="display-xl text-4xl">IN THEIR WORDS.</h2>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Stars value={form.rating} onPick={(n) => setForm({ ...form, rating: n })} size="h-5 w-5" />
            {!user && <input className="field" placeholder="Your name" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />}
            <textarea className="field min-h-24" placeholder="Share your experience…" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required />
            <ErrorNote error={err} />
            <Button disabled={busy}>{busy ? 'Posting…' : 'Post review'}</Button>
          </form>
        </div>
        <div className="space-y-px">
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first.</p>}
          {reviews.map((r) => (
            <article key={r.id} className="border-b border-border/70 py-5">
              <div className="flex items-center justify-between">
                <p className="font-serif text-lg">{r.authorName}</p>
                <Stars value={r.rating} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">{formatDate(r.createdAt)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
