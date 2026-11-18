import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, Heart, Gift, Hourglass, LayoutDashboard } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { Button, ErrorNote, Field, PageHeader, Spinner } from '../components/ui';

export default function Account() {
  useTitle('Account');
  const { user, authReady, logout, refreshUser, toast } = useStore();
  const [f, setF] = useState(null);
  const [err, setErr] = useState(null);

  if (!authReady) return <Spinner />;
  if (!user) return <Navigate to="/auth?next=/account" replace />;
  const form = f || { name: user.name, phone: user.phone || '' };

  const save = async (e) => {
    e.preventDefault();
    try { await api('/auth/me', { method: 'PUT', body: form }); await refreshUser(); toast('Profile updated'); setF(null); } catch (e2) { setErr(e2); }
  };

  const links = [
    { to: '/orders', label: 'My orders', icon: Package },
    { to: '/saved', label: 'Saved watches', icon: Heart },
    { to: '/rewards', label: `Rewards · ${user.points} pts`, icon: Gift },
    { to: '/capsules', label: 'Time capsules', icon: Hourglass },
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin dashboard', icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      <PageHeader eyebrow="Your account" lines={[`HELLO,`, `${user.name.split(' ')[0].toUpperCase()}.`]}>{user.email}</PageHeader>
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map(({ to, label, icon: Icon }, i) => (
            <Link key={to} to={to} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="flex items-center gap-3 rounded-md border border-border p-5 transition-colors hover:border-primary/50 hover:bg-card">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.4} /> <span className="font-serif text-lg">{label}</span>
            </Link>
          ))}
        </div>
        <form onSubmit={save} className="space-y-4 border border-border p-6">
          <p className="eyebrow">Profile</p>
          <Field label="Name"><input className="field" value={form.name} onChange={(e) => setF({ ...form, name: e.target.value })} /></Field>
          <Field label="Phone"><input className="field" value={form.phone} onChange={(e) => setF({ ...form, phone: e.target.value })} /></Field>
          <ErrorNote error={err} />
          <div className="flex gap-3">
            <Button disabled={!f}>Save</Button>
            <Button type="button" variant="ghost" onClick={logout}>Sign out</Button>
          </div>
        </form>
      </div>
    </>
  );
}
