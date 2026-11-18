import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'everentia',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  dateStrings: false,
});

/** Run a query and return rows. */
export async function q(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function one(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] || null;
}

function parseJson(v, fallback) {
  if (v == null) return fallback;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return fallback; }
  }
  return v;
}

/** DB row -> API product shape (camelCase, matches the frontend). */
export function mapProduct(r) {
  if (!r) return null;
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    type: r.type,
    gender: r.gender,
    price: Number(r.price),
    mrp: r.mrp == null ? null : Number(r.mrp),
    stock: r.stock,
    stockStatus: r.stock_status,
    description: r.description,
    specs: parseJson(r.specs, {}),
    tags: parseJson(r.tags, []),
    image: r.image,
    tryOnImage: r.try_on_image,
    images: parseJson(r.images, r.image ? [r.image] : []),
    isFeatured: !!r.is_featured,
    isNew: !!r.is_new,
    isVault: !!r.is_vault,
    isActive: !!r.is_active,
    createdAt: r.created_at,
  };
}

/** Derive stock status from a stock count, keeping pre-order as an explicit choice. */
export function deriveStockStatus(stock, current) {
  if (current === 'preorder') return 'preorder';
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 3) return 'low_stock';
  return 'in_stock';
}
