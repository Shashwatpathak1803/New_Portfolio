"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import Loader from "@/components/Loader";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TechMarquee from "@/components/TechMarquee";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useContent } from "@/components/ContentProvider";
import type { SectionId } from "@/lib/types";

const SECTIONS: Record<SectionId, ReactNode> = {
  about: <About />,
  skills: <Skills />,
  experience: <Experience />,
  services: <Services />,
  projects: <Projects />,
  contact: <Contact />,
};

export default function Home() {
  const { settings, sections, marquee } = useContent();
  const [loaded, setLoaded] = useState(!settings.showLoader);

  // one anonymous page view per browser session (admin visits are ignored server-side)
  useEffect(() => {
    if (!settings.trackViews) return;
    try {
      if (sessionStorage.getItem("pv")) return;
      sessionStorage.setItem("pv", "1");
    } catch {}
    fetch("/api/track", { method: "POST", keepalive: true }).catch(() => {});
  }, [settings.trackViews]);

  return (
    <MotionConfig reducedMotion="user">
      {settings.showLoader && <Loader onFinish={() => setLoaded(true)} />}

      <SmoothScrollProvider>
        {settings.customCursor && <CustomCursor />}
        <ScrollProgress />
        <Navbar />

        <main className="transition-opacity duration-300" style={{ opacity: loaded ? 1 : 0 }}>
          <Hero ready={loaded} />
          {marquee.show && <TechMarquee />}
          {sections.order.filter((id) => sections.items[id]?.visible).map((id) => (
            <div key={id}>{SECTIONS[id]}</div>
          ))}
        </main>

        <Footer />
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
