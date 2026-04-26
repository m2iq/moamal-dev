import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
      },
      colors: {
        violet: {
          DEFAULT: "#7c3aed",
          light: "#a855f7",
        },
        cyan: {
          DEFAULT: "#06b6d4",
        },
        amber: {
          DEFAULT: "#f59e0b",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
        "fade-up": "fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 400ms ease both",
        "scale-in": "scale-in 500ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
