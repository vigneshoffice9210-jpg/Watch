import { Router } from 'express';
import crypto from 'node:crypto';
import { pool, q, one, deriveStockStatus } from '../db.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';

const r = Router();

const FREE_ABOVE = () => Number(process.env.FREE_SHIPPING_ABOVE || 999);
const FEE = () => Number(process.env.SHIPPING_FEE || 79);
const GIFT_WRAP_FEE = 99;

async function withItems(orders) {
  if (!orders.length) return [];
  const ids = orders.map((o) => o.id);
  const items = await q(`SELECT * FROM order_items WHERE order_id IN (${ids.map(() => '?').join(',')})`, ids);
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    customerName: o.customer_name,
    email: o.email,
    phone: o.phone,
    address: { line1: o.address_line1, line2: o.address_line2, city: o.city, state: o.state, pincode: o.pincode },
    notes: o.notes,
    giftWrap: !!o.gift_wrap,
    subtotal: o.subtotal,
    shipping: o.shipping,
    discount: o.discount,
    total: o.total,
    paymentMethod: o.payment_method,
    paymentRef: o.payment_ref,
    paymentStatus: o.payment_status,
    status: o.status,
    createdAt: o.created_at,
    items: items.filter((i) => i.order_id === o.id).map((i) => ({
      productId: i.product_id, name: i.name, brand: i.brand, image: i.image, price: i.price, qty: i.qty,
    })),
  }));
}

/** POST /api/orders/quote — price the cart server-side (used by the cart & checkout pages). */
r.post('/quote', async (req, res, next) => {
  try {
    res.json(await quote(req.body?.items || [], !!req.body?.giftWrap));
  } catch (e) { next(e); }
});

async function quote(items, giftWrap) {
  const clean = items.map((i) => ({ productId: Number(i.productId), qty: Math.max(1, Math.min(10, Number(i.qty) || 1)) })).filter((i) => i.productId);
  if (!clean.length) return { lines: [], subtotal: 0, shipping: 0, giftWrap: 0, total: 0, problems: [] };
  const ids = clean.map((i) => i.productId);
  const products = await q(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')}) AND is_active = 1`, ids);
  const problems = [];
  const lines = [];
  for (const i of clean) {
    const p = products.find((x) => x.id === i.productId);
    if (!p) { problems.push({ productId: i.productId, message: 'This watch is no longer available.' }); continue; }
    if (p.stock_status === 'out_of_stock') { problems.push({ productId: p.id, message: `${p.name} is out of stock.` }); continue; }
    if (p.stock_status !== 'preorder' && p.stock < i.qty) {
      problems.push({ productId: p.id, message: `Only ${p.stock} left of ${p.name}.` });
      continue;
    }
    lines.push({ product: p, qty: i.qty, lineTotal: Number(p.price) * i.qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_ABOVE() ? 0 : FEE();
  const wrap = giftWrap && subtotal > 0 ? GIFT_WRAP_FEE : 0;
  return {
    lines: lines.map((l) => ({ productId: l.product.id, qty: l.qty, price: Number(l.product.price), lineTotal: l.lineTotal })),
    subtotal, shipping, giftWrap: wrap, total: subtotal + shipping + wrap, problems, freeShippingAbove: FREE_ABOVE(),
    _lines: lines,
  };
}

/** POST /api/orders — place an order (guest or signed-in). */
r.post('/', optionalAuth, async (req, res, next) => {
  const b = req.body || {};
  const required = ['customerName', 'email', 'phone', 'line1', 'city', 'state', 'pincode'];
  const missing = required.filter((k) => !String(b[k] || '').trim());
  if (missing.length) return res.status(400).json({ error: 'Please complete all delivery details.', fields: missing });
  if (!/^\d{6}$/.test(String(b.pincode).trim())) return res.status(400).json({ error: 'Please enter a valid 6-digit PIN code.' });
  if (!['cod', 'upi'].includes(b.paymentMethod)) return res.status(400).json({ error: 'Please choose a payment method.' });
  if (b.paymentMethod === 'upi' && !String(b.paymentRef || '').trim()) return res.status(400).json({ error: 'Please enter your UPI transaction reference.' });

  let conn;
  try {
    const priced = await quote(b.items || [], !!b.giftWrap);
    if (priced.problems.length) return res.status(409).json({ error: priced.problems[0].message, problems: priced.problems });
    if (!priced._lines.length) return res.status(400).json({ error: 'Your selection is empty.' });

    conn = await pool.getConnection();
    await conn.beginTransaction();

    // Lock and re-check stock
    for (const l of priced._lines) {
      const [[p]] = await conn.query('SELECT stock, stock_status FROM products WHERE id = ? FOR UPDATE', [l.product.id]);
      if (p.stock_status !== 'preorder' && p.stock < l.qty) {
        await conn.rollback();
        return res.status(409).json({ error: `Only ${p.stock} left of ${l.product.name}.` });
      }
      const newStock = p.stock_status === 'preorder' ? p.stock : p.stock - l.qty;
      await conn.query('UPDATE products SET stock = ?, stock_status = ? WHERE id = ?', [newStock, deriveStockStatus(newStock, p.stock_status), l.product.id]);
    }

    const orderNumber = `EVR-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const [result] = await conn.query(
      `INSERT INTO orders (order_number, user_id, customer_name, email, phone, address_line1, address_line2, city, state, pincode, notes, gift_wrap,
        subtotal, shipping, discount, total, payment_method, payment_ref) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [orderNumber, req.user?.id || null, b.customerName.trim(), b.email.trim().toLowerCase(), b.phone.trim(), b.line1.trim(), b.line2?.trim() || null,
        b.city.trim(), b.state.trim(), String(b.pincode).trim(), b.notes?.trim() || null, b.giftWrap ? 1 : 0,
        priced.subtotal, priced.shipping, 0, priced.total, b.paymentMethod, b.paymentRef?.trim() || null],
    );
    for (const l of priced._lines) {
      await conn.query('INSERT INTO order_items (order_id, product_id, name, brand, image, price, qty) VALUES (?,?,?,?,?,?,?)',
        [result.insertId, l.product.id, l.product.name, l.product.brand, l.product.image, l.product.price, l.qty]);
    }
    // Rewards: 1 point per ₹100
    if (req.user?.id) await conn.query('UPDATE users SET points = points + ? WHERE id = ?', [Math.floor(priced.subtotal / 100), req.user.id]);
    await conn.commit();

    const [order] = await withItems(await q('SELECT * FROM orders WHERE id = ?', [result.insertId]));
    res.status(201).json({ order });
  } catch (e) {
    if (conn) await conn.rollback().catch(() => {});
    next(e);
  } finally {
    conn?.release();
  }
});

/** GET /api/orders/mine */
r.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await q('SELECT * FROM orders WHERE user_id = ? OR (user_id IS NULL AND email = ?) ORDER BY created_at DESC', [req.user.id, req.user.email]);
    res.json({ orders: await withItems(orders) });
  } catch (e) { next(e); }
});

