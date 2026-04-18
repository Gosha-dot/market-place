import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/CurrencyProvider';
import { CompareProvider } from '@/hooks/useCompare';
import { WishlistProvider } from '@/hooks/useWishlist';
import { CartProvider } from '@/hooks/useCart';
import { RecentlyViewedProvider } from '@/hooks/useRecentlyViewed';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'NovaMart',
    template: '%s | NovaMart'
  },
  description: 'Temu-style marketplace MVP with dark mode support.',
  openGraph: {
    title: 'NovaMart',
    description: 'Modern marketplace MVP.',
    type: 'website'
  }
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
                  <RecentlyViewedProvider>
                    <AuthProvider>
                      <Navbar />
                      <main className="container-page py-8">{children}</main>
                      <Footer />
                    </AuthProvider>
                  </RecentlyViewedProvider>
                </CartProvider>
              </WishlistProvider>
            </CompareProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
