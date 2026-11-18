import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Handshake, Image, FileText } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useApi, useTitle } from '../../lib/hooks';
import { formatPrice } from '../../lib/format';
import { ErrorNote, Spinner, cx } from '../../components/ui';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import { AdminCustomers, AdminPartners, AdminCommunity, AdminContent } from './AdminMisc';

const TABS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/partners', label: 'Partners', icon: Handshake },
  { to: '/admin/community', label: 'Style Board', icon: Image },
  { to: '/admin/content', label: 'Drops & Policies', icon: FileText },
];

export default function Admin() {
  useTitle('Admin');
  const { user, authReady } = useStore();
  if (!authReady) return <Spinner />;
  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (user.role !== 'admin') return <div className="container-x py-20"><ErrorNote error={{ message: 'Admin access required.' }} /></div>;

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="eyebrow mb-4">Admin</p>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cx('flex shrink-0 items-center gap-2.5 px-3 py-2.5 text-sm transition-colors', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}>
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="community" element={<AdminCommunity />} />
          <Route path="content" element={<AdminContent />} />
        </Routes>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, loading, error } = useApi('/admin/stats');
  if (loading) return <Spinner />;
  if (error) return <ErrorNote error={error} />;
  const tiles = [
    ['Revenue', formatPrice(data.revenue)], ['Orders', data.orders], ['To fulfil', data.pendingOrders],
    ['Customers', data.customers], ['Products', data.products], ['New partner requests', data.newPartners],
  ];
  const max = Math.max(1, ...data.daily.map((d) => Number(d.revenue)));
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-4xl">Dashboard</h1>
      <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-3">
        {tiles.map(([k, v]) => (
          <div key={k} className="bg-background p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</p>
            <p className="mt-2 font-serif text-3xl">{v}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="border border-border p-5">
          <p className="eyebrow mb-5">Revenue · last 14 days</p>
          {!data.daily.length ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
            <div className="flex h-40 items-end gap-1.5">
              {data.daily.map((d) => (
                <div key={d.day} className="group relative flex-1">
                  <div className="bg-primary/70 transition-colors group-hover:bg-primary" style={{ height: `${(Number(d.revenue) / max) * 150}px` }} />
                  <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap bg-popover px-1.5 py-0.5 text-[10px] group-hover:block">{formatPrice(d.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="border border-border p-5">
          <p className="eyebrow mb-5">Top sellers</p>
          {!data.topProducts.length ? <p className="text-sm text-muted-foreground">No sales yet.</p> : (
            <ul className="space-y-2 text-sm">{data.topProducts.map((t) => <li key={t.name} className="flex justify-between"><span>{t.brand} {t.name}</span><span className="text-muted-foreground">{t.sold} sold</span></li>)}</ul>
          )}
        </section>
      </div>
      <section className="border border-border p-5">
        <p className="eyebrow mb-5">Stock alerts</p>
        {!data.lowStock.length ? <p className="text-sm text-muted-foreground">All stock levels healthy.</p> : (
          <ul className="space-y-2 text-sm">{data.lowStock.map((p) => <li key={p.id} className="flex justify-between"><span>{p.brand} {p.name}</span><span className={p.stockStatus === 'out_of_stock' ? 'text-destructive' : 'text-primary'}>{p.stock} left</span></li>)}</ul>
        )}
      </section>
    </div>
  );
}
