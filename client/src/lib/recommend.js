/**
 * Score products against a set of preferences. Used by Find My Watch, Gift Finder,
 * Outfit Match, Wear Today and Couples.
 * prefs: { gender, types[], tags[], minPrice, maxPrice }
 */
export function recommend(products, prefs, limit = 4) {
  const scored = products
    .filter((p) => p.stockStatus !== 'out_of_stock')
    .filter((p) => (prefs.minPrice == null || p.price >= prefs.minPrice) && (prefs.maxPrice == null || p.price < prefs.maxPrice))
    .map((p) => {
      let s = 0;
      if (prefs.gender && prefs.gender !== 'any') s += p.gender === prefs.gender ? 3 : p.gender === 'unisex' ? 2 : -4;
      if (prefs.types?.length) s += prefs.types.includes(p.type) ? 4 : 0;
      for (const t of prefs.tags || []) if (p.tags?.includes(t)) s += 2;
      if (p.isFeatured) s += 0.5;
      if (p.mrp && p.mrp > p.price) s += 0.3;
      return { p, s };
    })
    .sort((a, b) => b.s - a.s || a.p.price - b.p.price);
  return scored.slice(0, limit).map((x) => x.p);
}

/** Stable pseudo-random pick for "today" so the suggestion doesn't change on every reload. */
export function dailySeed(extra = '') {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${extra}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
