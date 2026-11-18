// Seeds sample products, content and an admin account. Safe to re-run (upserts by slug/email).
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, q, one } from '../src/db.js';

const img = (slug) => `/watches/${slug}.svg`;

const products = [
  { slug: 'kairos-meridian-classic', name: 'Meridian Classic Ivory Dial', brand: 'Kairos', type: 'classic', gender: 'men', price: 2499, mrp: 3499, stock: 12, featured: 1,
    description: 'A warm gold case framing an ivory sunray dial, finished on a hand-stitched brown leather strap. A quiet dress watch made for evenings and boardrooms alike.',
    specs: { 'Case size': '40 mm', Movement: 'Japanese quartz', 'Water resistance': '30 m', Strap: 'Genuine leather', Glass: 'Mineral crystal' }, tags: ['formal', 'gift', 'brown', 'beige'] },
  { slug: 'maison-orlo-noir-chronograph', name: 'Noir Gunmetal Chronograph-Style Watch', brand: 'Maison Orlo', type: 'statement', gender: 'men', price: 1699, mrp: 2399, stock: 3, featured: 1, isNew: 1,
    description: 'Gunmetal case and bracelet with a deep black dial and three sub-dials. Bold, architectural and built to be noticed.',
    specs: { 'Case size': '44 mm', Movement: 'Quartz', 'Water resistance': '50 m', Strap: 'Stainless steel bracelet', Glass: 'Mineral crystal' }, tags: ['party', 'black', 'grey'] },
  { slug: 'nordhavn-glacier-integrated', name: 'Glacier Ice Blue Integrated Bracelet', brand: 'Nordhavn', type: 'sport', gender: 'unisex', price: 2999, mrp: 3999, stock: 2, featured: 1, isNew: 1,
    description: 'A cushion case flowing into an integrated steel bracelet, with an ice-blue textured dial that catches every angle of light.',
    specs: { 'Case size': '40 mm', Movement: 'Quartz', 'Water resistance': '100 m', Strap: 'Integrated steel bracelet', Glass: 'Sapphire-coated' }, tags: ['casual', 'blue', 'white', 'grey'] },
  { slug: 'aeterna-rose-petite', name: 'Rose Petite Mesh Watch', brand: 'Aeterna', type: 'dress', gender: 'women', price: 1299, mrp: 1899, stock: 18,
    description: 'Delicate rose-gold tones, a blush dial and a fine Milanese mesh strap. Small in size, generous in presence.',
    specs: { 'Case size': '32 mm', Movement: 'Quartz', 'Water resistance': '30 m', Strap: 'Milanese mesh', Glass: 'Mineral crystal' }, tags: ['formal', 'gift', 'pink', 'beige', 'white'] },
  { slug: 'valmont-field-explorer', name: 'Field Explorer Olive Dial', brand: 'Valmont & Co', type: 'sport', gender: 'men', price: 899, mrp: 1299, stock: 25,
    description: 'Military-inspired legibility with bold numerals, an olive dial and a durable woven nylon strap. Ready for trails and weekdays.',
    specs: { 'Case size': '41 mm', Movement: 'Quartz', 'Water resistance': '50 m', Strap: 'Nylon', Glass: 'Mineral crystal' }, tags: ['casual', 'outdoor', 'green', 'brown'] },
  { slug: 'solenne-midnight-moon', name: 'Midnight Moonphase Gold', brand: 'Solenne', type: 'statement', gender: 'unisex', price: 4499, mrp: 5999, stock: 6, featured: 1,
    description: 'A navy dial scattered with a moonphase window, set in a polished gold case on navy leather with gold stitching.',
    specs: { 'Case size': '41 mm', Movement: 'Quartz with moonphase', 'Water resistance': '30 m', Strap: 'Leather', Glass: 'Sapphire-coated' }, tags: ['formal', 'party', 'gift', 'blue', 'black'] },
  { slug: 'kairos-tide-diver', name: 'Tide Diver Ocean Blue', brand: 'Kairos', type: 'sport', gender: 'men', price: 1999, mrp: 2799, stock: 9, isNew: 1,
    description: 'A rotating black bezel and an ocean-blue dial on a comfortable rubber strap. Made for the water, styled for the street.',
    specs: { 'Case size': '42 mm', Movement: 'Quartz', 'Water resistance': '200 m', Strap: 'Rubber', Glass: 'Mineral crystal' }, tags: ['casual', 'outdoor', 'blue', 'black'] },
  { slug: 'nordhavn-shock-digital-pro', name: 'Shock Pro Analog-Digital Sports Watch', brand: 'Nordhavn', type: 'sport', gender: 'unisex', price: 1499, mrp: 2499, stock: 0, stockStatus: 'preorder', isNew: 1, featured: 1,
    description: 'Tough resin construction, analog-digital display, stopwatch and backlight. Built to take a hit and keep time.',
    specs: { 'Case size': '48 mm', Movement: 'Analog-digital quartz', 'Water resistance': '200 m', Strap: 'Resin', Features: 'Stopwatch, alarm, LED light' }, tags: ['casual', 'outdoor', 'black'] },
  { slug: 'aeterna-heritage-gold', name: 'Heritage Champagne Gold', brand: 'Aeterna', type: 'classic', gender: 'men', price: 5499, mrp: 7499, stock: 4, vault: 1,
    description: 'A full gold bracelet watch with a champagne dial. A heritage piece meant to be handed down.',
    specs: { 'Case size': '40 mm', Movement: 'Automatic', 'Water resistance': '50 m', Strap: 'Gold-tone steel bracelet', Glass: 'Sapphire crystal' }, tags: ['formal', 'wedding', 'gift', 'beige', 'brown'] },
  { slug: 'maison-orlo-slim-ivory', name: 'Slim Ivory Minimalist', brand: 'Maison Orlo', type: 'dress', gender: 'unisex', price: 699, mrp: 999, stock: 30,
    description: 'A 7 mm slim steel case with a clean white dial and black leather strap. Nothing more, nothing less.',
    specs: { 'Case size': '38 mm', Movement: 'Quartz', 'Water resistance': '30 m', Strap: 'Leather', Thickness: '7 mm' }, tags: ['formal', 'casual', 'white', 'black', 'grey'] },
  { slug: 'valmont-racing-chrono', name: 'Racing Panda Chronograph-Style', brand: 'Valmont & Co', type: 'statement', gender: 'men', price: 3299, mrp: 4499, stock: 7,
    description: 'A white panda dial with black sub-dials, a tachymeter bezel and a rally leather strap with red stitching.',
    specs: { 'Case size': '42 mm', Movement: 'Quartz', 'Water resistance': '100 m', Strap: 'Rally leather', Glass: 'Mineral crystal' }, tags: ['casual', 'party', 'white', 'black', 'red'] },
  { slug: 'solenne-emerald', name: 'Emerald Petite Bracelet', brand: 'Solenne', type: 'classic', gender: 'women', price: 2199, mrp: 2999, stock: 11, featured: 1,
    description: 'An emerald sunray dial in a slim gold case with a matching bracelet. Jewellery that tells time.',
    specs: { 'Case size': '34 mm', Movement: 'Quartz', 'Water resistance': '30 m', Strap: 'Gold-tone bracelet', Glass: 'Mineral crystal' }, tags: ['formal', 'wedding', 'party', 'gift', 'green'] },
  { slug: 'kairos-essential-mini', name: 'Essential Mini Silver', brand: 'Kairos', type: 'classic', gender: 'unisex', price: 449, mrp: 699, stock: 40,
    description: 'An everyday essential with a crisp white dial and silver mesh strap. An easy first watch or a thoughtful small gift.',
    specs: { 'Case size': '34 mm', Movement: 'Quartz', 'Water resistance': '30 m', Strap: 'Mesh', Glass: 'Mineral crystal' }, tags: ['casual', 'gift', 'white', 'grey'] },
  { slug: 'aeterna-skeleton-open-heart', name: 'Open Heart Ice Blue – Dark Metal Edition', brand: 'Aeterna', type: 'statement', gender: 'men', price: 6499, mrp: 8999, stock: 2, vault: 1, featured: 1,
    description: 'A dark metal cushion case with an ice-blue textured dial and an open-heart aperture revealing the balance wheel.',
    specs: { 'Case size': '40 mm', Movement: 'Automatic, open heart', 'Water resistance': '100 m', Strap: 'Integrated bracelet', Glass: 'Sapphire crystal' }, tags: ['party', 'formal', 'blue', 'grey', 'black'] },
  { slug: 'nordhavn-pilot-aviator', name: 'Pilot Aviator Black', brand: 'Nordhavn', type: 'sport', gender: 'men', price: 1199, mrp: 1599, stock: 0,
    description: 'An oversized cockpit-inspired dial with luminous numerals on a vintage brown leather strap.',
    specs: { 'Case size': '45 mm', Movement: 'Quartz', 'Water resistance': '50 m', Strap: 'Leather', Glass: 'Mineral crystal' }, tags: ['casual', 'black', 'brown'] },
  { slug: 'maison-orlo-pearl-lady', name: 'Pearl Lady Mother-of-Pearl Dial', brand: 'Maison Orlo', type: 'dress', gender: 'women', price: 1799, mrp: 2299, stock: 14, isNew: 1,
    description: 'A lustrous mother-of-pearl style dial in a petite steel case on a polished bracelet.',
    specs: { 'Case size': '30 mm', Movement: 'Quartz', 'Water resistance': '30 m', Strap: 'Steel bracelet', Glass: 'Mineral crystal' }, tags: ['formal', 'wedding', 'gift', 'white', 'pink', 'grey'] },
];

