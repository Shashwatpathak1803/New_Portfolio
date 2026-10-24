"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Card, Grid, ItemList, Loading, PageHeader, SaveBar, StringList, Text } from "@/components/admin/ui";

export default function AboutPage() {
  const e = useEditor(["about", "stats"]);
  if (!e.draft) return <Loading />;
  const { about, stats } = e.draft;
  return (
    <>
      <PageHeader title="About & Stats" desc="Heading text is edited in Sections & Order." />
      <Card title="Paragraphs">
        <StringList label="About paragraphs" multiline value={about.paragraphs} onChange={(v) => e.patch("about", { paragraphs: v })} addLabel="Add paragraph" />
      </Card>
      <Card title="Highlight cards" desc="Short lines shown under the paragraphs (icons are assigned automatically).">
        <StringList label="Highlights" value={about.highlights} onChange={(v) => e.patch("about", { highlights: v })} addLabel="Add highlight" />
      </Card>
      <Card title="Stat counters">
        <ItemList
          items={stats}
          onChange={(v) => e.set("stats", v)}
          blank={() => ({ label: "New stat", value: 0, suffix: "+" })}
          summary={(s) => `${s.value}${s.suffix} — ${s.label}`}
          addLabel="Add stat"
          render={(s, u) => (
            <Grid cols={3}>
              <Text label="Label" value={s.label} onChange={(v) => u({ label: v })} />
              <Text label="Number" type="number" value={s.value} onChange={(v) => u({ value: Number(v) || 0 })} />
              <Text label="Suffix" value={s.suffix} onChange={(v) => u({ suffix: v })} placeholder="+" />
            </Grid>
          )}
        />
      </Card>
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
