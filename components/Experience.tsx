"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Briefcase } from "lucide-react";
import Reveal from "@/components/Reveal";
import { useContent } from "@/components/ContentProvider";

export default function Experience() {
  const { experience, sections } = useContent();
  const head = sections.items.experience;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 60%"],
  });
  const lineHeight = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  return (
    <section id="experience" className="section-padding relative">
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal variant="fade-up">
          <p className="eyebrow mb-4">{head.eyebrow}</p>
        </Reveal>
        <Reveal variant="blur" delay={0.05}>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-16 max-w-2xl">
            {head.heading}
          </h2>
        </Reveal>

        <div ref={containerRef} className="relative max-w-3xl mx-auto lg:mx-0">
          {/* Track + animated progress line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-ink/10" />
          <motion.div
            style={{ scaleY: lineHeight }}
            className="absolute left-[15px] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-accent via-teal to-petrol"
          />

          <div className="space-y-14">
            {experience.map((job, i) => (
              <Reveal key={job.company} variant="slide-right" delay={i * 0.1}>
                <div className="relative pl-10 sm:pl-12">
                  <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full glass shadow-glow-accent">
                    <Briefcase className="h-3.5 w-3.5 text-accent" />
                  </span>

                  <div className="glass rounded-2xl p-5 sm:p-7 transition-all duration-500 hover:shadow-glow-teal hover:-translate-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                      <h3 className="font-display text-lg sm:text-xl font-semibold text-ink break-words">
                        {job.role}
                      </h3>
                      <span className="font-mono text-xs text-muted">{job.period}</span>
                    </div>
                    <p className="text-sm text-accent mb-1">{job.company}</p>
                    <p className="eyebrow mb-5">{job.type}</p>

                    <ul className="space-y-2.5">
                      {job.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm text-muted">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-accent shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
