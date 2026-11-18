import { useState } from 'react';
import { CheckCircle2, Store, Users, Megaphone } from 'lucide-react';
import { useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { Button, ErrorNote, Field, PageHeader } from '../components/ui';

const TYPES = [
  ['retail', 'Retail store', Store, 'Stock Everentia timepieces in your boutique.'],
  ['reseller', 'Online reseller', Users, 'Sell our collection through your channels.'],
  ['creator', 'Creator / influencer', Megaphone, 'Collaborate on content and launches.'],
];

export default function Partners() {
  useTitle('Become a partner');
  const [f, setF] = useState({ name: '', business: '', email: '', phone: '', city: '', partnerType: 'retail', message: '' });
  const [err, setErr] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { await api('/partners', { method: 'POST', body: f }); setDone(true); } catch (e2) { setErr(e2); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader eyebrow="Become a partner" lines={['GROW', 'WITH EVERENTIA.']}>Retailers, resellers and creators — let's build something timeless together.</PageHeader>
      <div className="container-x grid gap-12 py-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {TYPES.map(([k, l, Icon, d], i) => (
            <button key={k} type="button" data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} onClick={() => setF({ ...f, partnerType: k })} className={`flex w-full gap-4 border p-5 text-left transition-colors ${f.partnerType === k ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.2} />
              <span><span className="block font-serif text-xl">{l}</span><span className="text-sm text-muted-foreground">{d}</span></span>
            </button>
          ))}
        </div>
        {done ? (
          <div className="flex flex-col items-center justify-center border border-gold/40 p-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1} />
            <p className="mt-5 font-serif text-3xl">Thank you, {f.name.split(' ')[0]}.</p>
            <p className="mt-2 text-sm text-muted-foreground">Our partnerships team will reach out within two business days.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 border border-border p-6 sm:grid-cols-2">
            <Field label="Your name"><input className="field" value={f.name} onChange={set('name')} required /></Field>
            <Field label="Business name"><input className="field" value={f.business} onChange={set('business')} required /></Field>
            <Field label="Email"><input type="email" className="field" value={f.email} onChange={set('email')} required /></Field>
            <Field label="Phone"><input className="field" value={f.phone} onChange={set('phone')} required /></Field>
            <Field label="City" className="sm:col-span-2"><input className="field" value={f.city} onChange={set('city')} /></Field>
            <Field label="Tell us about your business" className="sm:col-span-2"><textarea className="field min-h-28" value={f.message} onChange={set('message')} /></Field>
            <ErrorNote error={err} className="sm:col-span-2" />
            <Button className="sm:col-span-2" disabled={busy}>{busy ? 'Sending…' : 'Submit application'}</Button>
          </form>
        )}
      </div>
    </>
  );
}
