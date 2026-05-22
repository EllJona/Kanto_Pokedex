import type { NextConfig } from "next";

/** Hostnames permitidos no dev (RSC /_next). Só defina se usar IP ou domínio que não bata com o host do servidor. Lista em ALLOWED_DEV_ORIGINS no .env.local, separada por vírgula (ex.: 26.139.52.33,meuhost.tailscale.ts.net). */
const allowedDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
      {
        protocol: "https",
        hostname: "pokeapi.co",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
