import { unstable_cache } from "next/cache";
import { connectDb, hasDb } from "./db";
import { SiteDoc } from "./models";
import { defaultContent } from "./data";
import { deepMerge } from "./merge";
import type { SiteContent } from "./types";

export const CONTENT_KEYS = Object.keys(defaultContent) as (keyof SiteContent)[];

function normalize(c: SiteContent): SiteContent {
  c.profile.social.email = c.profile.email ? `mailto:${c.profile.email}` : "";
  c.services = c.services.map((s, i) => ({ ...s, number: String(i + 1).padStart(2, "0") }));
  c.projects = c.projects.map((p) => ({ ...p, visible: p.visible !== false }));
  return c;
}

/** Always reads the database (used by the admin panel). Falls back to defaults. */
export async function getContentFresh(): Promise<SiteContent> {
  let stored: unknown = null;
  if (hasDb()) {
    try {
      await connectDb();
      stored = (await SiteDoc.findOne({ key: "main" }).lean())?.data ?? null;
    } catch (e) {
      console.error("[content] DB unavailable, using defaults:", (e as Error).message);
    }
  }
  return normalize(deepMerge(structuredClone(defaultContent), stored));
}

/** Cached for the public site; busted with revalidateTag("content") on every admin save. */
export const getContent = unstable_cache(getContentFresh, ["site-content"], { tags: ["content"] });
