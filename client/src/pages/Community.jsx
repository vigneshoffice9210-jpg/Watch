import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus, X } from 'lucide-react';
import { useApi, useProducts, useTitle } from '../lib/hooks';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { Button, Empty, ErrorNote, Field, PageHeader, Spinner } from '../components/ui';

export function LikeButton({ post }) {
  const [likes, setLikes] = useState(post.likes);
  const key = `everentia.liked.${post.id}`;
  const [liked, setLiked] = useState(() => { try { return !!localStorage.getItem(key); } catch { return false; } });
  const like = async (e) => {
    e.preventDefault();
    if (liked) return;
    setLiked(true); setLikes((l) => l + 1);
    try { localStorage.setItem(key, '1'); } catch { /* ignore */ }
    api(`/community/${post.id}/like`, { method: 'POST' }).then((d) => setLikes(d.likes)).catch(() => {});
  };
  return (
    <button onClick={like} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary" aria-label="Like">
      <Heart className={`h-4 w-4 ${liked ? 'fill-primary text-primary' : ''}`} /> {likes}
    </button>
  );
}

function ShareForm({ onClose, onDone }) {
  const { user } = useStore();
  const { products } = useProducts({});
  const [f, setF] = useState({ authorName: '', caption: '', productId: '' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    try { const d = await api('/community', { method: 'POST', body: fd }); onDone(d.id); } catch (e2) { setErr(e2); setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="animate-fade-up relative w-full max-w-lg space-y-4 border border-gold/40 bg-card p-6 sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 h-9 w-9 hover:text-primary" aria-label="Close"><X className="mx-auto h-5 w-5" /></button>
        <p className="eyebrow">Share your style</p>
        <h2 className="font-serif text-3xl">Post to the Style Board</h2>
        <Field label="Photo"><input type="file" accept="image/*" className="field" onChange={(e) => setFile(e.target.files[0])} required /></Field>
        {file && <img src={URL.createObjectURL(file)} alt="" className="max-h-48 w-full object-cover" />}
        {!user && <Field label="Your name"><input className="field" value={f.authorName} onChange={(e) => setF({ ...f, authorName: e.target.value })} required /></Field>}
        <Field label="Caption"><textarea className="field min-h-20" maxLength={500} value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} required /></Field>
        <Field label="Watch you're wearing (optional)">
          <select className="field" value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
            <option value="">—</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>)}
          </select>
        </Field>
        <ErrorNote error={err} />
        <Button className="w-full" disabled={busy}>{busy ? 'Posting…' : 'Post'}</Button>
      </form>
    </div>
  );
}

export default function Community({ share = false }) {
  useTitle('Style Board');
  const nav = useNavigate();
  const [open, setOpen] = useState(share);
  const { data, loading, error } = useApi('/community');
  const posts = data?.posts || [];
  return (
    <>
      <PageHeader eyebrow="Style Board" lines={['WORN', 'BEAUTIFULLY.']}>Real wrists, real moments. See how the Everentia community wears their timepieces — and share yours.</PageHeader>
      <div className="container-x py-10">
        <Button onClick={() => setOpen(true)} className="mb-8"><Plus /> Share your look</Button>
        {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : !posts.length ? (
          <Empty title="The board is empty">Be the first to share how you wear yours.</Empty>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {posts.map((p, i) => (
              <Link key={p.id} to={`/community/${p.id}`} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="group mb-4 block break-inside-avoid overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50">
                <img src={p.image} alt={p.caption} className="w-full transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="p-4">
                  <p className="line-clamp-2 text-sm">{p.caption}</p>
                  {p.productName && <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-primary">{p.productBrand} · {p.productName}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{p.authorName}</span>
                    <LikeButton post={p} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      {open && <ShareForm onClose={() => { setOpen(false); if (share) nav('/community'); }} onDone={(id) => nav(`/community/${id}`)} />}
    </>
  );
}
