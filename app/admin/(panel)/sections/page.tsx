"use client";

import { useEditor } from "@/components/admin/useEditor";
import { move } from "@/components/admin/api";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, IconBtn, Loading, PageHeader, SaveBar, Text, Toggle } from "@/components/admin/ui";
import type { SectionId } from "@/lib/types";

export default function SectionsPage() {
  const e = useEditor(["sections"]);
  if (!e.draft) return <Loading />;
  const s = e.draft.sections;
  const setItem = (id: SectionId, p: Partial<(typeof s.items)[SectionId]>) =>
    e.set("sections", { ...s, items: { ...s.items, [id]: { ...s.items[id], ...p } } });
  return (
    <>
      <PageHeader title="Sections & Order" desc="Show, hide, reorder and retitle the sections of your homepage." />
      {s.order.map((id, i) => (
        <Card key={id}>
          <div className="flex items-center justify-between">
            <p className="font-semibold capitalize">{id}</p>
            <div className="flex items-center gap-1">
              <IconBtn disabled={i === 0} onClick={() => e.set("sections", { ...s, order: move(s.order, i, -1) })} aria-label="Move up"><ArrowUp className="h-4 w-4" /></IconBtn>
              <IconBtn disabled={i === s.order.length - 1} onClick={() => e.set("sections", { ...s, order: move(s.order, i, 1) })} aria-label="Move down"><ArrowDown className="h-4 w-4" /></IconBtn>
            </div>
          </div>
          <Toggle label="Visible" checked={s.items[id].visible} onChange={(v) => setItem(id, { visible: v })} />
          <Text label="Small label (eyebrow)" value={s.items[id].eyebrow} onChange={(v) => setItem(id, { eyebrow: v })} />
          <Text label="Heading" value={s.items[id].heading} onChange={(v) => setItem(id, { heading: v })} />
        </Card>
      ))}
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
