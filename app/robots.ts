import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { seo } = await getContent();
  return {
    rules: seo.noindex ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${seo.siteUrl}/sitemap.xml`,
  };
}
