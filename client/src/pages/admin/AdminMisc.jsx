import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApi, useProducts } from '../../lib/hooks';
import { useStore } from '../../context/StoreContext';
import { api } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';
import { Button, ErrorNote, Field, Spinner } from '../../components/ui';

export function AdminCustomers() {
  const { data, loading, error } = useApi('/admin/customers');
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Customers</h1>
      {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Contact</th><th className="p-3">Orders</th><th className="p-3">Spent</th><th className="p-3">Points</th><th className="p-3">Joined</th></tr>
            </thead>
            <tbody>
              {data.customers.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="p-3">{c.name}{c.role === 'admin' && <span className="ml-2 text-[9px] uppercase tracking-[0.2em] text-primary">admin</span>}</td>
                  <td className="p-3">{c.email}<span className="block text-xs text-muted-foreground">{c.phone}</span></td>
                  <td className="p-3">{c.orders}</td>
                  <td className="p-3">{formatPrice(c.spent)}</td>
                  <td className="p-3">{c.points}</td>
                  <td className="p-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminPartners() {
  const { toast } = useStore();
  const { data, loading, error, reload } = useApi('/admin/partners');
  const set = async (p, status) => {
    try { await api(`/admin/partners/${p.id}`, { method: 'PATCH', body: { status } }); reload(); } catch (e) { toast(e.message, 'error'); }
  };
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Partner requests</h1>
      {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : !data.partners.length ? <p className="text-sm text-muted-foreground">No requests yet.</p> : (
        <div className="space-y-3">
          {data.partners.map((p) => (
            <article key={p.id} className="border border-border p-5 text-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-serif text-xl">{p.business} <span className="text-xs uppercase tracking-[0.18em] text-primary">{p.partner_type}</span></p>
                  <p className="text-muted-foreground">{p.name} · {p.email} · {p.phone}{p.city && ` · ${p.city}`}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(p.created_at)}</p>
              </div>
              {p.message && <p className="mt-3">{p.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {['new', 'contacted', 'approved', 'rejected'].map((s) => <button key={s} className="chip" data-active={p.status === s} onClick={() => set(p, s)}>{s}</button>)}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminCommunity() {
  const { toast } = useStore();
  const { data, loading, error, reload } = useApi('/admin/community');
  const act = async (path, opts) => { try { await api(path, opts); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Style Board</h1>
      {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : !data.posts.length ? <p className="text-sm text-muted-foreground">No posts yet.</p> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.posts.map((p) => (
            <article key={p.id} className="border border-border">
              <img src={p.image} alt="" className="aspect-square w-full object-cover" />
              <div className="space-y-3 p-4 text-sm">
                <p>{p.caption}</p>
                <p className="text-xs text-muted-foreground">{p.authorName} · {p.likes} likes · {formatDate(p.createdAt)}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant={p.isApproved ? 'outline' : 'default'} onClick={() => act(`/admin/community/${p.id}`, { method: 'PATCH', body: { isApproved: !p.isApproved } })}>{p.isApproved ? 'Hide' : 'Approve'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => window.confirm('Delete this post?') && act(`/admin/community/${p.id}`, { method: 'DELETE' })}><Trash2 /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminContent() {
  const { toast } = useStore();
  const drops = useApi('/drops');
  const policies = useApi('/policies');
  const { products } = useProducts({});
  const [d, setD] = useState({ title: '', description: '', productId: '', releaseAt: '' });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState(null);

  const addDrop = async (e) => {
    e.preventDefault();
    setErr(null);
    try { await api('/admin/drops', { method: 'POST', body: d }); setD({ title: '', description: '', productId: '', releaseAt: '' }); toast('Drop scheduled'); drops.reload(); } catch (e2) { setErr(e2); }
  };
  const delDrop = async (id) => {
    if (!window.confirm('Delete this drop?')) return;
    await api(`/admin/drops/${id}`, { method: 'DELETE' }).catch((e) => toast(e.message, 'error'));
    drops.reload();
  };
  const savePolicy = async (e) => {
    e.preventDefault();
    try { await api(`/admin/policies/${editing.slug}`, { method: 'PUT', body: editing }); toast('Policy saved'); setEditing(null); policies.reload(); } catch (e2) { toast(e2.message, 'error'); }
  };

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <h1 className="font-serif text-4xl">Watch Drops</h1>
        <form onSubmit={addDrop} className="grid gap-4 border border-border p-5 sm:grid-cols-2">
          <Field label="Title"><input className="field" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} required /></Field>
          <Field label="Release date & time"><input type="datetime-local" className="field" value={d.releaseAt} onChange={(e) => setD({ ...d, releaseAt: e.target.value })} required /></Field>
          <Field label="Product">
            <select className="field" value={d.productId} onChange={(e) => setD({ ...d, productId: e.target.value })}>
              <option value="">—</option>{products.map((p) => <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>)}
            </select>
          </Field>
          <Field label="Description"><input className="field" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></Field>
          <ErrorNote error={err} className="sm:col-span-2" />
          <Button className="sm:col-span-2 sm:justify-self-start">Schedule drop</Button>
        </form>
        {drops.data?.drops.map((x) => (
          <div key={x.id} className="flex items-center justify-between border-b border-border py-3 text-sm">
            <span>{x.title} <span className="text-muted-foreground">· {new Date(x.releaseAt).toLocaleString('en-IN')}</span></span>
            <Button size="icon" variant="ghost" onClick={() => delDrop(x.id)} aria-label="Delete drop"><Trash2 /></Button>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <h2 className="font-serif text-4xl">Policies</h2>
        {policies.data?.policies.map((p) => (
          editing?.slug === p.slug ? (
            <form key={p.slug} onSubmit={savePolicy} className="space-y-3 border border-primary/40 p-5">
              <input className="field" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <textarea className="field min-h-40" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              <div className="flex gap-2"><Button size="sm">Save</Button><Button size="sm" type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
            </form>
          ) : (
            <div key={p.slug} className="flex items-start justify-between gap-4 border-b border-border py-3 text-sm">
              <div><p className="font-serif text-lg">{p.title}</p><p className="line-clamp-2 text-muted-foreground">{p.body}</p></div>
              <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
            </div>
          )
        ))}
      </section>
    </div>
  );
}
