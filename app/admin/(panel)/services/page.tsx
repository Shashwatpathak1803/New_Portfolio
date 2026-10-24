"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Area, ItemList, Loading, PageHeader, SaveBar, Text } from "@/components/admin/ui";
import type { Service } from "@/lib/types";

export default function ServicesPage() {
  const e = useEditor(["services"]);
  if (!e.draft) return <Loading />;
  return (
    <>
      <PageHeader title="Services" desc="Numbers (01, 02…) are assigned automatically from the order." />
      <ItemList<Service>
        items={e.draft.services}
        onChange={(v) => e.set("services", v)}
        blank={() => ({ number: "", title: "New service", description: "" })}
        summary={(s, i) => `${String(i + 1).padStart(2, "0")} · ${s.title}`}
        addLabel="Add service"
        render={(s, u) => (
          <>
            <Text label="Title" value={s.title} onChange={(v) => u({ title: v })} />
            <Area label="Description" value={s.description} onChange={(v) => u({ description: v })} />
          </>
        )}
      />
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