/** GET /api/orders/track?orderNumber=...&phone=... — guest lookup */
r.get('/track', async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.query;
    const digits = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!orderNumber || digits.length < 10) return res.status(400).json({ error: 'Enter your order number and phone number.' });
    const orders = await q("SELECT * FROM orders WHERE order_number = ? AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', ''), 10) = ?", [String(orderNumber).trim().toUpperCase(), digits]);
    if (!orders.length) return res.status(404).json({ error: 'No order matches those details.' });
    res.json({ order: (await withItems(orders))[0] });
  } catch (e) { next(e); }
});

/** Customer cancels an order that hasn't shipped. */
r.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const o = await one('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!o) return res.status(404).json({ error: 'Order not found.' });
    if (!['placed', 'confirmed'].includes(o.status)) return res.status(400).json({ error: 'This order can no longer be cancelled.' });
    await restock(o.id);
    await q("UPDATE orders SET status = 'cancelled' WHERE id = ?", [o.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/** Called when an order is cancelled: returns stock and takes back the reward points it earned. */
async function restock(orderId) {
  const order = await one('SELECT user_id, subtotal FROM orders WHERE id = ?', [orderId]);
  if (order?.user_id) {
    await q('UPDATE users SET points = GREATEST(0, points - ?) WHERE id = ?', [Math.floor(Number(order.subtotal) / 100), order.user_id]);
  }
  const items = await q('SELECT product_id, qty FROM order_items WHERE order_id = ? AND product_id IS NOT NULL', [orderId]);
  for (const i of items) {
    const p = await one('SELECT stock, stock_status FROM products WHERE id = ?', [i.product_id]);
    if (!p || p.stock_status === 'preorder') continue;
    const s = p.stock + i.qty;
    await q('UPDATE products SET stock = ?, stock_status = ? WHERE id = ?', [s, deriveStockStatus(s, p.stock_status), i.product_id]);
  }
}

/* ---------------- Admin ---------------- */

r.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { status, q: search } = req.query;
    const where = [];
    const params = [];
    if (status) { where.push('status = ?'); params.push(status); }
    if (search) { where.push('(order_number LIKE ? OR customer_name LIKE ? OR email LIKE ? OR phone LIKE ?)'); params.push(...Array(4).fill(`%${search}%`)); }
    const orders = await q(`SELECT * FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 500`, params);
    res.json({ orders: await withItems(orders) });
  } catch (e) { next(e); }
});

r.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const o = await one('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!o) return res.status(404).json({ error: 'Order not found.' });
    const { status, paymentStatus } = req.body || {};
    if (status === 'cancelled' && o.status !== 'cancelled') await restock(o.id);
    await q('UPDATE orders SET status = COALESCE(?, status), payment_status = COALESCE(?, payment_status) WHERE id = ?', [status || null, paymentStatus || null, o.id]);
    const [order] = await withItems(await q('SELECT * FROM orders WHERE id = ?', [o.id]));
    res.json({ order });
  } catch (e) { next(e); }
});

export default r;
