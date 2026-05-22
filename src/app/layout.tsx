import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Syne } from "next/font/google";
import { PokemonSiteBackground } from "@/components/PokemonSiteBackground";
import { AppProviders } from "@/components/providers/AppProviders";
import "lenis/dist/lenis.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Pokédex Kanto — Gen I",
  description:
    "Pokédex premium da primeira geração: 151 Pokémon, tipos, stats e evoluções via PokéAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${cormorant.variable} min-h-screen font-sans text-kanto-ink antialiased`}
      >
        <PokemonSiteBackground />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
