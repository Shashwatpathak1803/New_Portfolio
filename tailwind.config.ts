import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "rgb(var(--base) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        line: "rgb(var(--ink) / 0.12)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        sandstone: {
          DEFAULT: "#EDE0C8",
          surface: "#D5C0A0",
          light: "#F7F2E8",
        },
        petrol: {
          DEFAULT: "#123B40",
          deep: "#0B2528",
          light: "#1A5259",
        },
        teal: {
          DEFAULT: "#1D6265",
          soft: "#287D81",
          deep: "#15494C",
        },
        accent: {
          DEFAULT: "#E8752A",
          soft: "#F08D4E",
          deep: "#C85F18",
        },
        tangerine: {
          DEFAULT: "#E8752A",
          soft: "#E8752A",
        },
        flame: {
          DEFAULT: "#1D6265",
          soft: "#287D81",
        },
        cyan: {
          DEFAULT: "#1D6265",
        },
        gold: {
          DEFAULT: "#D5C0A0",
          soft: "#EDE0C8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        "serif-display": ["var(--font-serif-display)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "mesh-1":
          "radial-gradient(40% 40% at 20% 20%, rgba(232,117,42,0.18) 0%, transparent 70%), radial-gradient(35% 35% at 80% 30%, rgba(29,98,101,0.22) 0%, transparent 70%), radial-gradient(45% 45% at 50% 80%, rgba(213,192,160,0.25) 0%, transparent 70%)",
        "grain": "url('/images/noise.png')",
      },
      boxShadow: {
        "glow-accent": "0 0 60px -10px rgba(232,117,42,0.45)",
        "glow-tangerine": "0 0 60px -10px rgba(232,117,42,0.45)",
        "glow-flame": "0 0 60px -10px rgba(29,98,101,0.4)",
        "glow-petrol": "0 0 60px -10px rgba(18,59,64,0.45)",
        "glow-teal": "0 0 60px -10px rgba(29,98,101,0.45)",
        "glow-gold": "0 0 60px -10px rgba(213,192,160,0.4)",
        "glass": "0 8px 32px rgba(18,59,64,0.35)",
      },
      keyframes: {
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "float-y": "float-y 6s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "spin-reverse": "spin-reverse 24s linear infinite",
        "spin-counter": "spin-slow 24s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
