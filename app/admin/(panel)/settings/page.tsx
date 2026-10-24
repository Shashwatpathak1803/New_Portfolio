"use client";

import { useEditor } from "@/components/admin/useEditor";
import { Area, Card, Loading, PageHeader, SaveBar, Select, Text, Toggle } from "@/components/admin/ui";

export default function SettingsPage() {
  const e = useEditor(["settings"]);
  if (!e.draft) return <Loading />;
  const s = e.draft.settings;
  const p = (x: Partial<typeof s>) => e.patch("settings", x);
  return (
    <>
      <PageHeader title="Settings" />
      <Card title="Appearance">
        <Select label="Default theme (for first-time visitors)" value={s.defaultTheme} onChange={(v) => p({ defaultTheme: v as "light" | "dark" })} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        <Toggle label="Loading screen" checked={s.showLoader} onChange={(v) => p({ showLoader: v })} />
        <Toggle label="Custom cursor (desktop)" checked={s.customCursor} onChange={(v) => p({ customCursor: v })} />
        <Text label="Footer text" value={s.footerText} onChange={(v) => p({ footerText: v })} hint="Shown after “© year Name.”" />
      </Card>
      <Card title="Analytics">
        <Toggle label="Count page views" desc="Anonymous, one per session. No cookies, no personal data." checked={s.trackViews} onChange={(v) => p({ trackViews: v })} />
      </Card>
      <Card
        title="Email Composer & Sender Account"
        desc="Configure the authenticated sender address and display name used by the public Email Composer to send job outreach emails directly with attachments."
      >
        <Text
          label="Sender Email Address"
          value={s.senderEmail ?? ""}
          onChange={(v) => p({ senderEmail: v })}
          placeholder="shashwatpathak901@gmail.com"
          hint="Must correspond to the authenticated SMTP credentials (SMTP_USER) configured in .env.local on the server."
        />
        <Text
          label="Sender Display Name"
          value={s.senderName ?? ""}
          onChange={(v) => p({ senderName: v })}
          placeholder="Shashwat Pathak"
          hint="The full name recruiters see in the From header of outgoing application emails."
        />
      </Card>
      <Card title="Maintenance mode" desc="Visitors see a message instead of the site. You still see the real site while logged in.">
        <Toggle label="Enable maintenance mode" checked={s.maintenance} onChange={(v) => p({ maintenance: v })} />
        <Area label="Message" rows={2} value={s.maintenanceMessage} onChange={(v) => p({ maintenanceMessage: v })} />
      </Card>
      <SaveBar {...e} onSave={e.save} onDiscard={e.discard} onReset={e.resetToDefaults} />
    </>
  );
}
