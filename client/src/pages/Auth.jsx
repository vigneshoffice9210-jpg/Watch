import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useTitle } from '../lib/hooks';
import { Button, ErrorNote, Field, cx } from '../components/ui';

export default function Auth() {
  useTitle('Sign in');
  const [sp] = useSearchParams();
  const next = sp.get('next') || '/account';
  const nav = useNavigate();
  const { user, login, register, toast } = useStore();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const u = mode === 'login' ? await login(f.email, f.password) : await register(f);
      toast(`Welcome${mode === 'login' ? ' back' : ''}, ${u.name.split(' ')[0]}`);
      nav(next, { replace: true });
    } catch (e2) { setErr(e2); } finally { setBusy(false); }
  };

  return (
    <div className="container-x flex justify-center py-20">
      <div className="w-full max-w-md">
        <p className="eyebrow mb-4 text-center">Your Basha Gadgets account</p>
        <h1 className="display-xl text-center text-5xl">{mode === 'login' ? 'WELCOME BACK.' : 'JOIN THE SQUAD.'}</h1>
        <div className="mt-10 grid grid-cols-2 border border-border">
          {[['login', 'Sign in'], ['register', 'Create account']].map(([k, l]) => (
            <button key={k} onClick={() => { setMode(k); setErr(null); }} className={cx('py-3 text-[11px] uppercase tracking-[0.22em]', mode === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{l}</button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === 'register' && (
            <>
              <Field label="Full name"><input className="field" value={f.name} onChange={set('name')} required autoComplete="name" /></Field>
              <Field label="Phone (optional)"><input className="field" value={f.phone} onChange={set('phone')} autoComplete="tel" /></Field>
            </>
          )}
          <Field label="Email"><input type="email" className="field" value={f.email} onChange={set('email')} required autoComplete="email" /></Field>
          <Field label="Password"><input type="password" className="field" value={f.password} onChange={set('password')} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></Field>
          <ErrorNote error={err} />
          <Button className="w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">Earn 1 reward point for every ₹100 you spend.</p>
      </div>
    </div>
  );
}
