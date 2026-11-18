import { Router } from 'express';
import { q, one, mapProduct } from '../db.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';
import { upload, fileUrl } from '../upload.js';

const r = Router();

/* Policies */
r.get('/policies', async (_req, res, next) => {
  try { res.json({ policies: await q('SELECT slug, title, body FROM policies ORDER BY sort_order, id') }); } catch (e) { next(e); }
});

/* Watch Care Hub */
r.get('/care', async (_req, res, next) => {
  try {
    res.json({ articles: await q('SELECT id, slug, title, category, excerpt, read_minutes AS readMinutes, created_at AS createdAt FROM care_articles ORDER BY id') });
  } catch (e) { next(e); }
});
r.get('/care/:slug', async (req, res, next) => {
  try {
    const a = await one('SELECT id, slug, title, category, excerpt, body, read_minutes AS readMinutes FROM care_articles WHERE slug = ?', [req.params.slug]);
    if (!a) return res.status(404).json({ error: 'Article not found.' });
    res.json({ article: a });
  } catch (e) { next(e); }
});

/* Watch Drops */
r.get('/drops', async (_req, res, next) => {
  try {
    const drops = await q('SELECT id, title, description, product_id, release_at AS releaseAt FROM drops ORDER BY release_at');
    const ids = drops.map((d) => d.product_id).filter(Boolean);
    const products = ids.length ? await q(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')})`, ids) : [];
    res.json({
      drops: drops.map((d) => ({
        id: d.id, title: d.title, description: d.description, releaseAt: d.releaseAt,
        product: mapProduct(products.find((p) => p.id === d.product_id)),
      })),
    });
  } catch (e) { next(e); }
});
r.post('/drops/:id/notify', async (req, res, next) => {
  try {
    const contact = String(req.body?.contact || '').trim();
    if (contact.length < 5) return res.status(400).json({ error: 'Enter an email or WhatsApp number.' });
    await q('INSERT IGNORE INTO drop_alerts (drop_id, contact) VALUES (?,?)', [req.params.id, contact]);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

/* Style Board (community) */
r.get('/community', async (_req, res, next) => {
  try {
    const rows = await q(`SELECT c.id, c.author_name AS authorName, c.caption, c.image, c.likes, c.created_at AS createdAt,
      p.slug AS productSlug, p.name AS productName, p.brand AS productBrand
      FROM community_posts c LEFT JOIN products p ON p.id = c.product_id WHERE c.is_approved = 1 ORDER BY c.created_at DESC LIMIT 100`);
    res.json({ posts: rows });
  } catch (e) { next(e); }
});
r.get('/community/:id', async (req, res, next) => {
  try {
    const post = await one(`SELECT c.id, c.author_name AS authorName, c.caption, c.image, c.likes, c.created_at AS createdAt, c.product_id AS productId
      FROM community_posts c WHERE c.id = ? AND c.is_approved = 1`, [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    const product = post.productId ? mapProduct(await one('SELECT * FROM products WHERE id = ?', [post.productId])) : null;
    res.json({ post, product });
  } catch (e) { next(e); }
});
r.post('/community', optionalAuth, upload.single('image'), async (req, res, next) => {
  try {
    const caption = String(req.body?.caption || '').trim();
    const author = req.user?.name || String(req.body?.authorName || '').trim();
    if (!req.file) return res.status(400).json({ error: 'Please add a photo.' });
    if (!caption || !author) return res.status(400).json({ error: 'Please add your name and a caption.' });
    const result = await q('INSERT INTO community_posts (user_id, author_name, caption, image, product_id) VALUES (?,?,?,?,?)',
      [req.user?.id || null, author.slice(0, 120), caption.slice(0, 500), fileUrl(req.file), Number(req.body.productId) || null]);
    res.status(201).json({ id: result.insertId });
  } catch (e) { next(e); }
});
r.post('/community/:id/like', async (req, res, next) => {
  try {
    await q('UPDATE community_posts SET likes = likes + 1 WHERE id = ?', [req.params.id]);
    const p = await one('SELECT likes FROM community_posts WHERE id = ?', [req.params.id]);
    res.json({ likes: p?.likes ?? 0 });
  } catch (e) { next(e); }
});

/* Time Capsule */
r.get('/capsules', requireAuth, async (req, res, next) => {
  try {
    const rows = await q(`SELECT c.id, c.title, c.message, c.open_at AS openAt, c.created_at AS createdAt, p.slug AS productSlug, p.name AS productName, p.image AS productImage
      FROM capsules c LEFT JOIN products p ON p.id = c.product_id WHERE c.user_id = ? ORDER BY c.open_at`, [req.user.id]);
    const today = new Date();
    res.json({
      capsules: rows.map((c) => {
        const locked = new Date(c.openAt) > today;
        return { ...c, locked, message: locked ? null : c.message };
      }),
    });
  } catch (e) { next(e); }
});
r.post('/capsules', requireAuth, async (req, res, next) => {
  try {
    const { title, message, openAt, productId } = req.body || {};
    if (!title?.trim() || !message?.trim() || !openAt) return res.status(400).json({ error: 'Add a title, a message and an opening date.' });
    if (new Date(openAt) <= new Date()) return res.status(400).json({ error: 'The opening date must be in the future.' });
    await q('INSERT INTO capsules (user_id, title, message, product_id, open_at) VALUES (?,?,?,?,?)',
      [req.user.id, title.trim().slice(0, 190), message.trim(), Number(productId) || null, openAt]);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

/* Partners */
r.post('/partners', async (req, res, next) => {
  try {
    const { name, business, email, phone, city, partnerType, message } = req.body || {};
    if (![name, business, email, phone].every((v) => String(v || '').trim())) return res.status(400).json({ error: 'Please fill in your name, business, email and phone.' });
    await q('INSERT INTO partners (name, business, email, phone, city, partner_type, message) VALUES (?,?,?,?,?,?,?)',
      [name.trim(), business.trim(), email.trim(), phone.trim(), city?.trim() || null, partnerType || null, message?.trim() || null]);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

/* ---------------- Admin ---------------- */

r.get('/admin/stats', requireAdmin, async (_req, res, next) => {
  try {
    const [rev] = await q("SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders FROM orders WHERE status <> 'cancelled'");
    const [pending] = await q("SELECT COUNT(*) AS n FROM orders WHERE status IN ('placed','confirmed')");
    const [customers] = await q("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'");
    const [products] = await q('SELECT COUNT(*) AS n FROM products');
    const lowStock = await q("SELECT id, name, brand, stock, stock_status AS stockStatus FROM products WHERE stock_status IN ('low_stock','out_of_stock') ORDER BY stock");
    const [partners] = await q("SELECT COUNT(*) AS n FROM partners WHERE status = 'new'");
    const daily = await q(`SELECT DATE(created_at) AS day, SUM(total) AS revenue, COUNT(*) AS orders FROM orders
      WHERE status <> 'cancelled' AND created_at >= CURDATE() - INTERVAL 13 DAY GROUP BY DATE(created_at) ORDER BY day`);
    const top = await q(`SELECT name, brand, SUM(qty) AS sold, SUM(qty*price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled' GROUP BY name, brand ORDER BY sold DESC LIMIT 5`);
    res.json({
      revenue: Number(rev.revenue), orders: rev.orders, pendingOrders: pending.n, customers: customers.n, products: products.n,
      newPartners: partners.n, lowStock, daily, topProducts: top,
    });
  } catch (e) { next(e); }
});

r.get('/admin/customers', requireAdmin, async (_req, res, next) => {
  try {
    res.json({
      customers: await q(`SELECT u.id, u.name, u.email, u.phone, u.points, u.role, u.created_at AS createdAt,
        COUNT(o.id) AS orders, COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total END),0) AS spent
        FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`),
    });
  } catch (e) { next(e); }
});

r.get('/admin/partners', requireAdmin, async (_req, res, next) => {
  try { res.json({ partners: await q('SELECT * FROM partners ORDER BY created_at DESC') }); } catch (e) { next(e); }
});
r.patch('/admin/partners/:id', requireAdmin, async (req, res, next) => {
  try {
    await q('UPDATE partners SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.get('/admin/community', requireAdmin, async (_req, res, next) => {
  try { res.json({ posts: await q('SELECT id, author_name AS authorName, caption, image, likes, is_approved AS isApproved, created_at AS createdAt FROM community_posts ORDER BY created_at DESC') }); } catch (e) { next(e); }
});
r.patch('/admin/community/:id', requireAdmin, async (req, res, next) => {
  try {
    await q('UPDATE community_posts SET is_approved = ? WHERE id = ?', [req.body.isApproved ? 1 : 0, req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
r.delete('/admin/community/:id', requireAdmin, async (req, res, next) => {
  try { await q('DELETE FROM community_posts WHERE id = ?', [req.params.id]); res.json({ ok: true }); } catch (e) { next(e); }
});

r.post('/admin/drops', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, productId, releaseAt } = req.body || {};
    if (!title || !releaseAt) return res.status(400).json({ error: 'Title and release date are required.' });
    await q('INSERT INTO drops (title, description, product_id, release_at) VALUES (?,?,?,?)', [title, description || null, Number(productId) || null, new Date(releaseAt)]);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});
r.delete('/admin/drops/:id', requireAdmin, async (req, res, next) => {
  try { await q('DELETE FROM drops WHERE id = ?', [req.params.id]); res.json({ ok: true }); } catch (e) { next(e); }
});

r.put('/admin/policies/:slug', requireAdmin, async (req, res, next) => {
  try {
    const { title, body } = req.body || {};
    await q('INSERT INTO policies (slug, title, body) VALUES (?,?,?) ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body)', [req.params.slug, title, body]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.post('/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  res.status(201).json({ url: fileUrl(req.file) });
});

export default r;
