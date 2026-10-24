"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Card, Grid, ItemList, Loading, PageHeader, SaveBar, Text, Toggle } from "@/components/admin/ui";
import type { ContactInfo } from "@/lib/types";

export default function ContactPage() {
  const e = useEditor(["contact"]);
  if (!e.draft) return <Loading />;
  const c = e.draft.contact;
  return (
    <>
      <PageHeader title="Contact" desc="Contact form and the info cards beside it." />
      <Card title="Form">
        <Toggle label="Show contact form" desc="Messages land in your Messages inbox." checked={c.formEnabled} onChange={(v) => e.patch("contact", { formEnabled: v })} />
      </Card>
      <Card title="Info cards" desc="Icons: Email, LinkedIn, GitHub and Location get their own icon (by label); others use a mail icon.">
        <ItemList<ContactInfo>
          items={c.info}
          onChange={(v) => e.patch("contact", { info: v })}
          blank={() => ({ label: "Label", value: "", href: "" })}
          summary={(i) => `${i.label}: ${i.value}`}
          addLabel="Add card"
          render={(i, u) => (
            <Grid cols={3}>
              <Text label="Label" value={i.label} onChange={(v) => u({ label: v })} />
              <Text label="Text shown" value={i.value} onChange={(v) => u({ value: v })} />
              <Text label="Link (optional)" value={i.href ?? ""} onChange={(v) => u({ href: v })} />
            </Grid>
          )}
        />
      </Card>
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
