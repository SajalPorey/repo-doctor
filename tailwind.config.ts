import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        "violet-glow": "0 0 40px rgba(139, 92, 246, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
