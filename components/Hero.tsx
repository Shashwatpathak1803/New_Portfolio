"use client";

import { motion } from "framer-motion";
import { useContent } from "@/components/ContentProvider";
import { scrollToId } from "@/lib/scroll";

/**
 * Aurora-style hero: full-bleed looping video, very light overlays, content
 * anchored top-left, social icons pinned bottom-left.
 *
 * Video: save the clip as /public/hero.mp4 (run `npm run fetch-hero`).
 * `ready` flips true when the loading screen lifts, so the entrance plays on screen.
 */

const socialDefs = [
  {
    label: "GitHub",
    key: "github" as const,
    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    label: "LinkedIn",
    key: "linkedin" as const,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452z",
  },
  {
    label: "Instagram",
    key: "instagram" as const,
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
];

const PAD_X = "clamp(20px, 5vw, 64px)";

export default function Hero({ ready = true }: { ready?: boolean }) {
  const { profile, hero } = useContent();
  const socials = socialDefs.map((d) => ({ ...d, href: profile.social[d.key] })).filter((s) => s.href);
  const state = ready ? "show" : "hide";
  const rise = (y: number, duration: number, delay: number) => ({
    initial: { opacity: 0, y },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration, delay, ease: "easeOut" as const },
  });

  return (
    <section
      id="home"
      data-state={state}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        overflow: "hidden",
        // shown only while hero.mp4 is missing or still loading
        background: "radial-gradient(ellipse at 70% 100%, #123B40 0%, #0B2528 55%, #051314 100%)",
        color: "#fff",
      }}
    >
      <video
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,37,40,0.25) 0%, transparent 22%, transparent 60%, rgba(11,37,40,0.45) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(11,37,40,0.2) 0%, transparent 18%, transparent 82%, rgba(11,37,40,0.2) 100%)" }} />
      <div style={{ position: "absolute", top: "-14%", left: "50%", transform: "translateX(-50%)", width: "1000px", height: "720px", maxWidth: "100vw", background: "radial-gradient(ellipse at 50% 30%, rgba(232,117,42,0.22) 0%, transparent 68%)", pointerEvents: "none" }} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          minHeight: "100svh",
          justifyContent: "flex-start",
          paddingTop: "clamp(104px, 22svh, 220px)",
          paddingBottom: "96px", // keeps the text clear of the social icons pinned at the bottom
          paddingLeft: PAD_X,
          paddingRight: PAD_X,
        }}
      >
        <motion.div
          {...rise(14, 0.7, 0.1)}
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", borderRadius: "999px", padding: "6px 16px 6px 6px", background: "rgba(18,59,64,0.7)", border: "1px solid rgba(237,224,200,0.2)", width: "fit-content", maxWidth: "100%" }}
        >
          <div style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: "22px", height: "22px", borderRadius: "999px", background: "linear-gradient(135deg, #E8752A, #1D6265)", border: "2px solid rgba(18,59,64,0.9)", marginLeft: i === 0 ? 0 : "-8px" }} />
            ))}
          </div>
          <span style={{ fontSize: "12.5px", lineHeight: 1.35, color: "rgba(237,224,200,0.85)", fontFamily: "var(--font-body), 'Inter', sans-serif" }}>
            {profile.name}{hero.showBadge && hero.badge && <> · <strong style={{ color: "#EDE0C8", fontWeight: 600 }}>{hero.badge}</strong></>}
          </span>
        </motion.div>

        <motion.h1
          {...rise(22, 0.8, 0.25)}
          style={{ fontFamily: "var(--font-jakarta), sans-serif", fontWeight: 500, fontSize: "clamp(2.2rem, 4.6vw, 4.1rem)", lineHeight: 1.08, letterSpacing: "-0.02em", color: "#fff", marginTop: "22px", maxWidth: "560px", overflowWrap: "anywhere" }}
        >
          {hero.titleLine1}
          <br />
          {hero.titleLine2}
        </motion.h1>

        <motion.p
          {...rise(16, 0.8, 0.42)}
          style={{ marginTop: "16px", fontSize: "15px", lineHeight: 1.6, color: "rgba(237,224,200,0.8)", fontFamily: "var(--font-body), 'Inter', sans-serif", maxWidth: "min(340px, 100%)" }}
        >
          {hero.subtext}
        </motion.p>

        <motion.div
          {...rise(16, 0.8, 0.58)}
          style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "14px", marginTop: "30px" }}
        >
          <motion.a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("projects");
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ padding: "14px 26px", borderRadius: "999px", background: "#123B40", color: "#EDE0C8", fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-body), 'Inter', sans-serif", textDecoration: "none", border: "1px solid rgba(232,117,42,0.45)", boxShadow: "0 4px 20px rgba(18,59,64,0.4)" }}
          >
            {hero.ctaLabel}
          </motion.a>
          {hero.showResumeButton && profile.resumeUrl && (
          <motion.a
            href={profile.resumeUrl}
            download
            aria-label="Download resume"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            style={{ width: "44px", height: "44px", borderRadius: "999px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v12M6 11l6 6 6-6M5 20h14" />
            </svg>
          </motion.a>
          )}
        </motion.div>
      </div>

      <div style={{ position: "absolute", bottom: "34px", left: PAD_X, zIndex: 10, display: "flex", gap: "10px" }}>
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            style={{ width: "34px", height: "34px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.75)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={s.path} />
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
}
