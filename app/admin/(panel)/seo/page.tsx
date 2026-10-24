"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Area, Card, ImageField, Loading, PageHeader, SaveBar, Tags, Text, Toggle } from "@/components/admin/ui";

export default function SeoPage() {
  const e = useEditor(["seo"]);
  if (!e.draft) return <Loading />;
  const s = e.draft.seo;
  return (
    <>
      <PageHeader title="SEO" desc="How your site appears on Google and when shared." />
      <Card>
        <Text label="Site URL" value={s.siteUrl} onChange={(v) => e.patch("seo", { siteUrl: v.replace(/\/+$/, "") })} hint="Full address, e.g. https://yourname.dev (used for sitemap & social cards)" />
        <Text label="Page title" value={s.title} onChange={(v) => e.patch("seo", { title: v })} hint={`${s.title.length} characters (aim for under 60)`} />
        <Area label="Meta description" rows={3} value={s.description} onChange={(v) => e.patch("seo", { description: v })} hint={`${s.description.length} characters (aim for under 160)`} />
        <Tags label="Keywords" value={s.keywords} onChange={(v) => e.patch("seo", { keywords: v })} />
        <ImageField label="Social share image (Open Graph)" value={s.ogImage} onChange={(v) => e.patch("seo", { ogImage: v })} hint="1200×630 works best" />
        <Toggle label="Hide from search engines (noindex)" desc="Use while the site is still a work in progress." checked={s.noindex} onChange={(v) => e.patch("seo", { noindex: v })} />
      </Card>
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
