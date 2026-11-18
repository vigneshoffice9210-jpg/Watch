import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useProducts, useTitle } from '../lib/hooks';
import { dailySeed, recommend } from '../lib/recommend';
import { formatPrice } from '../lib/format';
import { Button, PageHeader, Spinner } from '../components/ui';

const PLANS = [
  ['office', 'The office', ['formal'], ['classic', 'dress'], 'Clean lines and a quiet dial keep you sharp from the first meeting to the last.'],
  ['date', 'A dinner date', ['party', 'formal'], ['statement', 'dress'], 'Something with a little shine — it will be noticed across the table.'],
  ['weekend', 'A slow weekend', ['casual'], ['sport', 'classic'], 'Relaxed, easy to read, comfortable all day.'],
  ['outdoors', 'The outdoors', ['outdoor'], ['sport'], 'Built tough and water-ready for wherever the day goes.'],
  ['celebration', 'A celebration', ['party', 'wedding'], ['statement'], 'Bold presence for a big moment.'],
];

export default function WearToday() {
  useTitle('Wear Today');
  const { products, loading } = useProducts({});
  const [plan, setPlan] = useState('office');
  const P = PLANS.find((x) => x[0] === plan);
  const pick = useMemo(() => {
    const list = recommend(products, { tags: P[2], types: P[3] }, 4);
    return list.length ? list[dailySeed(plan) % list.length] : null;
  }, [products, plan, P]);

  return (
    <>
      <PageHeader eyebrow="Wear Today" lines={["TODAY'S", 'TIMEPIECE.']}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}. Where are you headed?
      </PageHeader>
      <div className="container-x py-10">
        <div className="mb-10 flex flex-wrap gap-2">{PLANS.map(([k, l]) => <button key={k} className="chip" data-active={plan === k} onClick={() => setPlan(k)}>{l}</button>)}</div>
        {loading ? <Spinner /> : pick && (
          <div className="grid items-center gap-10 border border-gold/30 bg-card md:grid-cols-2">
            <div className="bg-ivory p-10"><img src={pick.image} alt="" className="mx-auto aspect-square w-full max-w-sm object-contain" /></div>
            <div className="p-8">
              <p className="eyebrow mb-3">Our pick for {P[1].toLowerCase()}</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-primary">{pick.brand}</p>
              <h2 className="mt-2 font-serif text-4xl">{pick.name}</h2>
              <p className="mt-4 font-serif text-xl italic text-muted-foreground">{P[4]}</p>
              <p className="mt-4">{formatPrice(pick.price)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to={`/try-on?watch=${pick.slug}`}><Sparkles /> Try it on</Button>
                <Button variant="outline" to={`/product/${pick.slug}`}>View details</Button>
              </div>
              <Link to="/outfit-match" className="mt-6 block text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-primary">Match it to your outfit →</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
