import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        void: "#9fd4f5",
        surface: "rgba(255,255,255,0.78)",
        elevated: "#ffffff",
        line: "rgba(26,51,72,0.12)",
        muted: "rgba(26,51,72,0.58)",
        kanto: {
          ink: "#1a3348",
          sky: "#7ec8f0",
          grass: "#5cb848",
        },
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(40,96,128,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(40,96,128,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
    },
  },
  plugins: [],
} satisfies Config;
