"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteContent } from "@/lib/types";

const Ctx = createContext<SiteContent | null>(null);

export function ContentProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <Ctx.Provider value={content}>{children}</Ctx.Provider>;
}

export function useContent(): SiteContent {
  const c = useContext(Ctx);
  if (!c) throw new Error("useContent must be used inside <ContentProvider>");
  return c;
}
