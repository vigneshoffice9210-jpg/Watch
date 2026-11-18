import { Router } from 'express';
import { q, one, mapProduct, deriveStockStatus } from '../db.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';
import { upload, fileUrl } from '../upload.js';

const r = Router();

const SORTS = {
  featured: 'is_featured DESC, created_at DESC',
  newest: 'created_at DESC',
  'price-asc': 'price ASC',
  'price-desc': 'price DESC',
  name: 'name ASC',
};

/**
 * GET /api/products
 * Filters: q, brand, type, gender, minPrice, maxPrice, availability (in_stock|preorder|any),
 *          featured, isNew, vault, tryOn, ids (comma list), sort, limit, includeInactive (admin)
 */
r.get('/', optionalAuth, async (req, res, next) => {
  try {
    const f = req.query;
    const where = [];
    const params = [];
    if (!(f.includeInactive && req.user?.role === 'admin')) where.push('is_active = 1');
    if (f.q) {
      where.push('(name LIKE ? OR brand LIKE ? OR description LIKE ?)');
      params.push(`%${f.q}%`, `%${f.q}%`, `%${f.q}%`);
    }
    if (f.brand) { where.push('brand = ?'); params.push(f.brand); }
    if (f.type) { where.push('type = ?'); params.push(f.type); }
    if (f.gender) { where.push("(gender = ? OR gender = 'unisex')"); params.push(f.gender); }
    if (f.minPrice) { where.push('price >= ?'); params.push(Number(f.minPrice)); }
    if (f.maxPrice) { where.push('price < ?'); params.push(Number(f.maxPrice)); }
    if (f.availability === 'in_stock') where.push("stock_status IN ('in_stock','low_stock')");
    if (f.availability === 'preorder') where.push("stock_status = 'preorder'");
    if (f.featured === '1') where.push('is_featured = 1');
    if (f.isNew === '1') where.push('is_new = 1');
    if (f.vault === '1') where.push('is_vault = 1');
    if (f.tryOn === '1') where.push('try_on_image IS NOT NULL');
    if (f.ids) {
      const ids = String(f.ids).split(',').map(Number).filter(Boolean);
      if (!ids.length) return res.json({ products: [] });
      where.push(`id IN (${ids.map(() => '?').join(',')})`);
      params.push(...ids);
    }
    const order = SORTS[f.sort] || SORTS.featured;
    const limit = Math.min(Number(f.limit) || 200, 500);
    const rows = await q(
      `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order} LIMIT ?`,
      [...params, limit],
    );
    res.json({ products: rows.map(mapProduct) });
  } catch (e) { next(e); }
});

/** GET /api/products/meta — brands, types and price range for filter UIs. */
r.get('/meta', async (_req, res, next) => {
  try {
    const brands = await q('SELECT brand, COUNT(*) AS count FROM products WHERE is_active = 1 GROUP BY brand ORDER BY brand');
    const types = await q('SELECT type, COUNT(*) AS count FROM products WHERE is_active = 1 GROUP BY type ORDER BY type');
    res.json({ brands, types });
  } catch (e) { next(e); }
});

/** GET /api/products/:slug — product with related items and reviews. */
r.get('/:slug', async (req, res, next) => {
  try {
    const row = await one('SELECT * FROM products WHERE (slug = ? OR id = ?) AND is_active = 1', [req.params.slug, Number(req.params.slug) || 0]);
    if (!row) return res.status(404).json({ error: 'This timepiece could not be found.' });
    const related = await q(
      'SELECT * FROM products WHERE id <> ? AND is_active = 1 ORDER BY (type = ?) DESC, (brand = ?) DESC, ABS(price - ?) ASC LIMIT 4',
      [row.id, row.type, row.brand, row.price],
    );
    const reviews = await q('SELECT id, author_name AS authorName, rating, comment, created_at AS createdAt FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [row.id]);
    res.json({ product: mapProduct(row), related: related.map(mapProduct), reviews });
  } catch (e) { next(e); }
});

r.post('/:id/reviews', optionalAuth, async (req, res, next) => {
  try {
    const { rating, comment, authorName } = req.body || {};
    const n = Number(rating);
    if (!(n >= 1 && n <= 5) || !comment?.trim()) return res.status(400).json({ error: 'Please add a rating and a comment.' });
    const name = req.user?.name || authorName?.trim() || 'Guest';
    await q('INSERT INTO reviews (product_id, user_id, author_name, rating, comment) VALUES (?,?,?,?,?)',
      [Number(req.params.id), req.user?.id || null, name, n, comment.trim().slice(0, 1000)]);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

/* ---------------- Admin ---------------- */

const imageFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'tryOnImage', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
]);

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 180);
}

