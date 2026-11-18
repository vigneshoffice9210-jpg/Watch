import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from './api';

/** Resolves cart items to product details and a server-side price quote. */
export function useCartDetails(giftWrap = false) {
  const { cart } = useStore();
  const [state, setState] = useState({ loading: true, lines: [], quote: null, error: null });
  const key = JSON.stringify(cart) + giftWrap;

  useEffect(() => {
    let alive = true;
    if (!cart.length) { setState({ loading: false, lines: [], quote: null, error: null }); return; }
    setState((s) => ({ ...s, loading: true }));
    Promise.all([
      api('/products', { params: { ids: cart.map((i) => i.productId).join(',') } }),
      api('/orders/quote', { method: 'POST', body: { items: cart, giftWrap } }),
    ])
      .then(([{ products }, quote]) => {
        if (!alive) return;
        const lines = cart.map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) })).filter((l) => l.product);
        setState({ loading: false, lines, quote, error: null });
      })
      .catch((error) => alive && setState({ loading: false, lines: [], quote: null, error }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
