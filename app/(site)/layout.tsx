import type { Metadata } from "next";
import type { ReactNode } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ContentProvider } from "@/components/ContentProvider";
import { getSession } from "@/lib/auth";
import { getContent } from "@/lib/content";

// The page is served from the cache (fast first load). Content is cached with a tag that is
// busted on every admin save, so edits still show up immediately. The session cookie is only
// read while maintenance mode is ON, which is the only time the page needs to be per-request.

export async function generateMetadata(): Promise<Metadata> {
  const { seo, profile } = await getContent();
  const title = seo.title;
  return {
    title,
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: profile.name }],
    metadataBase: new URL(seo.siteUrl),
    robots: seo.noindex ? { index: false, follow: false } : undefined,
    openGraph: { title, description: seo.description, type: "website", images: seo.ogImage ? [seo.ogImage] : [] },
    twitter: { card: "summary_large_image", title, description: seo.description },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const content = await getContent();
  const { maintenance, maintenanceMessage } = content.settings;

  if (maintenance && !(await getSession())) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <p className="eyebrow mb-4">{content.profile.name}</p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold tracking-tight max-w-xl">{maintenanceMessage}</h1>
        </div>
      </main>
    );
  }

  return (
    <ContentProvider content={content}>
      <AnimatedBackground />
      {children}
    </ContentProvider>
  );
}
