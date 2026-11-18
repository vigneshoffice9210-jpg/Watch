import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { q, one } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const r = Router();

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, points: u.points });

r.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const exists = await one('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });
    const hash = await bcrypt.hash(password, 10);
    const result = await q('INSERT INTO users (name, email, phone, password_hash) VALUES (?,?,?,?)',
      [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, hash]);
    const user = await one('SELECT * FROM users WHERE id = ?', [result.insertId]);
    // Attach earlier guest orders placed with this email
    await q('UPDATE orders SET user_id = ? WHERE user_id IS NULL AND email = ?', [user.id, user.email]);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

r.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await one('SELECT * FROM users WHERE email = ?', [String(email || '').trim().toLowerCase()]);
    if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

r.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await one('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    res.json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

r.put('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, phone } = req.body || {};
    await q('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [name?.trim() || null, phone?.trim() || null, req.user.id]);
    const user = await one('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

export default r;
