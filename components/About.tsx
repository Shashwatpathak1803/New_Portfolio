"use client";

import { Sparkles, Code2, BrainCircuit, Briefcase } from "lucide-react";
import Reveal, { RevealGroup, revealItem } from "@/components/Reveal";
import { motion } from "framer-motion";
import { useContent } from "@/components/ContentProvider";
import AnimatedCounter from "@/components/AnimatedCounter";
import FloatingShapes from "@/components/FloatingShapes";

const ICONS = [Code2, BrainCircuit, Briefcase, Sparkles];

export default function About() {
  const { about, stats, sections } = useContent();
  const head = sections.items.about;
  const highlights = about.highlights.map((text, i) => ({ icon: ICONS[i % ICONS.length], text }));
  return (
    <section id="about" className="section-padding relative">
      <FloatingShapes side="right" />
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <div>
            <Reveal variant="fade-up">
              <p className="eyebrow mb-4">{head.eyebrow}</p>
            </Reveal>
            <Reveal variant="blur" delay={0.05}>
              <h2 className="font-display text-3xl md:text-5xl font-semibold leading-[1.05] tracking-tight mb-8">
                {head.heading}
              </h2>
            </Reveal>

            {about.paragraphs.map((p, i) => (
              <Reveal key={i} variant="fade-up" delay={0.1 + i * 0.08}>
                <p className="text-muted leading-relaxed mb-5 max-w-xl">{p}</p>
              </Reveal>
            ))}

            <RevealGroup className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map(({ icon: Icon, text }) => (
                <motion.div
                  key={text}
                  variants={revealItem}
                  className="glass rounded-xl p-4 flex items-start gap-3"
                >
                  <Icon className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                  <span className="text-sm text-ink/90">{text}</span>
                </motion.div>
              ))}
            </RevealGroup>
          </div>

          {/* Right: stats */}
          <div className="relative">
            <div className="absolute -inset-10 -z-10 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(232,117,42,0.16), transparent)" }} />
            <RevealGroup className="grid grid-cols-2 gap-5">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={revealItem}
                  whileHover={{ y: -6 }}
                  className="glass rounded-2xl p-5 sm:p-7 group transition-shadow duration-500 hover:shadow-glow-accent"
                >
                  <div className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-gradient">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-3 text-sm text-muted">{stat.label}</p>
                  <div className="mt-4 h-px w-full bg-gradient-to-r from-accent/50 via-teal/40 to-transparent group-hover:via-sandstone-surface/50 transition-colors duration-500" />
                </motion.div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </div>
    </section>
  );
}
