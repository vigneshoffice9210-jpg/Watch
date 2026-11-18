import { useEffect } from 'react';

/**
 * Site-wide scroll reveal. Any element with a `data-reveal` attribute fades/slides in the first time it
 * enters the viewport, including elements rendered later (lists that load from the API, route changes).
 */
export function useRevealObserver() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      const showAll = () => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    const watch = (root) => {
      if (root.nodeType !== 1) return;
      if (root.matches?.('[data-reveal]:not(.is-visible)')) io.observe(root);
      root.querySelectorAll?.('[data-reveal]:not(.is-visible)').forEach((el) => io.observe(el));
    };
    watch(document.body);
    const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach(watch)));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}

/** Thin gold bar at the top showing scroll progress. */
export function useScrollProgress(ref) {
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        ref.current?.style.setProperty('--p', h > 0 ? String(window.scrollY / h) : '0');
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [ref]);
}

/** Stagger helper: style={stagger(i)} */
export const stagger = (i, step = 70, max = 8) => ({ '--d': `${Math.min(i, max) * step}ms` });
