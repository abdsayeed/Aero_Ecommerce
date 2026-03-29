import type { Metadata } from "next";
import { jost } from "next/font/google";
import "./globals.css";

const jost: NextFont = jost(options:{
  variable: '--font-jost',
  subsets: ['latin'],
})


export const metadata: Metadata = {
  title: "Aero Store",
  description: "Premium Aero footwear — engineered for performance, built for the streets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.classname} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
