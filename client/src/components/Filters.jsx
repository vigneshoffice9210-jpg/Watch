import { useApi } from '../lib/hooks';
import { TYPE_LABELS } from '../lib/format';

/** Brand / type / availability / sort dropdowns shared by Collection and Budget pages. */
export default function Filters({ value, onChange, showSearch = true }) {
  const meta = useApi('/products/meta');
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const active = value.q || value.brand || value.type || value.availability || value.gender;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showSearch && (
        <input className="field max-w-xs" placeholder="Search watches…" value={value.q || ''} onChange={set('q')} aria-label="Search watches" />
      )}
      <select className="field w-auto" value={value.brand || ''} onChange={set('brand')} aria-label="Brand">
        <option value="">All brands</option>
        {meta.data?.brands.map((b) => <option key={b.brand} value={b.brand}>{b.brand} ({b.count})</option>)}
      </select>
      <select className="field w-auto" value={value.type || ''} onChange={set('type')} aria-label="Type">
        <option value="">All types</option>
        {meta.data?.types.map((t) => <option key={t.type} value={t.type}>{TYPE_LABELS[t.type] || t.type} ({t.count})</option>)}
      </select>
      <select className="field w-auto" value={value.gender || ''} onChange={set('gender')} aria-label="For">
        <option value="">Everyone</option>
        <option value="men">Men</option>
        <option value="women">Women</option>
      </select>
      <select className="field w-auto" value={value.availability || ''} onChange={set('availability')} aria-label="Availability">
        <option value="">Any availability</option>
        <option value="in_stock">In stock</option>
        <option value="preorder">Pre-order</option>
      </select>
      <select className="field w-auto" value={value.sort || 'featured'} onChange={set('sort')} aria-label="Sort">
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="name">Name</option>
      </select>
      {active && (
        <button onClick={() => onChange({ sort: value.sort })} className="text-[11px] uppercase tracking-[0.2em] text-primary hover:underline">Clear filters</button>
      )}
    </div>
  );
}
