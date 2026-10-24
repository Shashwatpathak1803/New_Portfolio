"use client";

import Reveal from "@/components/Reveal";
import { useContent } from "@/components/ContentProvider";

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // The list is rendered twice and the track slides by -50%, so the loop is seamless.
  const doubled = [...items, ...items];
  return (
    <div className="marquee">
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            aria-hidden={i >= items.length}
            className="glass mr-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-ink/80 whitespace-nowrap"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-accent to-teal" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TechMarquee() {
  const { marquee } = useContent();
  return (
    <section aria-label="Technologies I work with" className="relative py-10 md:py-14">
      <Reveal variant="fade">
        <p className="eyebrow mb-6 text-center">{marquee.heading}</p>
        <div className="space-y-4">
          {marquee.rowOne.length > 0 && <Row items={marquee.rowOne} />}
          {marquee.rowTwo.length > 0 && <Row items={marquee.rowTwo} reverse />}
        </div>
      </Reveal>
    </section>
  );
}
