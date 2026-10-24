"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Area, Grid, ImageField, ItemList, Loading, PageHeader, SaveBar, Tags, Text, Toggle } from "@/components/admin/ui";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const e = useEditor(["projects"]);
  if (!e.draft) return <Loading />;
  return (
    <>
      <PageHeader title="Projects" desc="Order here = order on the site. Hidden projects stay saved but are not shown." />
      <ItemList<Project>
        items={e.draft.projects}
        onChange={(v) => e.set("projects", v)}
        blank={() => ({ title: "New project", description: "", image: "", stack: [], github: "", live: "", visible: true })}
        summary={(p) => <>{p.title}{p.visible === false && <span className="ml-2 text-xs text-zinc-500">(hidden)</span>}</>}
        addLabel="Add project"
        render={(p, u) => (
          <>
            <Toggle label="Visible on site" checked={p.visible !== false} onChange={(v) => u({ visible: v })} />
            <Text label="Title" value={p.title} onChange={(v) => u({ title: v })} />
            <Area label="Description" value={p.description} onChange={(v) => u({ description: v })} />
            <ImageField label="Screenshot" value={p.image} onChange={(v) => u({ image: v })} hint="Recommended 16:10 ratio" />
            <Tags label="Tech stack" value={p.stack} onChange={(v) => u({ stack: v })} />
            <Grid>
              <Text label="GitHub URL" value={p.github} onChange={(v) => u({ github: v })} />
              <Text label="Live URL (optional)" value={p.live ?? ""} onChange={(v) => u({ live: v })} />
            </Grid>
          </>
        )}
      />
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
