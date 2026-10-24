"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  // The real theme class is already set on <html> by the inline script in layout.tsx
  // (before first paint), so we only need to read it here.
  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("light");

    // brief class so colours cross-fade instead of snapping
    root.classList.add("theme-transition");
    root.classList.toggle("light", next);
    root.classList.toggle("dark", !next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 500);

    setLight(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "light" : "dark");
    } catch {
      /* storage unavailable (private mode) — theme still applies for this visit */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      data-cursor="hover"
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line text-muted hover:text-ink hover:border-accent transition-colors duration-300"
    >
      {mounted && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={light ? "moon" : "sun"}
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="flex"
          >
            {light ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