function productFromBody(body, files, existing = {}) {
  const bool = (v, d) => (v === undefined ? d : v === true || v === 'true' || v === '1' || v === 1);
  const num = (v, d) => (v === undefined || v === '' ? d : Number(v));
  const json = (v, d) => {
    if (v === undefined) return d;
    if (typeof v !== 'string') return v;
    try { return JSON.parse(v); } catch { return d; }
  };
  // An uploaded file wins; otherwise a URL field that was sent (even empty) replaces the stored value.
  const pick = (file, url, current) => fileUrl(file) || (url !== undefined ? (String(url).trim() || null) : current || null);
  const image = pick(files?.image?.[0], body.imageUrl, existing.image);
  const tryOn = pick(files?.tryOnImage?.[0], body.tryOnImageUrl, existing.try_on_image);
  const gallery = (files?.gallery || []).map(fileUrl);
  let images = (json(body.images, null) ?? json(existing.images, null) ?? []).filter((src) => src && src !== existing.image);
  if (gallery.length) images = [...images, ...gallery];
  if (image) images = [image, ...images.filter((src) => src !== image)];
  const stock = num(body.stock, existing.stock ?? 0);
  const requested = body.stockStatus || existing.stock_status || 'in_stock';
  return {
    slug: body.slug ? slugify(body.slug) : existing.slug || slugify(`${body.brand}-${body.name}`),
    name: body.name ?? existing.name,
    brand: body.brand ?? existing.brand,
    type: body.type ?? existing.type ?? 'classic',
    gender: body.gender ?? existing.gender ?? 'unisex',
    price: num(body.price, existing.price),
    mrp: body.mrp === '' ? null : num(body.mrp, existing.mrp ?? null),
    stock,
    stock_status: requested === 'preorder' ? 'preorder' : (body.stockStatus && body.stockStatus !== 'auto' ? body.stockStatus : deriveStockStatus(stock, requested)),
    description: body.description ?? existing.description ?? '',
    specs: JSON.stringify(json(body.specs, null) ?? json(existing.specs, {}) ?? {}),
    tags: JSON.stringify(json(body.tags, null) ?? json(existing.tags, []) ?? []),
    image,
    try_on_image: tryOn,
    images: JSON.stringify(images),
    is_featured: bool(body.isFeatured, !!existing.is_featured) ? 1 : 0,
    is_new: bool(body.isNew, !!existing.is_new) ? 1 : 0,
    is_vault: bool(body.isVault, !!existing.is_vault) ? 1 : 0,
    is_active: bool(body.isActive, existing.is_active === undefined ? true : !!existing.is_active) ? 1 : 0,
  };
}

r.post('/', requireAdmin, imageFields, async (req, res, next) => {
  try {
    const p = productFromBody(req.body, req.files);
    if (!p.name || !p.brand || !(p.price > 0)) return res.status(400).json({ error: 'Name, brand and price are required.' });
    const result = await q('INSERT INTO products SET ?', [p]);
    res.status(201).json({ product: mapProduct(await one('SELECT * FROM products WHERE id = ?', [result.insertId])) });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A product with this slug already exists.' });
    next(e);
  }
});

r.put('/:id', requireAdmin, imageFields, async (req, res, next) => {
  try {
    const existing = await one('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Product not found.' });
    const p = productFromBody(req.body, req.files, existing);
    await q('UPDATE products SET ? WHERE id = ?', [p, existing.id]);
    res.json({ product: mapProduct(await one('SELECT * FROM products WHERE id = ?', [existing.id])) });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A product with this slug already exists.' });
    next(e);
  }
});

r.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await q('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
