import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: {
          950: "#07090E",
          900: "#0B0F17",
          850: "#101622",
          800: "#161E2E",
          700: "#1F2B40",
          600: "#2B3A55",
        },
        navy: {
          950: "#0A0E1A",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
        },
        graphite: {
          950: "#0D0F12",
          900: "#13161B",
          800: "#1C2027",
          700: "#2A303A",
          600: "#3E4756",
          500: "#606D80",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        ivory: {
          50: "#FDFCF7",
          100: "#FAF7EE",
          200: "#F3EDE0",
          300: "#E8DEC9",
          400: "#D6C4A5",
        },
        copper: {
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
        },
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
