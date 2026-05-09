import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers";
import { I18nProvider } from "./i18n/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "yana/pay — Donaciones transparentes para ONGs peruanas",
  description:
    "Plataforma de recaudación de fondos transparente para ONGs y albergues en Perú, construida sobre Solana.",
  keywords: ["solana", "donaciones", "ONG", "peru", "blockchain", "transparencia"],
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    title: "yana/pay",
    description: "Donaciones transparentes para ONGs peruanas en Solana",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
