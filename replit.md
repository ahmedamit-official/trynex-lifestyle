# TryNex Lifestyle

## Overview

Premium e-commerce website for TryNex Lifestyle — a custom apparel brand based in Bangladesh. Full-stack pnpm workspace monorepo with a React/Vite storefront, Express API server, and PostgreSQL database. Targets all 64 districts of Bangladesh with BDT pricing, local payment methods (bKash, Nagad, Rocket, COD), and Bangladesh-optimized marketing features.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + Framer Motion + Recharts
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/trynex-storefront run dev` — run storefront locally

## Artifacts

### TryNex Lifestyle Storefront (react-vite)
- **Preview path**: `/`
- **Port**: 22837
- **Dir**: `artifacts/trynex-storefront/`
- **Pages**: Home, Products, Product Detail, Cart, Checkout, Track Order, Blog, Blog Post, Wishlist, Admin Dashboard, Admin Products, Admin Orders, Admin Blog, Admin Settings

### API Server
- **Preview path**: `/api`
- **Port**: 8080
- **Dir**: `artifacts/api-server/`
- **Routes**: /api/products, /api/categories, /api/orders, /api/settings, /api/admin/*, /api/blog, /api/healthz

## Design System

- **Theme**: Light/warm professional theme (NO dark mode)
- **Primary color**: `#E85D04` (orange-red)
- **Accent**: `#FB8500` (warm orange)
- **Background**: Warm cream/white (`#FFFAF5`, `#FFFFFF`)
- **Text**: Dark `#1C1917`
- **Success/Trust**: Green `#16a34a`
- **Fonts**: Plus Jakarta Sans (body) + Outfit (display headings)
- **Currency**: BDT (৳), formatted with `en-BD` locale

## Key Features

### Storefront
- **Announcement bar** — scrolling ticker with deals/promotions
- **WhatsApp floating button** — direct order/inquiry via WhatsApp
- **Wishlist** — localStorage-persisted, heart button on product cards, `/wishlist` page
- **Flash sale countdown timer** — on homepage hero section
- **Category grid** — 5 categories (T-Shirts, Hoodies, Mugs, Caps, Custom Orders)
- **Animated stats** — counters on homepage (customers, products, cities, reviews)
- **Testimonials grid** — customer reviews section
- **Product detail** — size guide modal, WhatsApp order button, reviews tab, share button
- **Cart & Checkout** — BDT pricing, all 64 districts, bKash/Nagad/Rocket/COD payment
- **Blog** — SEO-optimized blog posts
- **Track Order** — customer order tracking

### SEO
- `index.html` — full meta tags, Open Graph, Twitter Card
- JSON-LD structured data (Organization, WebSite, OnlineStore schemas)
- `public/robots.txt` and `public/sitemap.xml`

### Analytics & Tracking
- **Google Analytics (GA4)**: Admin-configurable Measurement ID (G-XXXXXXXXXX)
- **Facebook Pixel**: Admin-configurable Pixel ID for Meta Ads
- **Google Ads**: Admin-configurable Conversion ID (AW-XXXXXXXXX)
- **Conversion events**: PageView (route change), ViewContent (product detail), AddToCart, InitiateCheckout, Purchase
- **Implementation**: `src/lib/tracking.ts` + `TrackingPixels.tsx` component — scripts loaded dynamically, no hardcoded IDs
- **Admin config**: Settings → Analytics & Tracking section

### Admin Panel
- **URL**: `/admin` (hidden; tap footer logo 5 times)
- **Credentials**: admin / Admins@Trynex
- **Dashboard** — Recharts charts: AreaChart (weekly revenue), PieChart (payment methods), BarChart (daily orders); live stats with 30s auto-refresh
- **Products** — CRUD management with image upload
- **Orders** — Full order management with status updates
- **Blog** — Post editor with markdown
- **Settings** — Site config, WhatsApp number, social links, payment settings, analytics tracking IDs

## Database Schema

- `categories` — Product categories (T-Shirts, Hoodies, Mugs, Caps, Custom Orders)
- `products` — Products with pricing, images, sizes, colors, customization options
- `orders` — Customer orders with items, payment method (COD, bKash, Nagad, Rocket)
- `orderItems` — Individual order line items
- `siteSettings` — Admin-configurable site settings
- `blogPosts` — Blog content

## Bangladesh-Specific Features

- BDT currency (৳) formatting throughout
- COD with 15% advance payment requirement
- bKash, Nagad, Rocket mobile payment support
- All 64 Bangladesh districts in shipping dropdown
- WhatsApp-first customer support (configurable number)
- Bangla-friendly typography and locale settings

## Admin Access

- URL: `/admin`
- Default credentials: admin / admin123 (change in production via Settings)
- Secret access: tap footer logo 5 times

## Integrations

- GitHub connected via Replit connector (georgelsmith333-hub)
- PostgreSQL database provisioned via Replit

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
