import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ToasterProvider } from "@/components/shared/ToasterProvider";

export const metadata: Metadata = {
  title: "Shopora Admin",
  description: "Admin panel for Shopora Bangladesh e-commerce platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <ToasterProvider />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
