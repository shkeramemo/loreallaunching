import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171412",
        rouge: "#b31732",
        pearl: "#f7f1ea",
        champagne: "#d7b46a",
        graphite: "#2b2a28",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "soft-panel": "0 24px 70px rgba(23, 20, 18, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
