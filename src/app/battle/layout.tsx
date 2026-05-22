import { Press_Start_2P } from "next/font/google";
import type { Metadata } from "next";

const gbaFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gba-pixel",
});

export const metadata: Metadata = {
  title: "Batalha — Pokédex Kanto",
  description: "Simulador de batalha 5v5 estilo GBA (Gen I).",
};

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${gbaFont.variable} min-h-screen`}>{children}</div>
  );
}
