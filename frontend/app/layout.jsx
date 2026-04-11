import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/CurrencyProvider';
import { CompareProvider } from '@/hooks/useCompare';
import { WishlistProvider } from '@/hooks/useWishlist';
import { CartProvider } from '@/hooks/useCart';

export const metadata = {
  title: 'NovaMart | Modern Marketplace',
  description: 'Temu-style marketplace MVP with dark mode support.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <CurrencyProvider>
            <CompareProvider>
              <WishlistProvider>
                <CartProvider>
                  <Navbar />
                  <main className="container-page py-8">{children}</main>
                  <Footer />
                </CartProvider>
              </WishlistProvider>
            </CompareProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
