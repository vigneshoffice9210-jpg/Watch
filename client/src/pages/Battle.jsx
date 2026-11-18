import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Trophy } from 'lucide-react';
import { useProducts, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { canBuy, formatPrice, stockLabel, TYPE_LABELS } from '../lib/format';
import { Button, PageHeader, Spinner, cx } from '../components/ui';

function loadVotes() { try { return JSON.parse(localStorage.getItem('everentia.battle') || '{}'); } catch { return {}; } }

export default function Battle() {
  useTitle('Watch Battle');
  const { products, loading } = useProducts({});
  const { addToCart } = useStore();
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);
  const [votes, setVotes] = useState(loadVotes);
  useEffect(() => { if (products.length > 1 && !a) { setA(products[0].id); setB(products[1].id); } }, [products, a]);
  useEffect(() => { try { localStorage.setItem('everentia.battle', JSON.stringify(votes)); } catch { /* ignore */ } }, [votes]);

  if (loading) return <Spinner />;
  const A = products.find((p) => p.id === a);
  const B = products.find((p) => p.id === b);
  const pairKey = [a, b].sort().join('-');
  const pv = votes[pairKey] || {};
  const total = (pv[a] || 0) + (pv[b] || 0);
  const vote = (id) => setVotes({ ...votes, [pairKey]: { ...pv, [id]: (pv[id] || 0) + 1 } });
  const specKeys = [...new Set([...Object.keys(A?.specs || {}), ...Object.keys(B?.specs || {})])];

  const Side = ({ p, value, onChange }) => (
    <div className="flex flex-col">
      <select className="field mb-4" value={value || ''} onChange={(e) => onChange(Number(e.target.value))}>
        {products.map((x) => <option key={x.id} value={x.id}>{x.brand} — {x.name}</option>)}
      </select>
      {p && (
        <div className="flex-1 border border-border bg-card">
          <div className="bg-ivory p-6"><img src={p.image} alt="" className="mx-auto aspect-square w-full max-w-xs object-contain" /></div>
          <div className="p-5">
            <p className="text-[9px] uppercase tracking-[0.22em] text-primary">{p.brand}</p>
            <Link to={`/product/${p.slug}`} className="font-serif text-2xl hover:text-primary">{p.name}</Link>
            <p className="mt-2">{formatPrice(p.price)}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => vote(p.id)}><Trophy /> Vote</Button>
              <Button size="sm" variant="outline" disabled={!canBuy(p)} onClick={() => addToCart(p.id)}>Add</Button>
            </div>
            {total > 0 && (
              <div className="mt-4">
                <div className="h-1 bg-border"><div className="h-1 bg-primary" style={{ width: `${((pv[p.id] || 0) / total) * 100}%` }} /></div>
                <p className="mt-1 text-xs text-muted-foreground">{Math.round(((pv[p.id] || 0) / total) * 100)}% of your votes</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const rows = [
    ['Price', formatPrice(A?.price), formatPrice(B?.price), A && B && (A.price < B.price ? 'a' : A.price > B.price ? 'b' : null)],
    ['Type', TYPE_LABELS[A?.type], TYPE_LABELS[B?.type]],
    ['Availability', A && stockLabel(A), B && stockLabel(B)],
    ...specKeys.map((k) => [k, A?.specs?.[k] || '—', B?.specs?.[k] || '—']),
  ];

  return (
    <>
      <PageHeader eyebrow="Watch Battle" lines={['HEAD', 'TO HEAD.']}>Can't decide? Put two timepieces side by side and compare every detail.</PageHeader>
      <div className="container-x py-10">
        <div className="grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
          <Side p={A} value={a} onChange={setA} />
          <div className="flex items-center justify-center"><Swords className="h-8 w-8 text-primary" strokeWidth={1.2} /></div>
          <Side p={B} value={b} onChange={setB} />
        </div>
        <table className="mt-10 w-full border border-border text-sm">
          <tbody>
            {rows.map(([k, va, vb, win]) => (
              <tr key={k} className="border-b border-border/70">
                <td className={cx('w-2/5 px-4 py-3 text-right', win === 'a' && 'text-primary')}>{va}</td>
                <th className="w-1/5 px-2 py-3 text-center text-[10px] font-normal uppercase tracking-[0.2em] text-muted-foreground">{k}</th>
                <td className={cx('w-2/5 px-4 py-3', win === 'b' && 'text-primary')}>{vb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
