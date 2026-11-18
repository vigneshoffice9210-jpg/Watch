import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useApi, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import { Button, Empty, ErrorNote, PageHeader, Spinner } from '../components/ui';

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  return now;
}

function Countdown({ to, now }) {
  const ms = Math.max(0, new Date(to) - now);
  const parts = [[Math.floor(ms / 864e5), 'Days'], [Math.floor(ms / 36e5) % 24, 'Hrs'], [Math.floor(ms / 6e4) % 60, 'Min'], [Math.floor(ms / 1e3) % 60, 'Sec']];
  if (!ms) return <p className="eyebrow">Live now</p>;
  return (
    <div className="flex gap-2">
      {parts.map(([v, l]) => (
        <div key={l} className="min-w-14 border border-gold/30 px-2 py-2 text-center">
          <p className="font-serif text-2xl tabular-nums">{String(v).padStart(2, '0')}</p>
          <p className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{l}</p>
        </div>
      ))}
    </div>
  );
}

function Notify({ dropId }) {
  const { user, toast } = useStore();
  const [contact, setContact] = useState(user?.email || '');
  const [done, setDone] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    try { await api(`/drops/${dropId}/notify`, { method: 'POST', body: { contact } }); setDone(true); toast("We'll let you know"); } catch (e2) { toast(e2.message, 'error'); }
  };
  if (done) return <p className="text-xs uppercase tracking-[0.2em] text-primary">You're on the list</p>;
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input className="field" placeholder="Email or WhatsApp" value={contact} onChange={(e) => setContact(e.target.value)} required />
      <Button size="sm" className="h-auto"><Bell /> Notify</Button>
    </form>
  );
}

export default function Drops() {
  useTitle('Watch Drops');
  const { data, loading, error } = useApi('/drops');
  const now = useNow();
  return (
    <>
      <PageHeader eyebrow="Watch Drops" lines={['LIMITED.', 'COMING SOON.']}>New and returning pieces, released in small numbers. Set a reminder so you don't miss yours.</PageHeader>
      <div className="container-x space-y-6 py-10">
        {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : !data.drops.length ? <Empty title="No drops scheduled">Check back soon.</Empty> : data.drops.map((d, i) => (
          <article key={d.id} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="grid gap-6 overflow-hidden rounded-md border border-border bg-card md:grid-cols-[260px_1fr]">
            {d.product && <div className="bg-ivory p-6"><img src={d.product.image} alt="" className="mx-auto aspect-square w-full object-contain" /></div>}
            <div className="flex flex-col justify-center gap-5 p-6">
              <div>
                <p className="eyebrow mb-2">{new Date(d.releaseAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <h2 className="font-serif text-3xl">{d.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                {d.product && <Link to={`/product/${d.product.slug}`} className="mt-2 inline-block text-sm text-primary hover:underline">{d.product.brand} {d.product.name} · {formatPrice(d.product.price)}</Link>}
              </div>
              <Countdown to={d.releaseAt} now={now} />
              {new Date(d.releaseAt) > now ? <Notify dropId={d.id} /> : d.product && <Button to={`/product/${d.product.slug}`} className="self-start">Shop now</Button>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
