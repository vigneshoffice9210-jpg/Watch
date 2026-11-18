import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useProducts, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { canBuy, formatPrice } from '../lib/format';
import { Button, Empty, PageHeader, Spinner } from '../components/ui';

const BUDGETS = [['any', 'Any budget', Infinity], ['3000', 'Under ₹3,000 for two', 3000], ['6000', 'Under ₹6,000 for two', 6000], ['10000', 'Under ₹10,000 for two', 10000]];

export default function Couples() {
  useTitle('Couples Edit');
  const { products, loading } = useProducts({});
  const { addToCart, toast } = useStore();
  const [budget, setBudget] = useState('any');

  const pairs = useMemo(() => {
    const cap = BUDGETS.find((b) => b[0] === budget)[2];
    const avail = products.filter((p) => canBuy(p));
    const his = avail.filter((p) => p.gender !== 'women');
    const hers = avail.filter((p) => p.gender !== 'men');
    const out = [];
    for (const a of his) {
      for (const b of hers) {
        if (a.id === b.id || a.price + b.price > cap) continue;
        // Shared tags and same type make a better pair
        const shared = (a.tags || []).filter((t) => b.tags?.includes(t)).length + (a.type === b.type ? 2 : 0) + (a.brand === b.brand ? 1 : 0);
        out.push({ a, b, score: shared });
      }
    }
    const seen = new Set();
    return out.sort((x, y) => y.score - x.score).filter(({ a, b }) => {
      if (seen.has(a.id) || seen.has(b.id)) return false;
      seen.add(a.id); seen.add(b.id);
      return true;
    }).slice(0, 6);
  }, [products, budget]);

  return (
    <>
      <PageHeader eyebrow="Couples Edit" lines={['TIME,', 'SHARED.']}>Pairs chosen to complement each other — perfect for anniversaries, weddings and every day in between.</PageHeader>
      <div className="container-x py-10">
        <div className="mb-8 flex flex-wrap gap-2">{BUDGETS.map(([k, l]) => <button key={k} className="chip" data-active={budget === k} onClick={() => setBudget(k)}>{l}</button>)}</div>
        {loading ? <Spinner /> : !pairs.length ? <Empty title="No pairs in this budget">Try a higher budget.</Empty> : (
          <div className="grid gap-6 lg:grid-cols-2">
            {pairs.map(({ a, b }, i) => (
              <article key={`${a.id}-${b.id}`} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="rounded-md border border-border bg-card p-5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  {[a, b].map((p, i) => (
                    <Link key={p.id} to={`/product/${p.slug}`} className={i === 1 ? 'order-3' : ''}>
                      <div className="bg-ivory p-3"><img src={p.image} alt="" className="aspect-square w-full object-contain" /></div>
                      <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-primary">{p.brand}</p>
                      <p className="font-serif leading-tight">{p.name}</p>
                    </Link>
                  ))}
                  <Heart className="order-2 h-5 w-5 text-primary" strokeWidth={1.3} />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <p>{formatPrice(a.price + b.price)} <span className="text-xs text-muted-foreground">for both</span></p>
                  <Button size="sm" onClick={() => { addToCart(a.id, 1, { silent: true }); addToCart(b.id, 1, { silent: true }); toast('Pair added to your selection'); }}>Add pair</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
