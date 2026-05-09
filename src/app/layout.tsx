import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Axion Pad — Outil de productivité haut de gamme, fabriqué en France",
  description: "Macro pad RP2040 open-source, assemblé à la main en France. Conçu pour aller vite.",
  openGraph: {
    title: "Axion Pad",
    description: "Outil de productivité haut de gamme, fabriqué en France",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceMono.variable} antialiased`}>
        {/* Fond animé — 3 orbes violets/verts qui dérivent lentement */}
        <div className="bg-wrap" aria-hidden="true">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
