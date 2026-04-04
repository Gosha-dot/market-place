# NovaMart Marketplace MVP (Frontend Only)

A Temu-style marketplace MVP frontend built with Next.js + Tailwind CSS, featuring a modern light/dark UI.

## Run From Project Root

```
copy frontend\.env.example frontend\.env.local
npm run install:frontend
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

```
market-place/
  frontend/
    app/
      page.jsx
      layout.jsx
      products/[id]/page.jsx
      auth/login/page.jsx
      auth/register/page.jsx
      cart/page.jsx
      wishlist/page.jsx
      checkout/page.jsx
      admin/page.jsx
    components/
      Navbar.jsx
      ThemeProvider.jsx
      ThemeToggle.jsx
      CurrencyProvider.jsx
      CurrencyToggle.jsx
      Hero.jsx
      FlashSale.jsx
      Categories.jsx
      ProductCard.jsx
      ProductGrid.jsx
      Filters.jsx
      Pagination.jsx
      ui/Rating.jsx
      ui/Countdown.jsx
      ui/LoadMoreTrigger.jsx
    lib/
      api.js
      cart.js
      mockData.js
      theme.js
      currency.js
      useInfiniteProducts.js
    styles/
      globals.css
    tailwind.config.js
    postcss.config.js
    next.config.js
    package.json
  README.md
```

## Notes

- Dark mode uses Tailwind class strategy with localStorage persistence and system detection on first load.
- Currency switcher (USD/EUR/UAH) is in the navbar and applies across product cards, cart, and checkout.
- Infinite scroll is enabled on the homepage.
- API calls are prepared in `frontend/lib/api.js`, but the UI will gracefully fall back to mock data.
- Pages include: Home, Product detail, Auth, Cart, Wishlist, Checkout, Admin shell.

## Next Steps

- Add real backend or connect to your existing API.
- Add form validation + auth flows.
- Add product seeding and richer filters.
