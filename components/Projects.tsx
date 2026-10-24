"use client";

import Image from "next/image";
import { Github, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Reveal from "@/components/Reveal";
import FloatingShapes from "@/components/FloatingShapes";
import { useContent } from "@/components/ContentProvider";
import { cn } from "@/lib/utils";

function cleanDomain(url?: string): string {
  if (!url) return "";
  try {
    return url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  } catch {
    return url;
  }
}

export default function Projects() {
  const { projects: allProjects, sections } = useContent();
  const head = sections.items.projects;
  const projects = allProjects.filter((p) => p.visible !== false);
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <section id="projects" className="section-padding relative">
      <FloatingShapes side="right" />
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal variant="fade-up">
          <p className="eyebrow mb-4">{head.eyebrow}</p>
        </Reveal>
        <Reveal variant="blur" delay={0.05}>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-14 max-w-2xl">
            {head.heading}
          </h2>
        </Reveal>

        {/* 2-column grid on desktop with 64px stagger on second column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 md:pb-16">
          {projects.map((project, i) => {
            const isSecondCol = i % 2 === 1;
            const baseDelay = shouldReduceMotion ? 0 : (i % 2) * 0.12;

            return (
              <div
                key={`${project.title}-${i}`}
                className={cn(
                  "flex flex-col",
                  isSecondCol ? "md:mt-16" : "md:mt-0"
                )}
              >
                {/* Part A: Browser Window Frame on top */}
                <Reveal
                  variant={shouldReduceMotion ? "fade" : "fade-up"}
                  delay={baseDelay}
                  once={true}
                >
                  <div
                    className={cn(
                      "group rounded-2xl glass border border-ink/10 shadow-lg overflow-hidden transition-all duration-500",
                      shouldReduceMotion
                        ? ""
                        : "hover:-translate-y-1.5 hover:shadow-glow-flame"
                    )}
                  >
                    {/* Browser Window Frame Top Bar (~36px tall) */}
                    <div className="h-9 px-3.5 bg-surface-2/70 border-b border-ink/10 flex items-center justify-between select-none">
                      {/* Three Window Control Dots */}
                      <div className="flex items-center gap-1.5 w-14 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-ink/25" />
                        <span className="w-2 h-2 rounded-full bg-ink/25" />
                        <span className="w-2 h-2 rounded-full bg-ink/25" />
                      </div>

                      {/* Centered Address Bar Pill */}
                      <div className="flex-1 flex justify-center px-2">
                        <div className="rounded-full bg-surface/80 border border-ink/[0.08] px-3 py-0.5 max-w-[200px] sm:max-w-[240px] w-full flex items-center justify-center">
                          <span className="font-mono text-[11px] text-muted/80 truncate text-center">
                            {cleanDomain(project.live || project.github)}
                          </span>
                        </div>
                      </div>

                      {/* Balancing spacer to keep address bar centered */}
                      <div className="w-14 shrink-0" aria-hidden="true" />
                    </div>

                    {/* Project Image filling frame with subtle bottom gradient */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={cn(
                          "object-cover transition-transform duration-700 ease-out",
                          shouldReduceMotion ? "" : "motion-safe:group-hover:scale-[1.05]"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-petrol via-petrol/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </Reveal>

                {/* Part B: Details below the frame (no extra card box) */}
                <Reveal
                  variant={shouldReduceMotion ? "fade" : "fade-up"}
                  delay={baseDelay + (shouldReduceMotion ? 0 : 0.1)}
                  once={true}
                >
                  <div className="pt-5 sm:pt-6">
                    {/* Small index number */}
                    <span className="font-mono text-xs text-muted/60 tracking-wider mb-1.5 block">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Title */}
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-ink mb-2.5 leading-snug">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Stack Pills */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-[11px] uppercase tracking-wide text-accent border border-accent/35 rounded-full px-3 py-1 transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/15 hover:border-accent/80"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Code & Live Demo Links */}
                    <div className="flex items-center gap-5">
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="hover"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors font-medium"
                      >
                        <Github className="h-4 w-4" /> Code
                      </a>
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor="hover"
                          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-soft transition-colors font-medium"
                        >
                          Live Demo <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
