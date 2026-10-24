"use client";

import { useEffect, useRef } from "react";

/**
 * Glowing dual-layer cursor: a tight dot tracks the pointer exactly,
 * a softer glowing ring trails behind with spring easing. Expands on
 * any element marked [data-cursor="hover"].
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    let revealed = false;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!revealed) {
        // first movement: snap the ring to the pointer and fade both in
        revealed = true;
        ringX = mouseX;
        ringY = mouseY;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }
      wake();
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverTarget = target.closest('[data-cursor="hover"]');
      if (ringRef.current) {
        ringRef.current.style.width = isHoverTarget ? "64px" : "36px";
        ringRef.current.style.height = isHoverTarget ? "64px" : "36px";
        ringRef.current.style.borderColor = isHoverTarget
          ? "rgba(232,117,42,0.9)"
          : "rgba(29,98,101,0.7)";
      }
    };

    let raf = 0;
    const animate = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      // idle once the ring has caught up with the pointer
      if (Math.abs(mouseX - ringX) < 0.1 && Math.abs(mouseY - ringY) < 0.1) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(animate);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} aria-hidden="true" />
    </>
  );
}
