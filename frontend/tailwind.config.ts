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
        background: "#030712",
        foreground: "#f9fafb",
        card: "#090d16",
        border: "#1f293d",
        primary: {
          DEFAULT: "#06b6d4",
          foreground: "#030712",
        },
        accent: {
          DEFAULT: "#8b5cf6",
          foreground: "#ffffff",
        }
      }
    },
  },
  plugins: [],
};
export default config;
