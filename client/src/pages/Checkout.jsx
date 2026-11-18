import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Banknote, Smartphone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCartDetails } from '../lib/useCart';
import { useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import { Button, ErrorNote, Field, PageHeader, Spinner, cx } from '../components/ui';
import { Summary } from './Cart';
import { BRAND } from '../config';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'];

export default function Checkout() {
  useTitle('Checkout');
  const nav = useNavigate();
  const { cart, clearCart, user, refreshUser } = useStore();
  const [giftWrap, setGiftWrap] = useState(false);
  const { loading, lines, quote } = useCartDetails(giftWrap);
  const [f, setF] = useState({ customerName: '', email: '', phone: '', line1: '', line2: '', city: '', state: 'Tamil Nadu', pincode: '', notes: '', paymentMethod: 'cod', paymentRef: '' });
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setF((x) => ({ ...x, customerName: x.customerName || user.name, email: x.email || user.email, phone: x.phone || user.phone || '' }));
  }, [user]);

  if (!cart.length && !busy) return <Navigate to="/cart" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const { order } = await api('/orders', { method: 'POST', body: { ...f, giftWrap, items: cart } });
      clearCart();
      refreshUser();
      nav(`/order/${order.orderNumber}`, { state: { order } });
    } catch (e2) { setErr(e2); setBusy(false); }
  };

  return (
    <>
      <PageHeader eyebrow="Checkout" lines={['ALMOST', 'YOURS.']}>
        {!user && <>Have an account? <Link to="/auth?next=/checkout" className="text-primary hover:underline">Sign in</Link> to earn reward points.</>}
      </PageHeader>
      <form onSubmit={submit} className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section>
            <p className="eyebrow mb-5">Contact</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" className="sm:col-span-2"><input className="field" value={f.customerName} onChange={set('customerName')} required autoComplete="name" /></Field>
              <Field label="Email"><input type="email" className="field" value={f.email} onChange={set('email')} required autoComplete="email" /></Field>
              <Field label="Phone / WhatsApp"><input type="tel" className="field" value={f.phone} onChange={set('phone')} required pattern="[0-9+ ]{10,15}" autoComplete="tel" /></Field>
            </div>
          </section>
          <section>
            <p className="eyebrow mb-5">Delivery address</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address line 1" className="sm:col-span-2"><input className="field" value={f.line1} onChange={set('line1')} required autoComplete="address-line1" /></Field>
              <Field label="Address line 2 (optional)" className="sm:col-span-2"><input className="field" value={f.line2} onChange={set('line2')} autoComplete="address-line2" /></Field>
              <Field label="City"><input className="field" value={f.city} onChange={set('city')} required autoComplete="address-level2" /></Field>
              <Field label="State">
                <select className="field" value={f.state} onChange={set('state')}>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
              </Field>
              <Field label="PIN code"><input className="field" value={f.pincode} onChange={set('pincode')} required pattern="\d{6}" inputMode="numeric" maxLength={6} autoComplete="postal-code" /></Field>
              <Field label="Order notes (optional)"><input className="field" value={f.notes} onChange={set('notes')} /></Field>
            </div>
            <label className="mt-5 flex items-center gap-3 text-sm">
              <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="h-4 w-4 accent-gold" />
              Add signature gift wrap (₹99)
            </label>
          </section>
          <section>
            <p className="eyebrow mb-5">Payment</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: 'cod', label: 'Cash on delivery', desc: 'Pay when your watch arrives.', icon: Banknote },
                { k: 'upi', label: 'UPI', desc: 'GPay, PhonePe, Paytm or any UPI app.', icon: Smartphone },
              ].map(({ k, label, desc, icon: Icon }) => (
                <button type="button" key={k} onClick={() => setF({ ...f, paymentMethod: k })} className={cx('flex gap-3 border p-4 text-left transition-colors', f.paymentMethod === k ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                  <Icon className="mt-0.5 h-5 w-5 text-primary" />
                  <span><span className="block text-sm">{label}</span><span className="text-xs text-muted-foreground">{desc}</span></span>
                </button>
              ))}
            </div>
            {f.paymentMethod === 'upi' && quote && (
              <div className="mt-4 border border-primary/30 bg-primary/5 p-5 text-sm">
                <p>Pay <span className="text-primary">{formatPrice(quote.total)}</span> to UPI ID <span className="font-medium text-primary">{BRAND.upiId}</span>, then enter the transaction reference (UTR) below.</p>
                <a href={`upi://pay?pa=${BRAND.upiId}&pn=${BRAND.name}&am=${quote.total}&cu=INR`} className="mt-3 inline-block text-[11px] uppercase tracking-[0.2em] text-primary underline sm:hidden">Open UPI app</a>
                <Field label="UPI transaction reference" className="mt-4"><input className="field" value={f.paymentRef} onChange={set('paymentRef')} required /></Field>
              </div>
            )}
          </section>
        </div>
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          {loading && !quote ? <Spinner /> : (
            <Summary quote={quote}>
              <ul className="mt-6 space-y-3 border-t border-border pt-5">
                {lines.map(({ product: p, qty }) => (
                  <li key={p.id} className="flex items-center gap-3 text-sm">
                    <img src={p.image} alt="" className="h-12 w-12 bg-ivory object-contain p-1" />
                    <span className="flex-1 leading-tight">{p.name} <span className="text-muted-foreground">× {qty}</span></span>
                    <span>{formatPrice(p.price * qty)}</span>
                  </li>
                ))}
              </ul>
              {quote?.problems?.length > 0 && <p className="mt-4 text-xs text-destructive">{quote.problems[0].message}</p>}
              <ErrorNote error={err} className="mt-4" />
              <Button className="mt-6 w-full" disabled={busy || !!quote?.problems?.length}>{busy ? 'Placing order…' : `Place order · ${formatPrice(quote?.total)}`}</Button>
            </Summary>
          )}
        </div>
      </form>
    </>
  );
}
