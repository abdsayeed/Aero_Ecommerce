import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-var",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aervyn — Stand Out.",
  description:
    "Premium minimalist men's streetwear. Oversized tees, hoodies, sweatshirts & tracksuits designed for the modern man. Stand Out.",
  keywords: [
    "streetwear",
    "men's clothing",
    "oversized tees",
    "hoodies",
    "tracksuits",
    "minimalist fashion",
    "premium clothing",
  ],
  openGraph: {
    title: "Aervyn — Stand Out.",
    description:
      "Premium minimalist men's streetwear. Oversized tees, hoodies, sweatshirts & tracksuits.",
    siteName: "Aervyn",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aervyn — Stand Out.",
    description:
      "Premium minimalist men's streetwear. Oversized tees, hoodies, sweatshirts & tracksuits.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
