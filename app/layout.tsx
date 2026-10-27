import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/server";
import { LOCALE_META } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Znagui Express — Livraison de colis au Maroc",
    template: "%s · Znagui Express",
  },
  description:
    "Znagui Express — service de livraison de colis au Maroc. Création de colis, réseau d'agences, suivi en temps réel et paiement à la livraison.",
  icons: { icon: "/images/logo.png" },
  openGraph: {
    title: "Znagui Express",
    description: "Livraison de colis au Maroc — rapide, suivie, fiable.",
    type: "website",
    images: ["/images/logo.png"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  const dir = LOCALE_META[locale].dir;
  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
