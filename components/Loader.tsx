"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContent } from "@/components/ContentProvider";

const MIN_TIME_FIRST_VISIT = 600; // always show the brand at least this long
const MIN_TIME_REPEAT = 150; // shorter on repeat visits (assets are cached)
const MAX_TIME = 2500; // hard safety: never block the page longer than this

/**
 * Loading screen: a short branded beat, then the curtain lifts once the page
 * has finished loading (fonts, images). Driven by setInterval rather than rAF
 * so it still finishes correctly if the tab throttles animation frames.
 */
export default function Loader({ onFinish }: { onFinish?: () => void }) {
  const { profile } = useContent();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Keep the latest callback without re-running the effect below
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("portfolio-loaded");
      sessionStorage.setItem("portfolio-loaded", "1");
    } catch {
      /* storage can be unavailable (private mode) — ignore */
    }

    document.body.style.overflow = "hidden";

    const start = performance.now();
    const minTime = seen ? MIN_TIME_REPEAT : MIN_TIME_FIRST_VISIT;
    let shown = 0; // smoothed number we display
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      setProgress(100);
      document.body.style.overflow = "";
      // brief beat on "100%" before the curtain lifts
      setTimeout(() => {
        setDone(true);
        onFinishRef.current?.();
      }, 150);
    };

    const timer = setInterval(() => {
      const elapsed = performance.now() - start;
      const pageReady = document.readyState === "complete";
      // Creep toward 90% over the minimum time, then jump to done once the page is ready
      const target = pageReady && elapsed > minTime ? 100 : Math.min(90, (elapsed / minTime) * 90);
      shown += (target - shown) * 0.25;
      setProgress(Math.min(99, Math.round(shown)));

      if ((pageReady && elapsed > minTime && shown > 90) || elapsed > MAX_TIME) finish();
    }, 40);

    return () => {
      finished = true;
      clearInterval(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-base"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="absolute inset-0 bg-mesh-1 opacity-60" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <div className="font-display text-3xl font-semibold tracking-tight text-gradient md:text-5xl">
              {profile.name}
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-muted">
              <span>Loading experience</span>
              <span className="tabular-nums text-ink">{String(progress).padStart(2, "0")}%</span>
            </div>

            <div className="h-px w-48 overflow-hidden rounded-full bg-ink/10 md:w-64">
              <div
                className="h-full origin-left bg-gradient-to-r from-accent via-teal to-sandstone-surface transition-transform duration-150 ease-out"
                style={{ transform: `scaleX(${progress / 100})`, width: "100%" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
