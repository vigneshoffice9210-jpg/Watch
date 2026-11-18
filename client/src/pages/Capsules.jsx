import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hourglass, Lock, MailOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useApi, useProducts, useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import { Button, Empty, ErrorNote, Field, PageHeader, Spinner } from '../components/ui';

export default function Capsules() {
  useTitle('Time Capsule');
  const { user, authReady, toast } = useStore();
  const { data, loading, reload } = useApi(user ? '/capsules' : null);
  const { products } = useProducts({});
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const [f, setF] = useState({ title: '', message: '', openAt: '', productId: '' });
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      await api('/capsules', { method: 'POST', body: f });
      setF({ title: '', message: '', openAt: '', productId: '' });
      toast('Your capsule is sealed');
      reload();
    } catch (e2) { setErr(e2); }
  };

  return (
    <>
      <PageHeader eyebrow="Time Capsule" lines={['SEAL A MOMENT.', 'OPEN IT LATER.']}>
        Write a note to your future self — or someone you love — and pair it with a timepiece. It stays sealed until the day you choose.
      </PageHeader>
      <div className="container-x py-10">
        {!authReady ? <Spinner /> : !user ? (
          <Empty title="Sign in to create a capsule" action={<Button to="/auth?next=/capsules">Sign in</Button>}>Capsules are saved to your account so you can open them on the day.</Empty>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
            <form onSubmit={submit} className="space-y-4 border border-border p-6">
              <p className="eyebrow">New capsule</p>
              <Field label="Title"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Our 10th anniversary" required /></Field>
              <Field label="Message"><textarea className="field min-h-36" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required /></Field>
              <Field label="Open on"><input type="date" min={tomorrow} className="field" value={f.openAt} onChange={(e) => setF({ ...f, openAt: e.target.value })} required /></Field>
              <Field label="Pair with a watch (optional)">
                <select className="field" value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
                  <option value="">—</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>)}
                </select>
              </Field>
              <ErrorNote error={err} />
              <Button><Hourglass /> Seal capsule</Button>
            </form>
            <div className="space-y-4">
              {loading ? <Spinner /> : !data?.capsules.length ? <Empty title="No capsules yet">Your sealed capsules will appear here.</Empty> : data.capsules.map((c, i) => (
                <article key={c.id} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="rounded-md border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-2xl">{c.title}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{c.locked ? 'Opens' : 'Opened'} {formatDate(c.openAt)}</p>
                    </div>
                    {c.locked ? <Lock className="h-5 w-5 text-primary" /> : <MailOpen className="h-5 w-5 text-primary" />}
                  </div>
                  {c.locked
                    ? <p className="mt-4 text-sm italic text-muted-foreground">Sealed. {Math.ceil((new Date(c.openAt) - Date.now()) / 864e5)} days to go.</p>
                    : <p className="mt-4 whitespace-pre-line text-sm">{c.message}</p>}
                  {c.productSlug && <Link to={`/product/${c.productSlug}`} className="mt-4 flex items-center gap-3 text-sm hover:text-primary"><img src={c.productImage} alt="" className="h-10 w-10 bg-ivory object-contain" />{c.productName}</Link>}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
