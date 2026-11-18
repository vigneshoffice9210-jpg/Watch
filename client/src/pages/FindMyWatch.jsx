import { useMemo, useState } from 'react';
import { useProducts, useTitle } from '../lib/hooks';
import { recommend } from '../lib/recommend';
import { Button, PageHeader, cx } from '../components/ui';
import { ProductGrid } from '../components/ProductCard';

const QUESTIONS = [
  { key: 'gender', q: 'Who is it for?', options: [['men', 'Him'], ['women', 'Her'], ['any', 'Anyone']] },
  { key: 'style', q: 'Which word describes your style?', options: [['classic', 'Timeless'], ['sport', 'Active'], ['statement', 'Bold'], ['dress', 'Minimal']] },
  { key: 'occasion', q: 'Where will you wear it most?', options: [['formal', 'Work & formal'], ['casual', 'Everyday'], ['party', 'Evenings out'], ['outdoor', 'Outdoors']] },
  { key: 'colour', q: 'Pick a dial colour you love.', options: [['black', 'Black'], ['white', 'White'], ['blue', 'Blue'], ['green', 'Green'], ['beige', 'Champagne']] },
  { key: 'budget', q: 'What is your budget?', options: [['0-1000', 'Under ₹1,000'], ['1000-2500', '₹1,000 – ₹2,500'], ['2500-5000', '₹2,500 – ₹5,000'], ['5000-', '₹5,000+'], ['any', 'No limit']] },
];

export default function FindMyWatch() {
  useTitle('Find My Watch');
  const { products, loading } = useProducts({});
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const done = step >= QUESTIONS.length;

  const results = useMemo(() => {
    if (!done) return [];
    const [min, max] = answers.budget && answers.budget !== 'any' ? answers.budget.split('-').map((v) => (v ? Number(v) : undefined)) : [];
    const prefs = { gender: answers.gender, types: [answers.style], tags: [answers.occasion, answers.colour], minPrice: min || undefined, maxPrice: max };
    let r = recommend(products, prefs);
    if (!r.length) r = recommend(products, { ...prefs, minPrice: undefined, maxPrice: undefined });
    return r;
  }, [done, answers, products]);

  const choose = (v) => { setAnswers({ ...answers, [QUESTIONS[step].key]: v }); setStep(step + 1); };
  const Q = QUESTIONS[step];

  return (
    <>
      <PageHeader eyebrow="Find My Watch" lines={['FIVE QUESTIONS.', 'ONE MATCH.']}>Tell us a little about you and we'll shortlist the timepieces that suit you best.</PageHeader>
      <div className="container-x py-12">
        {!done ? (
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 flex gap-1.5">{QUESTIONS.map((_, i) => <div key={i} className={cx('h-0.5 flex-1', i <= step ? 'bg-primary' : 'bg-border')} />)}</div>
            <p className="eyebrow mb-3">Question {step + 1} of {QUESTIONS.length}</p>
            <h2 className="font-serif text-4xl">{Q.q}</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {Q.options.map(([v, l], i) => (
                <button key={`${step}-${v}`} onClick={() => choose(v)} style={{ '--d': `${i * 70}ms` }} className={cx('animate-fade-up rounded-md border px-5 py-5 text-left font-serif text-xl transition-all duration-300 hover:translate-x-1 hover:border-primary hover:bg-primary/5 hover:text-primary', answers[Q.key] === v ? 'border-primary text-primary' : 'border-border')}>{l}</button>
              ))}
            </div>
            {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">← Back</button>}
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div><p className="eyebrow mb-3">Your matches</p><h2 className="display-xl text-4xl">MADE FOR YOU.</h2></div>
              <Button variant="outline" onClick={() => { setAnswers({}); setStep(0); }}>Start again</Button>
            </div>
            <ProductGrid products={results} loading={loading} />
          </>
        )}
      </div>
    </>
  );
}
