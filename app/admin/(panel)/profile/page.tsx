"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Card, Grid, ImageField, Loading, PageHeader, SaveBar, Tags, Text, Area, Toggle } from "@/components/admin/ui";

export default function ProfilePage() {
  const e = useEditor(["profile", "hero"]);
  if (!e.draft) return <Loading />;
  const { profile: p, hero: h } = e.draft;
  const social = (k: keyof typeof p.social, label: string) => (
    <Text label={label} value={p.social[k]} placeholder="https://…" onChange={(v) => e.patch("profile", { social: { ...p.social, [k]: v } })} />
  );
  return (
    <>
      <PageHeader title="Profile & Hero" desc="Your identity and the top section of the site." />
      <Card title="Profile">
        <Grid>
          <Text label="Full name" value={p.name} onChange={(v) => e.patch("profile", { name: v })} />
          <Text label="Location" value={p.location} onChange={(v) => e.patch("profile", { location: v })} />
          <Text label="Public email" type="email" value={p.email} onChange={(v) => e.patch("profile", { email: v })} />
        </Grid>
        <Tags label="Roles / titles" value={p.roles} onChange={(v) => e.patch("profile", { roles: v })} />
        <ImageField label="Profile photo" value={p.photo} onChange={(v) => e.patch("profile", { photo: v })} />
        <ImageField label="Resume (PDF)" accept="pdf" value={p.resumeUrl} onChange={(v) => e.patch("profile", { resumeUrl: v })} hint="Upload a PDF or paste a link. Used by the download button in the hero." />
      </Card>
      <Card title="Social links" desc="Empty links are hidden on the site.">
        <Grid>
          {social("github", "GitHub")}
          {social("linkedin", "LinkedIn")}
          {social("instagram", "Instagram")}
          {social("twitter", "X / Twitter")}
          {social("youtube", "YouTube")}
          {social("website", "Website")}
        </Grid>
      </Card>
      <Card title="Hero section">
        <Toggle label="Show badge" desc="The small pill above the heading" checked={h.showBadge} onChange={(v) => e.patch("hero", { showBadge: v })} />
        {h.showBadge && <Text label="Badge text" value={h.badge} onChange={(v) => e.patch("hero", { badge: v })} placeholder="Open to work" />}
        <Grid>
          <Text label="Heading line 1" value={h.titleLine1} onChange={(v) => e.patch("hero", { titleLine1: v })} />
          <Text label="Heading line 2" value={h.titleLine2} onChange={(v) => e.patch("hero", { titleLine2: v })} />
        </Grid>
        <Area label="Sub text" value={h.subtext} rows={3} onChange={(v) => e.patch("hero", { subtext: v })} />
        <Text label="Main button label" value={h.ctaLabel} onChange={(v) => e.patch("hero", { ctaLabel: v })} />
        <Toggle label="Show resume download button" checked={h.showResumeButton} onChange={(v) => e.patch("hero", { showResumeButton: v })} />
      </Card>
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
