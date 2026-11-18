# EVERENTIA — Watch Store (React + Node + MySQL)

A rebuild of the Everentia watch store: same dark charcoal + champagne-gold theme, Jost / Cormorant Garamond typography, page copy and feature set, on a React (Vite) frontend, an Express API and a MySQL database.

## Requirements
- Node.js 18+ (tested on 24)
- MySQL 8+

## Setup

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure the database connection
#    Copy server/.env.example to server/.env and set DB_USER / DB_PASSWORD / JWT_SECRET
cp server/.env.example server/.env

# 3. Create the database, tables and sample data (safe to re-run)
npm run db:setup

# 4. Run in development (two terminals)
npm run dev:server   # API on http://localhost:5000
npm run dev:client   # Site on http://localhost:5173
```

Admin login (from `server/.env`): **admin@everentia.local / Admin@123**. Change it before going live. The admin panel is at `/admin`.

## Production
```bash
npm run build   # builds client/dist
npm start       # Express serves the API and the built site on PORT
```

## What's included

**Store**: home, collection (search, brand / type / gender / availability filters, sorting), shop by budget (price bands with live counts), product pages (gallery, specs, stock status, quantity, add to selection, buy now, wishlist, reviews, related), cart ("Your Selection"), checkout (Cash on Delivery or UPI with transaction reference, gift wrap, free shipping above ₹999), order confirmation, order history, guest order tracking, customer cancellation.

**Experiences**: Virtual Try-On (upload a wrist photo or use the live camera, then drag, resize, rotate and save the look; photos stay in the browser), Live Mirror, 3D Virtual Boutique, Find My Watch quiz, Gift Finder, Watch Battle, Wear Today, Outfit Match, Couples Edit, Style Board (community photo posts and likes), Watch Care Hub, Time Capsule, Watch Drops (countdowns and notify-me), The Vault, Rewards (points and tiers), Become a partner, Policies.

**Accounts**: register / sign in (JWT), profile, reward points (1 point per ₹100, removed if an order is cancelled).

**Admin** (`/admin`): dashboard (revenue, orders, low stock, top sellers), product CRUD with image upload, order status and payment management, customers, partner requests, Style Board moderation, drops scheduling, policy editing.

## Project layout
```
client/            React + Vite + Tailwind v4
  public/watches/  sample product artwork (SVG, transparent, used for try-on too)
  src/config.js    brand name, WhatsApp number, UPI ID — edit these
  src/pages/       one file per route; admin/ holds the admin panel
server/
  sql/schema.sql   all tables
  scripts/         init-db.js, seed.js
  src/routes/      products, auth, orders, content (+ admin endpoints)
  uploads/         admin and community image uploads
```

## Notes
- Sample products, brands and images are placeholders. Replace them from the admin panel.
- Try-on images work best as transparent PNG/SVG with the watch vertical (strap top to bottom).
- UPI payments are confirmed manually: the customer enters the UTR and you mark the order paid in admin. Add a payment gateway (Razorpay, Cashfree) in `server/src/routes/orders.js` if you need automatic capture.
