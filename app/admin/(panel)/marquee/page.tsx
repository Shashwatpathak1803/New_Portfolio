"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Card, Loading, PageHeader, SaveBar, Tags, Text, Toggle } from "@/components/admin/ui";

export default function MarqueePage() {
  const e = useEditor(["marquee"]);
  if (!e.draft) return <Loading />;
  const m = e.draft.marquee;
  return (
    <>
      <PageHeader title="Tech Marquee" desc="The two scrolling rows of technologies under the hero." />
      <Card>
        <Toggle label="Show marquee" checked={m.show} onChange={(v) => e.patch("marquee", { show: v })} />
        <Text label="Heading" value={m.heading} onChange={(v) => e.patch("marquee", { heading: v })} />
        <Tags label="Row 1 (scrolls left)" value={m.rowOne} onChange={(v) => e.patch("marquee", { rowOne: v })} />
        <Tags label="Row 2 (scrolls right)" value={m.rowTwo} onChange={(v) => e.patch("marquee", { rowTwo: v })} />
      </Card>
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