const policies = [
  ['shipping', 'Shipping', `We ship across India. Orders are packed within 1–2 business days and usually arrive in 3–7 business days, depending on your PIN code.\n\nShipping is free on orders above ₹999. A flat ₹79 delivery fee applies to smaller orders.\n\nYou will receive tracking details on WhatsApp and email once your timepiece leaves our studio.`],
  ['returns', 'Returns & exchanges', `If your watch arrives damaged or is not what you ordered, tell us within 48 hours of delivery with an unboxing video and we will arrange a free replacement or return.\n\nWatches must be unworn, with all tags, protective films and original packaging intact.\n\nPre-order and Vault pieces are final sale unless they arrive damaged.`],
  ['refunds', 'Refunds', `Approved refunds are processed within 5–7 business days to your original payment method. Cash on Delivery orders are refunded by UPI or bank transfer.`],
  ['warranty', 'Warranty', `Product imagery and warranties are subject to verification. Where a warranty applies, it covers movement defects and does not cover glass, straps, water damage or wear and tear.`],
  ['privacy', 'Privacy', `We use your name, phone, email and address only to deliver and support your order. Wrist photos uploaded to the AI Try-On stay on your device and are never stored on our servers.\n\nWe never sell your information.`],
];

const care = [
  ['daily-care-basics', 'Daily care basics', 'Essentials', 'Simple habits that keep your timepiece looking new for years.',
    `Wipe your watch with a soft microfibre cloth at the end of each day to remove oils and dust.\n\nKeep it away from strong magnets — speakers, phone cases and laptops can affect quartz and automatic movements.\n\nStore it in its box or a watch roll, dial up, away from direct sunlight.`, 3],
  ['leather-strap-care', 'Caring for leather straps', 'Straps', 'Keep leather supple and avoid cracks, stains and odours.',
    `Leather and water do not mix. Remove leather-strap watches before washing hands, swimming or exercising.\n\nLet the strap breathe overnight, and condition it every few months with a small amount of leather balm.\n\nRotate between two straps if you wear the watch daily.`, 4],
  ['water-resistance-explained', 'Water resistance explained', 'Guides', 'What 30 m, 50 m, 100 m and 200 m really mean.',
    `30 m: splashes and rain only.\n50 m: hand washing and brief immersion, no swimming.\n100 m: swimming and snorkelling.\n200 m: diving and water sports.\n\nNever press buttons or open the crown under water, and get gaskets checked every two years.`, 3],
  ['battery-and-servicing', 'Battery & servicing', 'Service', 'When to change a battery and how often to service an automatic.',
    `Quartz batteries last around 2–3 years. Replace a dead battery promptly to avoid leaks.\n\nAutomatic watches benefit from a full service every 4–5 years. If yours gains or loses more than 30 seconds a day, it is time.`, 2],
  ['cleaning-steel-bracelets', 'Cleaning steel bracelets', 'Straps', 'Bring back the shine on bracelets and mesh straps.',
    `Use lukewarm water, a drop of mild soap and a soft toothbrush between the links (only if the watch is rated 50 m or more).\n\nRinse, pat dry and finish with a microfibre cloth. Avoid abrasive polishes on brushed finishes.`, 3],
];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@everentia.local').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(adminPass, 10);
  await q(`INSERT INTO users (name, email, password_hash, role) VALUES ('Store Admin', ?, ?, 'admin')
    ON DUPLICATE KEY UPDATE role = 'admin'`, [adminEmail, hash]);

  for (const p of products) {
    const row = {
      slug: p.slug, name: p.name, brand: p.brand, type: p.type, gender: p.gender, price: p.price, mrp: p.mrp, stock: p.stock,
      stock_status: p.stockStatus || (p.stock <= 0 ? 'out_of_stock' : p.stock <= 3 ? 'low_stock' : 'in_stock'),
      description: p.description, specs: JSON.stringify(p.specs), tags: JSON.stringify(p.tags || []),
      image: img(p.slug), try_on_image: img(p.slug), images: JSON.stringify([img(p.slug)]),
      is_featured: p.featured ? 1 : 0, is_new: p.isNew ? 1 : 0, is_vault: p.vault ? 1 : 0, is_active: 1,
    };
    const existing = await one('SELECT id FROM products WHERE slug = ?', [p.slug]);
    if (existing) await q('UPDATE products SET ? WHERE id = ?', [row, existing.id]);
    else await q('INSERT INTO products SET ?', [row]);
  }

  for (const [i, [slug, title, body]] of policies.entries()) {
    await q('INSERT INTO policies (slug, title, body, sort_order) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body), sort_order = VALUES(sort_order)', [slug, title, body, i]);
  }
  for (const [slug, title, category, excerpt, body, mins] of care) {
    await q('INSERT INTO care_articles (slug, title, category, excerpt, body, read_minutes) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body)', [slug, title, category, excerpt, body, mins]);
  }

  const [{ n: dropCount }] = await q('SELECT COUNT(*) AS n FROM drops');
  if (!dropCount) {
    const id = async (slug) => (await one('SELECT id FROM products WHERE slug = ?', [slug]))?.id;
    const day = 24 * 3600 * 1000;
    await q('INSERT INTO drops (title, description, product_id, release_at) VALUES (?,?,?,?),(?,?,?,?),(?,?,?,?)', [
      'The Shock Pro Release', 'Our toughest analog-digital piece lands in limited numbers. Pre-orders ship first.', await id('nordhavn-shock-digital-pro'), new Date(Date.now() + 3 * day),
      'Midnight Moon — Second Batch', 'The moonphase that sold out in a week returns for one more run.', await id('solenne-midnight-moon'), new Date(Date.now() + 9 * day),
      'Vault: Open Heart Edition', 'Only a handful of Open Heart pieces will be released through The Vault.', await id('aeterna-skeleton-open-heart'), new Date(Date.now() + 21 * day),
    ]);
  }

  const [{ n: reviewCount }] = await q('SELECT COUNT(*) AS n FROM reviews');
  if (!reviewCount) {
    const all = await q('SELECT id FROM products');
    const samples = [
      ['Arjun', 5, 'Looks even better in person. Packaging was beautiful.'],
      ['Meera', 4, 'Lovely finish and comfortable on the wrist. Delivery took 5 days.'],
      ['Rahul', 5, 'Tried it on with the AI try-on first — exactly how it looked.'],
    ];
    for (const p of all) {
      for (const [name, rating, comment] of samples.slice(0, 1 + (p.id % 3))) {
        await q('INSERT INTO reviews (product_id, author_name, rating, comment) VALUES (?,?,?,?)', [p.id, name, rating, comment]);
      }
    }
  }

  console.log(`Seeded ${products.length} products, ${policies.length} policies, ${care.length} care articles.`);
  console.log(`Admin login: ${adminEmail} / ${adminPass}`);
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
