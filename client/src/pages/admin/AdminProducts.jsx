import { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useProducts } from '../../lib/hooks';
import { useStore } from '../../context/StoreContext';
import { api } from '../../lib/api';
import { formatPrice, stockLabel, TYPE_LABELS } from '../../lib/format';
import { Button, ErrorNote, Field, Spinner } from '../../components/ui';

const EMPTY = { name: '', brand: '', slug: '', type: 'classic', gender: 'unisex', price: '', mrp: '', stock: 0, stockStatus: 'auto', description: '', specs: '{}', tags: '', isFeatured: false, isNew: false, isVault: false, isActive: true, imageUrl: '', tryOnImageUrl: '' };

function toForm(p) {
  return {
    ...EMPTY, ...p, mrp: p.mrp ?? '', stockStatus: p.stockStatus === 'preorder' ? 'preorder' : 'auto',
    specs: JSON.stringify(p.specs || {}, null, 2), tags: (p.tags || []).join(', '), imageUrl: p.image || '', tryOnImageUrl: p.tryOnImage || '',
  };
}

function ProductForm({ initial, onClose, onSaved }) {
  const [f, setF] = useState(initial ? toForm(initial) : EMPTY);
  const [files, setFiles] = useState({});
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    let specs;
    try { specs = JSON.parse(f.specs || '{}'); } catch { setErr(new Error('Specs must be valid JSON, e.g. {"Case size": "40 mm"}')); return; }
    const fd = new FormData();
    const payload = { ...f, specs: JSON.stringify(specs), tags: JSON.stringify(f.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)) };
    delete payload.images; delete payload.image; delete payload.tryOnImage; delete payload.id; delete payload.createdAt;
    Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (files.image) fd.append('image', files.image);
    if (files.tryOnImage) fd.append('tryOnImage', files.tryOnImage);
    setBusy(true);
    try {
      await api(initial ? `/products/${initial.id}` : '/products', { method: initial ? 'PUT' : 'POST', body: fd });
      onSaved();
    } catch (e2) { setErr(e2); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="relative mx-auto my-8 grid max-w-3xl gap-4 border border-gold/40 bg-card p-6 sm:grid-cols-2">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 h-9 w-9 hover:text-primary" aria-label="Close"><X className="mx-auto h-5 w-5" /></button>
        <h2 className="font-serif text-3xl sm:col-span-2">{initial ? 'Edit product' : 'New product'}</h2>
        <Field label="Name"><input className="field" value={f.name} onChange={set('name')} required /></Field>
        <Field label="Brand"><input className="field" value={f.brand} onChange={set('brand')} required /></Field>
        <Field label="Slug (URL, optional)"><input className="field" value={f.slug} onChange={set('slug')} placeholder="auto from brand + name" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type"><select className="field" value={f.type} onChange={set('type')}>{Object.entries(TYPE_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <Field label="For"><select className="field" value={f.gender} onChange={set('gender')}><option value="unisex">Everyone</option><option value="men">Men</option><option value="women">Women</option></select></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹)"><input type="number" min="1" className="field" value={f.price} onChange={set('price')} required /></Field>
          <Field label="MRP (₹)"><input type="number" min="0" className="field" value={f.mrp} onChange={set('mrp')} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stock"><input type="number" min="0" className="field" value={f.stock} onChange={set('stock')} /></Field>
          <Field label="Status"><select className="field" value={f.stockStatus} onChange={set('stockStatus')}><option value="auto">Auto from stock</option><option value="preorder">Pre-order</option></select></Field>
        </div>
        <Field label="Description" className="sm:col-span-2"><textarea className="field min-h-24" value={f.description} onChange={set('description')} /></Field>
        <Field label='Specs (JSON, e.g. {"Case size": "40 mm"})'><textarea className="field min-h-32 font-mono text-xs" value={f.specs} onChange={set('specs')} /></Field>
        <div className="space-y-4">
          <Field label="Tags (comma separated)"><input className="field" value={f.tags} onChange={set('tags')} placeholder="formal, gift, black" /></Field>
          <p className="text-[11px] leading-relaxed text-muted-foreground">Tags power Find My Watch, Gift Finder and Outfit Match. Use occasions (formal, casual, party, outdoor, wedding, gift) and colours (black, white, blue, green, brown, beige, grey, pink, red).</p>
        </div>
        <Field label="Product image (upload or URL)">
          <input type="file" accept="image/*" className="field" onChange={(e) => setFiles({ ...files, image: e.target.files[0] })} />
          <input className="field mt-2" value={f.imageUrl} onChange={set('imageUrl')} placeholder="/watches/…svg or https://…" />
        </Field>
        <Field label="Try-on image (transparent PNG/SVG)">
          <input type="file" accept="image/*" className="field" onChange={(e) => setFiles({ ...files, tryOnImage: e.target.files[0] })} />
          <input className="field mt-2" value={f.tryOnImageUrl} onChange={set('tryOnImageUrl')} placeholder="Leave empty to disable try-on" />
        </Field>
        <div className="flex flex-wrap gap-5 text-sm sm:col-span-2">
          {[['isActive', 'Visible in store'], ['isFeatured', 'Featured'], ['isNew', 'New arrival'], ['isVault', 'The Vault']].map(([k, l]) => (
            <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={!!f[k]} onChange={set(k)} className="h-4 w-4 accent-gold" /> {l}</label>
          ))}
        </div>
        <ErrorNote error={err} className="sm:col-span-2" />
        <div className="flex gap-3 sm:col-span-2">
          <Button disabled={busy}>{busy ? 'Saving…' : 'Save product'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminProducts() {
  const { toast } = useStore();
  const [search, setSearch] = useState('');
  const { products, loading, error, reload } = useProducts({ includeInactive: 1, q: search, sort: 'newest' });
  const [editing, setEditing] = useState(null);

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}? This cannot be undone.`)) return;
    try { await api(`/products/${p.id}`, { method: 'DELETE' }); toast('Product deleted'); reload(); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Products</h1>
        <Button onClick={() => setEditing('new')}><Plus /> Add product</Button>
      </div>
      <input className="field max-w-sm" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Flags</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-12 w-12 bg-ivory object-contain p-0.5" />
                      <div><p className="text-[9px] uppercase tracking-[0.2em] text-primary">{p.brand}</p><p>{p.name}</p></div>
                    </div>
                  </td>
                  <td className="p-3">{TYPE_LABELS[p.type]}</td>
                  <td className="p-3">{formatPrice(p.price)}{p.mrp && <span className="block text-xs text-muted-foreground line-through">{formatPrice(p.mrp)}</span>}</td>
                  <td className="p-3">{p.stock} <span className="block text-xs text-muted-foreground">{stockLabel(p)}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{[!p.isActive && 'Hidden', p.isFeatured && 'Featured', p.isNew && 'New', p.isVault && 'Vault'].filter(Boolean).join(' · ')}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(p)} aria-label="Edit"><Pencil /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p)} aria-label="Delete"><Trash2 /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <ProductForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); toast('Product saved'); reload(); }} />}
    </div>
  );
}
