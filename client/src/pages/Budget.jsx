import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';
import Filters from '../components/Filters';
import { useProducts, useTitle } from '../lib/hooks';
import { BUDGETS, inBudget } from '../lib/format';

export default function Budget() {
  useTitle('Shop by budget');
  const [sp, setSp] = useSearchParams();
  const band = sp.get('band') || 'all';
  const filters = {
    brand: sp.get('brand') || '', type: sp.get('type') || '', gender: sp.get('gender') || '',
    availability: sp.get('availability') || '', sort: sp.get('sort') || 'price-asc',
  };
  // Fetch once for the filters, then split into price bands client-side so every chip shows a live count.
  const { products, loading, error } = useProducts(filters);
  const counts = useMemo(() => Object.fromEntries(BUDGETS.map((b) => [b.key, products.filter((p) => inBudget(p.price, b)).length])), [products]);
  const active = BUDGETS.find((b) => b.key === band) || BUDGETS[0];
  const visible = products.filter((p) => inBudget(p.price, active));

  const update = (next) => setSp(Object.fromEntries(Object.entries({ band, ...next }).filter(([, v]) => v && v !== 'all')), { replace: true });

  return (
    <>
      <PageHeader eyebrow="Shop by budget" lines={['ELEGANCE', 'AT EVERY PRICE.']}>
        Find a timepiece that fits your budget — filter by price range, brand, type and availability.
      </PageHeader>
      <div className="container-x py-10">
        <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1">
          {BUDGETS.map((b) => (
            <button key={b.key} className="chip" data-active={band === b.key} onClick={() => update({ ...filters, band: b.key })}>
              {b.label} ({counts[b.key] ?? 0})
            </button>
          ))}
        </div>
        <Filters value={filters} onChange={(f) => update({ ...f, band })} showSearch={false} />
        <p className="mt-6 mb-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{loading ? 'Loading…' : `${visible.length} watches`}</p>
        <ProductGrid products={visible} loading={loading} error={error} />
      </div>
    </>
  );
}
