import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useApi, useTitle } from '../lib/hooks';
import { api } from '../lib/api';
import { formatDate, formatPrice } from '../lib/format';
import { Button, Empty, ErrorNote, Field, PageHeader, Spinner, cx } from '../components/ui';

const STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

export function OrderCard({ order, onCancel }) {
  const idx = STEPS.indexOf(order.status);
  return (
    <article className="border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Order</p>
          <p className="font-serif text-xl">{order.orderNumber}</p>
        </div>
        <div className="text-right text-sm">
          <p>{formatPrice(order.total)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)} · {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'UPI'} ({order.paymentStatus})</p>
        </div>
      </header>
      <div className="px-5 py-5">
        {order.status === 'cancelled' ? (
          <p className="text-xs uppercase tracking-[0.2em] text-destructive">Cancelled</p>
        ) : (
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => (
              <li key={s}>
                <div className={cx('h-0.5', i <= idx ? 'bg-primary' : 'bg-border')} />
                <p className={cx('mt-2 text-[9px] uppercase tracking-[0.18em] sm:text-[10px]', i <= idx ? 'text-primary' : 'text-muted-foreground')}>{s}</p>
              </li>
            ))}
          </ol>
        )}
        <ul className="mt-5 space-y-3">
          {order.items.map((i, k) => (
            <li key={k} className="flex items-center gap-3 text-sm">
              {i.image && <img src={i.image} alt="" className="h-14 w-14 bg-ivory object-contain p-1" />}
              <span className="flex-1"><span className="block text-[9px] uppercase tracking-[0.2em] text-primary">{i.brand}</span>{i.name} <span className="text-muted-foreground">× {i.qty}</span></span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted-foreground">
          Delivering to {order.customerName}, {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} {order.address.pincode}
        </p>
        {onCancel && ['placed', 'confirmed'].includes(order.status) && (
          <button onClick={() => onCancel(order)} className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive">Cancel order</button>
        )}
      </div>
    </article>
  );
}

function TrackForm() {
  const [f, setF] = useState({ orderNumber: '', phone: '' });
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setOrder(null);
    try { setOrder((await api('/orders/track', { params: f })).order); } catch (e2) { setErr(e2); }
  };
  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="grid gap-4 border border-border p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Order number"><input className="field" placeholder="EVR-…" value={f.orderNumber} onChange={(e) => setF({ ...f, orderNumber: e.target.value })} required /></Field>
        <Field label="Phone number"><input className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required /></Field>
        <Button>Track</Button>
      </form>
      <ErrorNote error={err} />
      {order && <OrderCard order={order} />}
    </div>
  );
}

export default function Orders() {
  useTitle('My orders');
  const { user, authReady, toast } = useStore();
  const { data, loading, error, reload } = useApi(user ? '/orders/mine' : null);

  const cancel = async (o) => {
    if (!window.confirm(`Cancel order ${o.orderNumber}?`)) return;
    try { await api(`/orders/${o.id}/cancel`, { method: 'POST' }); toast('Order cancelled'); reload(); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <>
      <PageHeader eyebrow="My orders" lines={['YOUR', 'ORDERS.']}>Track deliveries and review past purchases.</PageHeader>
      <div className="container-x max-w-4xl py-10">
        {!authReady ? <Spinner /> : !user ? (
          <div className="space-y-8">
            <p className="text-sm text-muted-foreground"><Link to="/auth?next=/orders" className="text-primary hover:underline">Sign in</Link> to see all your orders, or track one below.</p>
            <TrackForm />
          </div>
        ) : loading ? <Spinner /> : error ? <ErrorNote error={error} /> : !data.orders.length ? (
          <Empty title="No orders yet" action={<Button to="/collection">Explore collection</Button>}>When you place an order, it will appear here.</Empty>
        ) : (
          <div className="space-y-6">{data.orders.map((o, i) => <div key={o.id} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }}><OrderCard order={o} onCancel={cancel} /></div>)}</div>
        )}
      </div>
    </>
  );
}
