import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crochet Masterpiece - Handcrafted with Love",
  description: "Explore our beautiful collection of handmade crochet creations. Custom orders welcome.",
  keywords: "crochet, handmade, custom orders, knitting, yarn",
  openGraph: {
    title: "Crochet Masterpiece",
    description: "Handcrafted with love, made for you",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
