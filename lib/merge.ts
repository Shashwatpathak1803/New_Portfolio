/** Deep-merge `over` onto `base`. Plain objects merge; arrays and primitives replace. */
export function deepMerge<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) || typeof base !== "object" || base === null) {
    return (typeof over === typeof base || Array.isArray(base) === Array.isArray(over) ? over : base) as T;
  }
  if (typeof over !== "object" || Array.isArray(over)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    out[k] = k in out ? deepMerge(out[k], v) : v;
  }
  return out as T;
}
