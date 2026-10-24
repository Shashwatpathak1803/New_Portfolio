/** Smooth-scroll helpers that cooperate with Lenis (set up in SmoothScrollProvider). */
type LenisLike = { scrollTo: (target: number | HTMLElement, opts?: { offset?: number; duration?: number }) => void };

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.1 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export function scrollToTop() {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis) lenis.scrollTo(0, { duration: 1.1 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}
