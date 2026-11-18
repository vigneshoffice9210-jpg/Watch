import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';
import Filters from '../components/Filters';
import { useProducts, useTitle } from '../lib/hooks';

const KEYS = ['q', 'brand', 'type', 'gender', 'availability', 'sort'];

export default function Collection() {
  useTitle('The Collection');
  const [sp, setSp] = useSearchParams();
  const filters = Object.fromEntries(KEYS.map((k) => [k, sp.get(k) || '']));
  const { products, loading, error } = useProducts(filters);

  const update = (next) => {
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setSp(clean, { replace: true });
  };

  return (
    <>
      <PageHeader eyebrow="The Collection" lines={['TIMEPIECES', 'WITH PRESENCE.']}>
        From quiet dress watches to bold contemporary icons, each piece is selected for distinctive character.
      </PageHeader>
      <div className="container-x py-10">
        <Filters value={filters} onChange={update} />
        <p className="mt-6 mb-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{loading ? 'Loading the collection…' : `${products.length} watches`}</p>
        <ProductGrid products={products} loading={loading} error={error} />
      </div>
    </>
  );
}
