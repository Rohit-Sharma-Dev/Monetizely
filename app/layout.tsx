import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Monetizely — Quoting Tool",
    template: "%s | Monetizely",
  },
  description:
    "Monetizely is a professional quoting tool for SaaS products. Build and manage quotes with tiered pricing, feature add-ons, and term discounts.",
  keywords: ["quoting", "pricing", "SaaS", "monetization", "sales"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 text-gray-900 antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
