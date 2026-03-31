import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainLayoutWrapper from "./components/MainLayoutWrapper";
import { LanguageProvider } from "./context/LanguageContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./globals.css";

const sfMada = localFont({
  src: [
    {
      path: "../public/fonts/SFMada.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SFMada-Bold.ttf",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sfMada.variable} antialiased`}>
        <LanguageProvider>
          <WishlistProvider>
            <AuthProvider>
              <CartProvider>
                <div className="bg-background">
                  <Header />
                  <MainLayoutWrapper>
                    {children}
                  </MainLayoutWrapper>
                  <Footer />
                </div>
              </CartProvider>
            </AuthProvider>
          </WishlistProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
