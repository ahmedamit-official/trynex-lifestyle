# TryNex Lifestyle

## Overview

Premium e-commerce website for TryNex Lifestyle — a custom apparel brand based in Bangladesh. Full-stack pnpm workspace monorepo with a React/Vite storefront, Express API server, and PostgreSQL database.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18 + Vite + Tailwind CSS v4 + Framer Motion
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
- **Pages**: Home, Products, Product Detail, Cart, Checkout, Track Order, Blog, Blog Post, Admin Dashboard, Admin Products, Admin Orders, Admin Blog, Admin Settings

### API Server
- **Preview path**: `/api`
- **Port**: 8080
- **Dir**: `artifacts/api-server/`
- **Routes**: /api/products, /api/categories, /api/orders, /api/settings, /api/admin/*, /api/blog, /api/healthz

## Database Schema

- `categories` — Product categories (T-Shirts, Hoodies, Mugs, Caps, Custom Orders)
- `products` — Products with pricing, images, sizes, colors, customization options
- `orders` — Customer orders with items, payment method (COD, bKash, Nagad, Rocket)
- `orderItems` — Individual order line items
- `siteSettings` — Admin-configurable site settings
- `blogPosts` — Blog content

## Admin Access

- URL: `/admin`
- Default credentials: admin / admin123 (change in production via Settings)

## Integrations

- GitHub connected via Replit connector (georgelsmith333-hub)
- PostgreSQL database provisioned via Replit

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
