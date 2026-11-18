import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useProducts, useTitle } from '../lib/hooks';
import { formatPrice, stockLabel } from '../lib/format';
import { Empty, Spinner } from '../components/ui';

export default function Vault() {
  useTitle('The Vault');
  const { products, loading } = useProducts({ vault: 1 });
  return (
    <section className="bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--gold-rgb)/0.18),transparent_55%)]">
      <div className="container-x py-20 text-center">
        <Lock className="mx-auto h-8 w-8 text-primary" strokeWidth={1} />
        <p className="eyebrow mt-6">The Vault</p>
        <h1 className="display-xl mt-4 text-5xl sm:text-7xl">RARE.<span className="block text-primary">KEPT FOR FEW.</span></h1>
        <p className="mx-auto mt-6 max-w-xl text-sm text-muted-foreground">Limited and hard-to-find pieces, released in very small numbers. When they're gone, they're gone.</p>
      </div>
      <div className="container-x pb-10">
        {loading ? <Spinner /> : !products.length ? <Empty title="The Vault is closed">New pieces arrive soon.</Empty> : (
          <div className="grid gap-8 md:grid-cols-2">
            {products.map((p, i) => (
              <Link key={p.id} to={`/vault/${p.slug}`} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="group grid overflow-hidden rounded-md border border-gold/30 bg-card transition-colors hover:border-gold/70 sm:grid-cols-2">
                <div className="bg-ivory p-6"><img src={p.image} alt="" className="aspect-square w-full object-contain transition-transform duration-700 group-hover:scale-105" /></div>
                <div className="flex flex-col justify-center p-6">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-primary">{p.brand}</p>
                  <h2 className="mt-2 font-serif text-2xl leading-tight">{p.name}</h2>
                  <p className="mt-3">{formatPrice(p.price)}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gold-soft">{stockLabel(p)}{p.stockStatus === 'low_stock' && ` · ${p.stock} remaining`}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
