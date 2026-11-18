import { useMemo, useState } from 'react';
import { useProducts, useTitle } from '../lib/hooks';
import { recommend } from '../lib/recommend';
import { PageHeader, cx } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';

// Outfit colour -> watch tones that complement it
const COLOURS = [
  ['black', 'Black', '#111', ['grey', 'black', 'white', 'beige']],
  ['white', 'White', '#f4f2ec', ['blue', 'brown', 'black', 'grey']],
  ['navy', 'Navy', '#14213d', ['beige', 'brown', 'white', 'grey']],
  ['beige', 'Beige', '#d8c7a6', ['brown', 'beige', 'green']],
  ['olive', 'Olive', '#556b2f', ['brown', 'green', 'black']],
  ['red', 'Red', '#8b1e2b', ['black', 'beige', 'white']],
  ['pink', 'Pink', '#e8b4b8', ['pink', 'white', 'beige']],
  ['grey', 'Grey', '#808080', ['blue', 'black', 'grey']],
];
const DRESS = [['formal', 'Formal'], ['casual', 'Casual'], ['party', 'Party']];

export default function OutfitMatch() {
  useTitle('Outfit Match');
  const { products, loading } = useProducts({});
  const [colour, setColour] = useState('navy');
  const [dress, setDress] = useState('formal');
  const results = useMemo(() => {
    const c = COLOURS.find((x) => x[0] === colour);
    return recommend(products, { tags: [...c[3], dress] }, 8);
  }, [products, colour, dress]);

  return (
    <>
      <PageHeader eyebrow="Outfit Match" lines={['DRESSED', 'TO THE MINUTE.']}>Pick the main colour you're wearing and the dress code. We'll suggest the watches that complete the look.</PageHeader>
      <div className="container-x space-y-8 py-10">
        <div>
          <p className="label">Outfit colour</p>
          <div className="flex flex-wrap gap-3">
            {COLOURS.map(([k, l, hex]) => (
              <button key={k} onClick={() => setColour(k)} className={cx('flex flex-col items-center gap-2 p-1 text-[10px] uppercase tracking-[0.18em]', colour === k ? 'text-primary' : 'text-muted-foreground')}>
                <span className={cx('h-12 w-12 rounded-full border-2', colour === k ? 'border-primary' : 'border-border')} style={{ background: hex }} />
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label">Dress code</p>
          <div className="flex flex-wrap gap-2">{DRESS.map(([k, l]) => <button key={k} className="chip" data-active={dress === k} onClick={() => setDress(k)}>{l}</button>)}</div>
        </div>
        <ProductGrid products={results} loading={loading} />
      </div>
    </>
  );
}
