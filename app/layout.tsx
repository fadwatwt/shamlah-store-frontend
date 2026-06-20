import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainLayoutWrapper from "./components/MainLayoutWrapper";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { LanguageProvider } from "./context/LanguageContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoriesProvider } from "./context/CategoriesContext";
import { getCategories } from "@/lib/queries/categories";
import "./globals.css";

const sfMada = localFont({
  src: [
    {
      path: "../public/fonts/SFMada.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SFMada-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  title: "شملة - Smlh | Palestinian Luxury Fashion",
  description: "Elegant online store offering luxury Palestinian fashion, bags, and accessories.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('language')?.value;
  const initialLanguage = langCookie === 'ar' ? 'ar' : 'en';

  // Fetch categories ONCE per server request — Header reads them from context, no client fetch
  const categories = await getCategories(initialLanguage === 'ar' ? 'AR' : 'EN');

  return (
    <html lang={initialLanguage} dir={initialLanguage === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${sfMada.variable} antialiased`} suppressHydrationWarning>
        <LanguageProvider initialLanguage={initialLanguage}>
          <CategoriesProvider categories={categories}>
            <WishlistProvider>
              <AuthProvider>
                <CartProvider>
                  <div className="bg-background">
                    <Header />
                    <MainLayoutWrapper>
                      {children}
                    </MainLayoutWrapper>
                    <Footer />
                    <WhatsAppFloat />
                  </div>
                </CartProvider>
              </AuthProvider>
            </WishlistProvider>
          </CategoriesProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
