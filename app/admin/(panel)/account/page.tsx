"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { api, toast } from "@/components/admin/api";
import { Btn, Card, PageHeader, Text, Toggle } from "@/components/admin/ui";

export default function AccountPage() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [withMsgs, setWithMsgs] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const changePw = async () => {
    if (next !== again) return toast("New passwords do not match", "err");
    try {
      await api("/api/admin/password", { method: "POST", json: { current: cur, next } });
      toast("Password updated");
      setCur(""); setNext(""); setAgain("");
    } catch (e) { toast((e as Error).message, "err"); }
  };

  const restore = async (f?: File) => {
    if (!f) return;
    if (!confirm("Restore from this backup? It replaces the sections included in the file.")) return;
    try {
      const body = JSON.parse(await f.text());
      const r = await api<{ sections: number }>("/api/admin/backup", { method: "POST", json: body });
      toast(`Restored ${r.sections} sections`);
    } catch (e) { toast((e as Error).message || "Invalid file", "err"); }
  };

  const resetAll = async () => {
    if (!confirm("Reset ALL content to the original defaults? This cannot be undone (download a backup first).")) return;
    try { await api("/api/admin/content", { method: "DELETE" }); toast("Everything reset to defaults"); } catch (e) { toast((e as Error).message, "err"); }
  };

  return (
    <>
      <PageHeader title="Account & Backup" />
      <Card title="Change password" desc="Stored as a bcrypt hash in MongoDB. Minimum 10 characters.">
        <Text label="Current password" type="password" value={cur} onChange={setCur} />
        <Text label="New password" type="password" value={next} onChange={setNext} />
        <Text label="Repeat new password" type="password" value={again} onChange={setAgain} />
        <Btn variant="primary" onClick={changePw} disabled={!cur || !next}>Update password</Btn>
      </Card>
      <Card title="Backup & restore" desc="Exports all site content as a JSON file. Uploaded media files are not included.">
        <Toggle label="Include contact messages" checked={withMsgs} onChange={setWithMsgs} />
        <div className="flex flex-wrap gap-2">
          <a href={`/api/admin/backup${withMsgs ? "?messages=1" : ""}`} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Download className="h-4 w-4" /> Download backup</a>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { restore(e.target.files?.[0]); e.target.value = ""; }} />
          <Btn onClick={() => file.current?.click()}><Upload className="h-4 w-4" /> Restore from file</Btn>
        </div>
      </Card>
      <Card title="Danger zone">
        <Btn variant="danger" onClick={resetAll}>Reset all content to defaults</Btn>
      </Card>
    </>
  );
}
