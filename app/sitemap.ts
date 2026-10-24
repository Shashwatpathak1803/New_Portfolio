import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { seo } = await getContent();
  return [{ url: seo.siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
