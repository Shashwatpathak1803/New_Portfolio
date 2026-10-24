"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number; gold: boolean };

/**
 * Fixed, full-page animated backdrop that sits behind every section:
 *  - drifting aurora blobs + panning grid + light streaks (pure CSS)
 *  - a light canvas particle network that reacts to the cursor
 *    (the floating code words were removed: they drifted behind the real text and looked like overlap)
 * Theme-aware (reads the `light` class on <html>), pauses when the tab is hidden,
 * and renders a single static frame for users who prefer reduced motion.
 */
export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    let w = 0;
    let h = 0;
    let raf = 0;
    let light = root.classList.contains("light");
    let scrollY = window.scrollY;
    const mouse = { x: -9999, y: -9999 };
    let particles: Particle[] = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(20, Math.min(46, Math.floor((w * h) / 30000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.5 + 0.7,
        gold: Math.random() < 0.12,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      const tang = light ? "18,59,64" : "232,117,42";
      const gold = light ? "232,117,42" : "213,192,160";
      const lineBoost = light ? 0.45 : 0.35;
      const LINK = 130;

      // slight parallax: the network shifts a little as the page scrolls
      const offY = -(scrollY * 0.06) % h;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;

          // gentle push away from the cursor
          const dxm = p.x - mouse.x;
          const dym = p.y - (mouse.y - offY);
          const dm = dxm * dxm + dym * dym;
          if (dm < 110 * 110 && dm > 1) {
            const d = Math.sqrt(dm);
            const f = (110 - d) / 110;
            p.x += (dxm / d) * f * 1.4;
            p.y += (dym / d) * f * 1.4;
          }
        }

        const py = p.y + offY;
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const a = (1 - Math.sqrt(d2) / LINK) * lineBoost;
            ctx.strokeStyle = `rgba(${tang},${a})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, py);
            ctx.lineTo(q.x, q.y + offY);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(${p.gold ? gold : tang},${light ? 0.75 : 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // connect nearby particles to the cursor
      if (!reduceMotion && mouse.x > -999) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y + offY - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 170 * 170) {
            const a = (1 - Math.sqrt(d2) / 170) * 0.5;
            ctx.strokeStyle = `rgba(${gold},${a})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y + offY);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 33) return; // ~30fps is plenty for a slow ambient background
      last = t;
      draw(t);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduceMotion) draw(0);
      else raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onResize = () => {
      build();
      if (reduceMotion) draw(0);
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };

    const mo = new MutationObserver(() => {
      light = root.classList.contains("light");
      if (reduceMotion) draw(0);
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    build();
    start();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="bg-blob bg-blob-a" />
      <div className="bg-blob bg-blob-b" />
      <div className="bg-blob bg-blob-c" />
      <div className="bg-blob bg-blob-d" />
      <div className="bg-grid" />
      <div className="bg-streak" />
      <div className="bg-streak" />
      <div className="bg-streak" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
