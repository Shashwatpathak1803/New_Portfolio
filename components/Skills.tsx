"use client";

import { motion, useReducedMotion } from "framer-motion";
import Reveal from "@/components/Reveal";
import { useContent } from "@/components/ContentProvider";

export default function Skills() {
  const { skillGroups, sections } = useContent();
  const head = sections.items.skills;
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <section id="skills" className="section-padding relative">
      <div className="absolute inset-0 bg-mesh-1 opacity-30 -z-10" />
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal variant="fade-up">
          <p className="eyebrow mb-4">{head.eyebrow}</p>
        </Reveal>
        <Reveal variant="blur" delay={0.05}>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-14 max-w-2xl">
            {head.heading}
          </h2>
        </Reveal>

        {/* Single container with stacked category rows */}
        <Reveal variant="fade-up" delay={0.1}>
          <div className="glass rounded-3xl border border-ink/10 shadow-xl overflow-hidden divide-y divide-ink/[0.08]">
            {skillGroups.map((group, groupIndex) => (
              <div
                key={group.groupLabel}
                className="p-6 sm:p-8 lg:p-9 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8"
              >
                {/* Left Column: Category info (approx 220px wide) */}
                <div className="w-full lg:w-[220px] shrink-0">
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink">
                    {group.groupLabel}
                  </h3>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted mt-1">
                    {group.skills.length} skills
                  </p>
                </div>

                {/* Right Column: Fill pills in flex-wrap layout with 12px (gap-3) gap */}
                <div className="flex-1 flex flex-wrap gap-3 items-center">
                  {group.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill.name}
                      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="group relative overflow-hidden rounded-full h-[44px] min-h-[44px] w-full sm:w-auto px-5 flex items-center justify-between gap-4 border border-ink/[0.12] hover:border-ink/25 bg-surface-2/40 backdrop-blur-sm transition-all duration-300 hover:shadow-sm cursor-default"
                    >
                      {/* Animated progress fill bar */}
                      <motion.div
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-teal to-sandstone-surface opacity-[0.28] group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
                        initial={{ width: shouldReduceMotion ? `${skill.level}%` : 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.9,
                          delay: shouldReduceMotion ? 0 : groupIndex * 0.12 + skillIndex * 0.07,
                          ease: "easeOut",
                        }}
                      />

                      {/* Pill content: fully legible text in full ink colour */}
                      <span className="relative z-10 text-sm font-medium text-ink select-none whitespace-nowrap">
                        {skill.name}
                      </span>
                      <span className="relative z-10 font-mono text-xs text-muted tabular-nums select-none whitespace-nowrap">
                        {skill.level}%
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
