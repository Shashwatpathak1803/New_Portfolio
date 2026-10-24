"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";

/**
 * Wraps the app in Lenis smooth-scroll and keeps GSAP's internal ticker
 * (and therefore ScrollTrigger) perfectly in sync with Lenis's scroll loop.
 */
export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // Drive Lenis off GSAP's ticker (instead of a second requestAnimationFrame
    // loop) so ScrollTrigger-based animations always read the correct,
    // up-to-date scroll position on the same frame.
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
