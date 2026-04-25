# NovaMart Marketplace MVP (Full Stack)

Temu-style marketplace MVP with:
- Frontend: Next.js + Tailwind (mobile-first, light/dark mode with persistence)
- Backend: Express + MongoDB
- Auth: JWT
- Payments: Stripe mocked (MVP)
- Features: coupons, recommendations, order history, seller ratings

## Run From Project Root

```bash
npm run install:backend
npm run install:frontend

copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local

npm run dev
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000` (health check: `/health`)

If PowerShell blocks `npm` scripts, use `npm.cmd` instead (e.g. `npm.cmd run dev`).

## Seed Demo Data (Optional)

```bash
cd backend
npm run seed
```

Creates demo accounts and products:
- `admin@novamart.dev` / `password123`
- `seller@novamart.dev` / `password123`

## Project Structure

```text
market-place/
  backend/
    src/
      server.js
      app.js
      config/db.js
      middleware/auth.js
      models/ (User, Seller, Product, Order, Coupon, Review, SellerRating, Cart)
      controllers/
      routes/
      services/ (couponService, recommendationService, stripeService)
  frontend/
    app/
      page.jsx
      products/[id]/page.tsx
      checkout/page.tsx
      orders/page.tsx
      orders/[id]/page.tsx
      seller/page.tsx
      admin/page.tsx
    components/
    hooks/
    lib/
      api.ts
      mockData.ts
      useInfiniteProducts.ts
  package.json
  README.md
```

## Notes

- Dark mode uses Tailwind class strategy with localStorage persistence and system detection on first load.
- The frontend will gracefully fall back to mock product data if the backend is unavailable.

## Next Steps

- Expand admin panel (users/products management UI).
- Replace mocked payments with real Stripe when ready.
- Add DB transactions/locking to harden checkout at scale.
