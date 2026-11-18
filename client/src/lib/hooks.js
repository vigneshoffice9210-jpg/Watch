import { useEffect, useState } from 'react';
import { api } from './api';

/** Fetch helper: re-runs when `deps` change. Returns { data, error, loading, reload }. */
export function useApi(path, params, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) { setState({ data: null, error: null, loading: false }); return; }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, { params })
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, JSON.stringify(params), tick, ...deps]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

export function useProducts(params) {
  const { data, error, loading, reload } = useApi('/products', params);
  return { products: data?.products || [], error, loading, reload };
}

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — EVERENTIA` : 'Everentia | Official Online Watch Store';
  }, [title]);
}
