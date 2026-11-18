import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { canBuy, discountPercent, formatPrice, stockLabel } from '../lib/format';
import { Button, cx } from './ui';
import { stagger } from '../lib/motion';

export default function ProductCard({ product: p, onTry, selected, compact = false, index = 0 }) {
  const { isFavorite, toggleFavorite, addToCart } = useStore();
  const fav = isFavorite(p.id);
  const off = discountPercent(p.price, p.mrp);
  const buyable = canBuy(p);
  const href = `/product/${p.slug}`;

  return (
    <div data-reveal style={stagger(index % 8)}>
    <article className={cx('lift group relative h-full overflow-hidden rounded-md border bg-card', selected ? 'border-primary shadow-[0_0_0_1px_var(--gold),0_20px_40px_-20px_rgb(var(--gold-rgb)/0.5)]' : 'border-border hover:border-primary/50')}>
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 rounded-full bg-background/75 backdrop-blur hover:scale-110" onClick={() => toggleFavorite(p.id)} aria-label={fav ? `Remove ${p.name} from favorites` : `Save ${p.name}`}>
        <Heart key={String(fav)} className={cx(fav && 'animate-pop fill-primary text-primary')} />
      </Button>
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {off && <span className="bg-primary px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-primary-foreground">−{off}%</span>}
        {p.stockStatus !== 'in_stock' && <span className="bg-background/85 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]">{stockLabel(p)}</span>}
      </div>
      <Link to={href} className="relative block overflow-hidden bg-ivory">
        {p.image
          ? <img src={p.image} alt={`${p.brand} ${p.name}`} className={cx('aspect-square w-full object-contain p-4 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-rotate-3 group-hover:scale-[1.07]', compact && 'aspect-[4/3]')} loading="lazy" />
          : <div className="aspect-square w-full" />}
        {/* light sweep on hover */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </Link>
      <div className="p-4 sm:p-5">
        <p className="text-[9px] uppercase tracking-[0.22em] text-primary">{p.brand}</p>
        <Link to={href} className="mt-1 block font-serif text-lg leading-tight text-foreground hover:text-primary">{p.name}</Link>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium">{formatPrice(p.price)}</p>
            {off && p.mrp != null && <p className="text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</p>}
          </div>
          {onTry
            ? (p.tryOnImage
              ? <Button size="sm" onClick={() => onTry(p)}>Try on</Button>
              : <span className="text-right text-[10px] leading-4 text-muted-foreground">Try-on unavailable</span>)
            : <Button size="icon" variant="outline" disabled={!buyable} onClick={() => addToCart(p.id)} aria-label={buyable ? `Add ${p.name} to cart` : 'Out of stock'}><ShoppingBag /></Button>}
        </div>
      </div>
    </article>
    </div>
  );
}

export function ProductGrid({ products, loading, error, onTry, selectedId, empty, cols = 'sm:grid-cols-2 lg:grid-cols-4' }) {
  if (loading) {
    return (
      <div className={cx('grid grid-cols-2 gap-3 sm:gap-5', cols)}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-md border border-border" />)}
      </div>
    );
  }
  if (error) return <p className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error.message}</p>;
  if (!products.length) return empty || <p className="py-12 text-center text-sm text-muted-foreground">No watches match these filters.</p>;
  return (
    <div className={cx('grid grid-cols-2 gap-3 sm:gap-5', cols)}>
      {products.map((p, i) => <ProductCard key={p.id} index={i} product={p} onTry={onTry} selected={selectedId === p.id} />)}
    </div>
  );
}
