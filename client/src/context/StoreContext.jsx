import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';

const StoreContext = createContext(null);

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => load('everentia.cart', []));
  const [favorites, setFavorites] = useState(() => load('everentia.favorites', []));
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  useEffect(() => save('everentia.cart', cart), [cart]);
  useEffect(() => save('everentia.favorites', favorites), [favorites]);

  useEffect(() => {
    if (!getToken()) { setAuthReady(true); return; }
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setAuthReady(true));
  }, []);

  const toast = useCallback((message, tone = 'default') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback((productId, qty = 1, { silent } = {}) => {
    setCart((c) => {
      const found = c.find((i) => i.productId === productId);
      if (found) return c.map((i) => (i.productId === productId ? { ...i, qty: Math.min(10, i.qty + qty) } : i));
      return [...c, { productId, qty }];
    });
    if (!silent) toast('Added to your selection');
  }, [toast]);

  const setQty = useCallback((productId, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((i) => i.productId !== productId) : c.map((i) => (i.productId === productId ? { ...i, qty: Math.min(10, qty) } : i))));
  }, []);
  const removeFromCart = useCallback((productId) => setCart((c) => c.filter((i) => i.productId !== productId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);
  const toggleFavorite = useCallback((id) => {
    setFavorites((f) => {
      const has = f.includes(id);
      toast(has ? 'Removed from saved watches' : 'Saved to your watches');
      return has ? f.filter((x) => x !== id) : [...f, id];
    });
  }, [toast]);

  const login = useCallback(async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);
  const register = useCallback(async (payload) => {
    const d = await api('/auth/register', { method: 'POST', body: payload });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    toast('Signed out');
  }, [toast]);
  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    const d = await api('/auth/me').catch(() => null);
    if (d) setUser(d.user);
  }, []);

  const value = useMemo(() => ({
    cart, cartCount: cart.reduce((s, i) => s + i.qty, 0), addToCart, setQty, removeFromCart, clearCart,
    favorites, isFavorite, toggleFavorite,
    user, authReady, login, register, logout, refreshUser,
    toast, toasts,
  }), [cart, addToCart, setQty, removeFromCart, clearCart, favorites, isFavorite, toggleFavorite, user, authReady, login, register, logout, refreshUser, toast, toasts]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
