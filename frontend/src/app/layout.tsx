import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/components/shared/ReduxProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "Shopora Bangladesh — Authentic Artisan Fashion & Lifestyle",
  description: "Shop authentic handcrafted Bangladeshi fashion, jewellery, home decor and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <ReduxProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartDrawer />
        </ReduxProvider>
      </body>
    </html>
  );
}
