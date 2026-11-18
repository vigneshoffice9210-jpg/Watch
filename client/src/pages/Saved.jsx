import { useStore } from '../context/StoreContext';
import { useProducts, useTitle } from '../lib/hooks';
import { Button, Empty, PageHeader } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';

export default function Saved() {
  useTitle('Saved watches');
  const { favorites } = useStore();
  const { products, loading, error } = useProducts(favorites.length ? { ids: favorites.join(',') } : { ids: '0' });
  return (
    <>
      <PageHeader eyebrow="Saved watches" lines={['YOUR', 'SHORTLIST.']}>{favorites.length} saved watch{favorites.length === 1 ? '' : 'es'}. Saved watches stay on this device.</PageHeader>
      <div className="container-x py-10">
        <ProductGrid products={favorites.length ? products : []} loading={loading && favorites.length > 0} error={error}
          empty={<Empty title="Nothing saved yet" action={<Button to="/collection">Explore collection</Button>}>Tap the heart on any timepiece to keep it here.</Empty>} />
      </div>
    </>
  );
}
