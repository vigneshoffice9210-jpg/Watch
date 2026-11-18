import { useMemo, useState } from 'react';
import { useProducts, useTitle } from '../lib/hooks';
import { recommend } from '../lib/recommend';
import { PageHeader } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';

const RECIPIENTS = [
  ['partner-him', 'Partner (him)', { gender: 'men' }], ['partner-her', 'Partner (her)', { gender: 'women' }],
  ['father', 'Father', { gender: 'men', types: ['classic'] }], ['mother', 'Mother', { gender: 'women', types: ['classic', 'dress'] }],
  ['friend', 'Friend', { gender: 'any' }], ['colleague', 'Colleague', { gender: 'any', types: ['dress', 'classic'] }],
];
const OCCASIONS = [['birthday', 'Birthday', ['gift']], ['anniversary', 'Anniversary', ['formal', 'gift']], ['wedding', 'Wedding', ['wedding', 'formal']], ['graduation', 'Graduation', ['casual']], ['festive', 'Festive', ['party', 'gift']], ['just', 'Just because', []]];
const BUDGETS = [['any', 'Any budget'], ['0-1000', 'Under ₹1,000'], ['1000-2500', '₹1,000 – ₹2,500'], ['2500-5000', '₹2,500 – ₹5,000'], ['5000-', '₹5,000+']];

export default function GiftFinder() {
  useTitle('Gift Finder');
  const { products, loading } = useProducts({});
  const [who, setWho] = useState('partner-her');
  const [occ, setOcc] = useState('birthday');
  const [budget, setBudget] = useState('any');

  const results = useMemo(() => {
    const r = RECIPIENTS.find((x) => x[0] === who)[2];
    const o = OCCASIONS.find((x) => x[0] === occ)[2];
    const [min, max] = budget === 'any' ? [] : budget.split('-').map((v) => (v ? Number(v) : undefined));
    return recommend(products, { ...r, tags: o, minPrice: min || undefined, maxPrice: max }, 8);
  }, [products, who, occ, budget]);

  const Group = ({ label, items, value, onChange }) => (
    <div>
      <p className="label">{label}</p>
      <div className="flex flex-wrap gap-2">{items.map(([v, l]) => <button key={v} className="chip" data-active={value === v} onClick={() => onChange(v)}>{l}</button>)}</div>
    </div>
  );

  return (
    <>
      <PageHeader eyebrow="Gift Finder" lines={['A GIFT', 'THAT LASTS.']}>Choose who it's for, the occasion and your budget. We'll do the rest — every order can be gift-wrapped at checkout.</PageHeader>
      <div className="container-x space-y-6 py-10">
        <Group label="Who is it for?" items={RECIPIENTS} value={who} onChange={setWho} />
        <Group label="Occasion" items={OCCASIONS} value={occ} onChange={setOcc} />
        <Group label="Budget" items={BUDGETS} value={budget} onChange={setBudget} />
        <div className="pt-6"><ProductGrid products={results} loading={loading} /></div>
      </div>
    </>
  );
}
