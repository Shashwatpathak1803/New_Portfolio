"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Mail, Star, Trash2 } from "lucide-react";
import { api, toast } from "@/components/admin/api";
import { Btn, IconBtn, Loading, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Msg = { _id: string; name: string; email: string; subject: string; message: string; read: boolean; starred: boolean; createdAt: string };
type Filter = "all" | "unread" | "starred";

export default function MessagesPage() {
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [db, setDb] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = () => api<{ messages: Msg[]; dbConnected: boolean }>("/api/admin/messages").then((r) => { setMsgs(r.messages); setDb(r.dbConnected); }).catch((e) => toast(e.message, "err"));
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => (msgs ?? []).filter((m) =>
    (filter === "all" || (filter === "unread" ? !m.read : m.starred)) &&
    (!q || [m.name, m.email, m.subject, m.message].join(" ").toLowerCase().includes(q.toLowerCase()))), [msgs, filter, q]);

  const patch = async (id: string, body: Partial<Msg>) => {
    setMsgs((c) => c && c.map((m) => (m._id === id ? { ...m, ...body } : m)));
    await api(`/api/admin/messages/${id}`, { method: "PATCH", json: body }).catch((e) => toast(e.message, "err"));
  };
  const bulk = async (action: "read" | "unread" | "delete") => {
    if (action === "delete" && !confirm(`Delete ${sel.length} message(s)?`)) return;
    await api("/api/admin/messages", { method: "POST", json: { action, ids: sel } }).catch((e) => toast(e.message, "err"));
    setSel([]);
    load();
  };
  const open = (m: Msg) => {
    setOpenId(openId === m._id ? null : m._id);
    if (!m.read) patch(m._id, { read: true });
  };
  const exportCsv = () => {
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [["Date", "Name", "Email", "Subject", "Message"], ...(msgs ?? []).map((m) => [m.createdAt, m.name, m.email, m.subject, m.message])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "messages.csv" }).click();
    URL.revokeObjectURL(url);
  };

  if (!msgs) return <Loading />;
  return (
    <>
      <PageHeader title="Messages" desc="Submissions from your contact form.">
        <Btn onClick={exportCsv} disabled={!msgs.length}><Download className="h-4 w-4" /> Export CSV</Btn>
      </PageHeader>
      {!db && <p className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Connect MongoDB (<code>MONGODB_URI</code>) to receive messages here.</p>}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", "unread", "starred"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-sm capitalize", filter === f ? "bg-orange-500 text-white" : "border border-zinc-300 dark:border-zinc-700")}>{f}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="ml-auto rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
      </div>
      {sel.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-sm">
          <span>{sel.length} selected</span>
          <Btn onClick={() => bulk("read")}>Mark read</Btn>
          <Btn onClick={() => bulk("unread")}>Mark unread</Btn>
          <Btn variant="danger" onClick={() => bulk("delete")}>Delete</Btn>
        </div>
      )}
      {shown.length === 0 ? <p className="py-16 text-center text-sm text-zinc-500">No messages.</p> : (
        <div className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
          {shown.map((m) => (
            <div key={m._id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <input type="checkbox" checked={sel.includes(m._id)} onChange={(e) => setSel(e.target.checked ? [...sel, m._id] : sel.filter((x) => x !== m._id))} />
                <IconBtn onClick={() => patch(m._id, { starred: !m.starred })} aria-label="Star"><Star className={cn("h-4 w-4", m.starred && "fill-orange-500 text-orange-500")} /></IconBtn>
                <button onClick={() => open(m)} className="min-w-0 flex-1 text-left">
                  <p className={cn("truncate text-sm", !m.read && "font-semibold")}>{m.name} <span className="font-normal text-zinc-500">— {m.subject}</span></p>
                  <p className="truncate text-xs text-zinc-500">{m.message}</p>
                </button>
                <span className="hidden text-xs text-zinc-500 sm:block">{new Date(m.createdAt).toLocaleString()}</span>
                {!m.read && <span className="h-2 w-2 rounded-full bg-orange-500" />}
              </div>
              {openId === m._id && (
                <div className="space-y-3 bg-zinc-50 px-5 py-4 text-sm dark:bg-zinc-950/50">
                  <p className="text-xs text-zinc-500">From {m.name} &lt;{m.email}&gt;</p>
                  <p className="whitespace-pre-wrap">{m.message}</p>
                  <div className="flex gap-2">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"><Mail className="h-4 w-4" /> Reply</a>
                    <Btn variant="danger" onClick={async () => { if (confirm("Delete this message?")) { await api(`/api/admin/messages/${m._id}`, { method: "DELETE" }); load(); } }}><Trash2 className="h-4 w-4" /> Delete</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
