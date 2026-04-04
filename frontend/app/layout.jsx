import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/CurrencyProvider';

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
            <Navbar />
            <main className="container-page py-8">{children}</main>
            <Footer />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
