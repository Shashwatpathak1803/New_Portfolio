"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { api, toast } from "@/components/admin/api";
import { Btn, IconBtn, Loading, PageHeader, uploadFile, type MediaItem } from "@/components/admin/ui";

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [db, setDb] = useState(true);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const load = () => api<{ items: MediaItem[]; dbConnected: boolean }>("/api/admin/media").then((r) => { setItems(r.items); setDb(r.dbConnected); }).catch((e) => toast(e.message, "err"));
  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      try { await uploadFile(f); } catch (e) { toast(`${f.name}: ${(e as Error).message}`, "err"); }
    }
    setBusy(false);
    load();
  };
  const remove = async (m: MediaItem) => {
    if (!confirm(`Delete ${m.name}? Anything using it will show a broken image.`)) return;
    await api(`/api/admin/media/${m.id}`, { method: "DELETE" }).catch((e) => toast(e.message, "err"));
    load();
  };

  if (!items) return <Loading />;
  return (
    <>
      <PageHeader title="Media Library" desc="Images and PDFs (max 4 MB each) are stored in your MongoDB database.">
        <input ref={input} type="file" multiple hidden accept="image/*,application/pdf" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
        <Btn variant="primary" disabled={busy || !db} onClick={() => input.current?.click()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload</Btn>
      </PageHeader>
      {!db && <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Connect MongoDB (<code>MONGODB_URI</code>) to upload files.</p>}
      {items.length === 0 ? <p className="py-16 text-center text-sm text-zinc-500">No uploads yet.</p> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex aspect-video items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                {m.mime.startsWith("image/") ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt={m.name} className="h-full w-full object-cover" /> : <span className="text-sm font-semibold">PDF</span>}
              </div>
              <div className="flex items-center gap-1 p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{m.name}</p>
                  <p className="text-[11px] text-zinc-500">{(m.size / 1024).toFixed(0)} KB</p>
                </div>
                <IconBtn onClick={() => { navigator.clipboard.writeText(location.origin + m.url); toast("Link copied"); }} aria-label="Copy link"><Copy className="h-4 w-4" /></IconBtn>
                <IconBtn onClick={() => remove(m)} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
