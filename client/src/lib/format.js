const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatPrice = (n) => (n == null ? '' : inr.format(Number(n)));

export const discountPercent = (price, mrp) => {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const stockLabel = (p) => ({
  in_stock: 'In stock',
  low_stock: 'Low stock',
  preorder: 'Available to pre-order',
  out_of_stock: 'Out of stock',
}[p.stockStatus] || '');

export const canBuy = (p) => p && p.stockStatus !== 'out_of_stock';

export const TYPE_LABELS = { classic: 'Classic', sport: 'Sport', statement: 'Statement', dress: 'Dress', smart: 'Smart' };

export const BUDGETS = [
  { key: 'all', label: 'All' },
  { key: 'u500', label: 'Under ₹500', max: 500 },
  { key: '500-1000', label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { key: '1000-2000', label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
  { key: '2000-5000', label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { key: '5000+', label: 'Above ₹5,000', min: 5000 },
];

export const inBudget = (price, b) => (b.min == null || price >= b.min) && (b.max == null || price < b.max);

export const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
