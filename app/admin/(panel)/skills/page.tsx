"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Card, ItemList, Loading, PageHeader, SaveBar, Text } from "@/components/admin/ui";
import type { SkillGroup } from "@/lib/types";

export default function SkillsPage() {
  const e = useEditor(["skillGroups"]);
  if (!e.draft) return <Loading />;
  return (
    <>
      <PageHeader title="Skills" desc="Groups of skills with a proficiency level (0–100)." />
      <ItemList<SkillGroup>
        items={e.draft.skillGroups}
        onChange={(v) => e.set("skillGroups", v)}
        blank={() => ({ groupLabel: "New group", skills: [] })}
        summary={(g) => `${g.groupLabel} (${g.skills.length})`}
        addLabel="Add group"
        render={(g, u) => (
          <>
            <Text label="Group name" value={g.groupLabel} onChange={(v) => u({ groupLabel: v })} />
            <Card className="!mb-0 !p-3">
              <ItemList
                items={g.skills}
                onChange={(skills) => u({ skills })}
                blank={() => ({ name: "New skill", level: 70 })}
                summary={(s) => `${s.name} — ${s.level}%`}
                addLabel="Add skill"
                render={(s, us) => (
                  <>
                    <Text label="Skill name" value={s.name} onChange={(v) => us({ name: v })} />
                    <div>
                      <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Level: {s.level}%</span>
                      <input type="range" min={0} max={100} value={s.level} onChange={(ev) => us({ level: Number(ev.target.value) })} className="w-full accent-orange-500" />
                    </div>
                  </>
                )}
              />
            </Card>
          </>
        )}
      />
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
