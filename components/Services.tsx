"use client";

import Reveal from "@/components/Reveal";
import FloatingShapes from "@/components/FloatingShapes";
import TiltCard from "@/components/TiltCard";
import { useContent } from "@/components/ContentProvider";

export default function Services() {
  const { services, sections } = useContent();
  const head = sections.items.services;
  return (
    <section id="services" className="section-padding relative">
      <FloatingShapes side="left" />
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal variant="fade-up">
          <p className="eyebrow mb-4">{head.eyebrow}</p>
        </Reveal>
        <Reveal variant="blur" delay={0.05}>
          <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-14 max-w-2xl">
            {head.heading}
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <Reveal key={service.number} variant="fade-up" delay={(i % 3) * 0.08}>
              <TiltCard className="group h-full">
                <div className="shine relative h-full rounded-2xl p-7 glass overflow-hidden transition-shadow duration-500 hover:shadow-glow-accent">
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-accent/40 transition-colors duration-500" />
                  <span className="font-mono text-xs text-accent font-medium">{service.number}</span>
                  <h3 className="font-display text-xl font-semibold text-ink mt-4 mb-3 break-words">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">{service.description}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
