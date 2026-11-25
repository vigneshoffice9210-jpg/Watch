import { Link } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCartDetails } from '../lib/useCart';
import { useTitle } from '../lib/hooks';
import { formatPrice } from '../lib/format';
import { Button, Empty, ErrorNote, PageHeader, Spinner } from '../components/ui';

export function Summary({ quote, children }) {
  if (!quote) return null;
  const toFree = quote.freeShippingAbove - quote.subtotal;
  return (
    <div className="border border-border bg-card p-6">
      <p className="eyebrow mb-5">Summary</p>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(quote.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{quote.shipping ? formatPrice(quote.shipping) : 'Free'}</dd></div>
        {quote.giftWrap > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Gift wrap</dt><dd>{formatPrice(quote.giftWrap)}</dd></div>}
        <div className="flex justify-between border-t border-border pt-3 text-base"><dt>Total</dt><dd className="font-medium">{formatPrice(quote.total)}</dd></div>
      </dl>
      {quote.shipping > 0 && toFree > 0 && <p className="mt-4 text-xs text-primary">Add {formatPrice(toFree)} more for free shipping.</p>}
      {children}
    </div>
  );
}

export default function Cart() {
  useTitle('Your Selection');
  const { setQty, removeFromCart } = useStore();
  const { loading, lines, quote, error } = useCartDetails();
  const problems = quote?.problems || [];

  return (
    <>
      <PageHeader eyebrow="Your Selection" lines={['YOUR', 'SELECTION.']}>Review your selected Basha Gadgets timepieces.</PageHeader>
      <div className="container-x py-10">
        {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : !lines.length ? (
          <Empty title="Your selection is empty" action={<Button to="/collection">Explore collection</Button>}>
            Discover a timepiece you love, or try one on first.
          </Empty>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <ul className="divide-y divide-border border-y border-border">
              {lines.map(({ product: p, qty }, i) => {
                const issue = problems.find((x) => x.productId === p.id);
                const max = p.stockStatus === 'preorder' ? 10 : Math.min(10, p.stock);
                return (
                  <li key={p.id} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="flex gap-4 py-5 sm:gap-6">
                    <Link to={`/product/${p.slug}`} className="w-24 shrink-0 bg-ivory sm:w-32"><img src={p.image} alt="" className="aspect-square w-full object-contain p-2" /></Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.22em] text-primary">{p.brand}</p>
                          <Link to={`/product/${p.slug}`} className="font-serif text-lg leading-tight hover:text-primary">{p.name}</Link>
                        </div>
                        <button onClick={() => removeFromCart(p.id)} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground" aria-label={`Remove ${p.name}`}><X className="mx-auto h-4 w-4" /></button>
                      </div>
                      {issue && <p className="mt-1 text-xs text-destructive">{issue.message}</p>}
                      <div className="mt-auto flex items-end justify-between pt-3">
                        <div className="flex h-9 items-center border border-border">
                          <button className="flex h-full w-9 items-center justify-center hover:text-primary" onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-7 text-center text-sm">{qty}</span>
                          <button className="flex h-full w-9 items-center justify-center hover:text-primary disabled:opacity-30" disabled={qty >= max} onClick={() => setQty(p.id, qty + 1)} aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <p className="text-sm">{formatPrice(p.price * qty)}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-4">
              <Summary quote={quote}>
                <Button to={problems.length ? undefined : '/checkout'} disabled={!!problems.length} className="mt-6 w-full">Proceed to checkout</Button>
                <Link to="/collection" className="mt-4 block text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">Continue exploring</Link>
              </Summary>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
