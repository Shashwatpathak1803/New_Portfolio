/**
 * Soft decorative outlines that drift and spin at the edge of a section.
 * Purely visual: sits behind content, ignores the pointer, hidden from screen readers.
 */
export default function FloatingShapes({ side = "right" }: { side?: "left" | "right" }) {
  const a = side === "right" ? "right-[3%]" : "left-[3%]";
  const b = side === "right" ? "right-[10%]" : "left-[10%]";
  const c = side === "right" ? "left-[2%]" : "right-[2%]";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block">
      <div className={`absolute top-[8%] ${a} h-28 w-28 rounded-full border border-accent/30 animate-float-y`} />
      <div
        className={`absolute top-[16%] ${a} h-10 w-10 rounded-full bg-gradient-to-br from-accent/40 to-teal/30 blur-[2px] animate-float-y`}
        style={{ animationDelay: "1.2s" }}
      />
      <div className={`absolute top-[52%] ${b} h-14 w-14 rotate-45 rounded-lg border border-sandstone-surface/40 animate-spin-slow`} />
      <div
        className={`absolute bottom-[10%] ${c} h-20 w-20 rounded-full border border-teal/30 animate-float-y`}
        style={{ animationDelay: "2.4s" }}
      />
      <div className={`absolute bottom-[26%] ${c} h-2 w-2 rounded-full bg-accent animate-pulse-glow`} />
    </div>
  );
}
