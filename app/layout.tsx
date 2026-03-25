import type { Metadata } from "next";
import { Mada } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainLayoutWrapper from "./components/MainLayoutWrapper";
import { LanguageProvider } from "./context/LanguageContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./globals.css";

const mada = Mada({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "900"],
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
      <body className={`${mada.variable} antialiased`}>
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
