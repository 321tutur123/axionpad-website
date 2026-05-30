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
  title: {
    default: "Axion Pad — Macro Pad RP2040 Open Source, Fait Main en France",
    template: "%s | Axion Pad",
  },
  description:
    "Macro pad RP2040 programmable avec 12 touches mécaniques Cherry MX et 4 potentiomètres. Firmware CircuitPython open source, configurateur Windows gratuit. Assemblé à la main à Orléans, France.",
  keywords: [
    "macro pad", "RP2040", "macro pad France", "macro pad open source",
    "CircuitPython macro pad", "potentiomètre USB", "pad programmable",
    "macro pad fait main", "axion pad", "macro pad streaming",
  ],
  authors: [{ name: "Arthur Delacour" }],
  creator: "Arthur Delacour",
  metadataBase: new URL("https://axionpad.fr"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Axion Pad — Macro Pad RP2040 Open Source",
    description:
      "12 touches MX · 4 potentiomètres · RP2040 · Fait main à Orléans, France. Firmware CircuitPython open source.",
    type: "website",
    locale: "fr_FR",
    siteName: "Axion Pad",
    url: "https://axionpad.fr",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axion Pad — Macro Pad RP2040 Open Source",
    description: "12 touches MX · 4 potentiomètres · Fait main en France · Firmware CircuitPython",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Axion Pad",
              url: "https://axionpad.fr",
              description:
                "Macro pad RP2040 open source assemblé à la main en France.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Orléans",
                addressCountry: "FR",
              },
              contactPoint: {
                "@type": "ContactPoint",
                email: "contact@axionpad.fr",
                contactType: "customer support",
                availableLanguage: "French",
              },
            }),
          }}
        />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
