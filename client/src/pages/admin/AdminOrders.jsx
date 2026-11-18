import { useState } from 'react';
import { useApi } from '../../lib/hooks';
import { useStore } from '../../context/StoreContext';
import { api } from '../../lib/api';
import { formatDate, formatPrice } from '../../lib/format';
import { ErrorNote, Spinner, cx } from '../../components/ui';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { toast } = useStore();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const { data, loading, error, reload } = useApi('/orders', { status, q: search });

  const update = async (o, body) => {
    try { await api(`/orders/${o.id}`, { method: 'PATCH', body }); toast(`Order ${o.orderNumber} updated`); reload(); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Orders</h1>
      <div className="flex flex-wrap gap-3">
        <input className="field max-w-xs" placeholder="Order #, name, email, phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {['', ...STATUSES].map((s) => <button key={s} className="chip" data-active={status === s} onClick={() => setStatus(s)}>{s || 'All'}</button>)}
        </div>
      </div>
      {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : !data.orders.length ? <p className="text-sm text-muted-foreground">No orders found.</p> : (
        <div className="divide-y divide-border border border-border">
          {data.orders.map((o) => (
            <div key={o.id}>
              <button onClick={() => setOpenId(openId === o.id ? null : o.id)} className="grid w-full grid-cols-2 gap-3 p-4 text-left text-sm hover:bg-card md:grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr]">
                <span><span className="block font-serif text-base">{o.orderNumber}</span><span className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</span></span>
                <span>{o.customerName}<span className="block text-xs text-muted-foreground">{o.phone}</span></span>
                <span>{formatPrice(o.total)}<span className="block text-xs text-muted-foreground">{o.paymentMethod.toUpperCase()} · {o.paymentStatus}</span></span>
                <span>{o.items.reduce((s, i) => s + i.qty, 0)} item(s)</span>
                <span className={cx('text-[10px] uppercase tracking-[0.2em]', o.status === 'cancelled' ? 'text-destructive' : 'text-primary')}>{o.status}</span>
              </button>
              {openId === o.id && (
                <div className="grid gap-6 border-t border-border bg-card p-5 text-sm md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="eyebrow mb-2">Customer</p>
                    <p>{o.customerName} · {o.email} · {o.phone}</p>
                    <p className="text-muted-foreground">{o.address.line1}{o.address.line2 && `, ${o.address.line2}`}, {o.address.city}, {o.address.state} {o.address.pincode}</p>
                    {o.notes && <p className="text-muted-foreground">Notes: {o.notes}</p>}
                    {o.giftWrap && <p className="text-primary">Gift wrap requested</p>}
                    {o.paymentRef && <p>UPI ref: <span className="text-primary">{o.paymentRef}</span></p>}
                    <ul className="mt-3 space-y-1">{o.items.map((i, k) => <li key={k}>{i.brand} {i.name} × {i.qty} — {formatPrice(i.price * i.qty)}</li>)}</ul>
                    <p className="pt-2">Subtotal {formatPrice(o.subtotal)} · Shipping {formatPrice(o.shipping)} · <span className="text-primary">Total {formatPrice(o.total)}</span></p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="label">Order status</p>
                      <div className="flex flex-wrap gap-2">{STATUSES.map((s) => <button key={s} className="chip" data-active={o.status === s} disabled={o.status === 'cancelled'} onClick={() => s !== o.status && update(o, { status: s })}>{s}</button>)}</div>
                    </div>
                    <div>
                      <p className="label">Payment</p>
                      <div className="flex flex-wrap gap-2">{['pending', 'paid', 'refunded'].map((s) => <button key={s} className="chip" data-active={o.paymentStatus === s} onClick={() => s !== o.paymentStatus && update(o, { paymentStatus: s })}>{s}</button>)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
