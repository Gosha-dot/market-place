# NovaMart Marketplace MVP (Full Stack)

Temu-style marketplace MVP with:
- Frontend: Next.js + Tailwind (mobile-first, light/dark mode with persistence)
- Payments: Stripe mocked (MVP)
- Features: coupons, recommendations, order history, order tracking timeline, seller ratings

## Run From Project Root

```bash
npm run install:frontend

copy frontend\.env.example frontend\.env.local

npm run dev
```

- Frontend: `http://localhost:3000`
If PowerShell blocks `npm` scripts, use `npm.cmd` instead (e.g. `npm.cmd run dev`).

## One-Click Run (Windows / VS Code)

- Windows (double click): run `start-dev.cmd`
- PowerShell: `.\start-dev.ps1`
- VS Code: press `Ctrl+Shift+B` (runs task **Dev: Frontend**)

## Project Structure

```text
market-place/
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
- Product data is served from the frontend's built-in `/api/*` mock routes by default.

## Next Steps

- Expand admin panel (users/products management UI).
- Replace mocked payments with real Stripe when ready.
- Add DB transactions/locking to harden checkout at scale.
