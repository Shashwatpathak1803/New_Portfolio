"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Grid, ItemList, Loading, PageHeader, SaveBar, StringList, Text } from "@/components/admin/ui";
import type { ExperienceItem } from "@/lib/types";

export default function ExperiencePage() {
  const e = useEditor(["experience"]);
  if (!e.draft) return <Loading />;
  return (
    <>
      <PageHeader title="Experience" desc="Jobs and internships, shown in this order." />
      <ItemList<ExperienceItem>
        items={e.draft.experience}
        onChange={(v) => e.set("experience", v)}
        blank={() => ({ company: "Company", role: "Role", period: "2025 — Present", type: "Field", points: [] })}
        summary={(j) => `${j.role} · ${j.company}`}
        addLabel="Add experience"
        render={(j, u) => (
          <>
            <Grid>
              <Text label="Company" value={j.company} onChange={(v) => u({ company: v })} />
              <Text label="Role" value={j.role} onChange={(v) => u({ role: v })} />
              <Text label="Period" value={j.period} onChange={(v) => u({ period: v })} />
              <Text label="Type / field" value={j.type} onChange={(v) => u({ type: v })} />
            </Grid>
            <StringList label="Bullet points" value={j.points} onChange={(v) => u({ points: v })} addLabel="Add point" />
          </>
        )}
      />
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
