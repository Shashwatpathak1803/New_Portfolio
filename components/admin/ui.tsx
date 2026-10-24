"use client";

import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, move, toast } from "./api";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 " +
  "focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600";

export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-sm text-zinc-500">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, desc, children, className }: { title?: string; desc?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60", className)}>
      {(title || desc) && (
        <div className="mb-4">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {desc && <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-zinc-500">{hint}</span>}
    </label>
  );
}

export const Grid = ({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) => (
  <div className={cn("grid gap-4", cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>{children}</div>
);

export function Text({ label, hint, value, onChange, placeholder, type = "text" }: {
  label: string; hint?: string; value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} className={inputCls} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Area({ label, hint, value, onChange, rows = 4, placeholder }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} className={cn(inputCls, "resize-y")} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-zinc-500">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-orange-500" : "bg-zinc-300 dark:bg-zinc-700")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

export function Btn({ variant = "ghost", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50",
        variant === "primary" && "bg-orange-500 text-white hover:bg-orange-600",
        variant === "ghost" && "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
        variant === "danger" && "border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40",
        className
      )}
    />
  );
}

export const IconBtn = ({ children, ...p }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...p}
    className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
  >
    {children}
  </button>
);

/** Chips input: type and press Enter or comma. */
export function Tags({ label, value, onChange, placeholder = "Type and press Enter" }: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [text, setText] = useState("");
  const add = () => {
    const parts = text.split(",").map((t) => t.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setText("");
  };
  return (
    <Field label={label}>
      <div className={cn(inputCls, "flex flex-wrap items-center gap-1.5 !py-1.5")}>
        {value.map((t, i) => (
          <span key={t + i} className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs text-orange-700 dark:text-orange-300">
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
    </Field>
  );
}

/** Editable list of plain strings (bullets, paragraphs, …). */
export function StringList({ label, value, onChange, multiline, addLabel = "Add", placeholder }: {
  label: string; value: string[]; onChange: (v: string[]) => void; multiline?: boolean; addLabel?: string; placeholder?: string;
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="flex items-start gap-1">
            {multiline ? (
              <textarea rows={3} className={cn(inputCls, "resize-y")} value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            ) : (
              <input className={inputCls} value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
            )}
            <IconBtn onClick={() => onChange(move(value, i, -1))} disabled={i === 0} aria-label="Move up"><ArrowUp className="h-4 w-4" /></IconBtn>
            <IconBtn onClick={() => onChange(move(value, i, 1))} disabled={i === value.length - 1} aria-label="Move down"><ArrowDown className="h-4 w-4" /></IconBtn>
            <IconBtn onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4" /></IconBtn>
          </div>
        ))}
      </div>
      <Btn className="mt-2" onClick={() => onChange([...value, ""])}><Plus className="h-4 w-4" />{addLabel}</Btn>
    </div>
  );
}

/** Reorderable / duplicable / deletable list of objects, each in a collapsible card. */
export function ItemList<T>({ items, onChange, render, summary, blank, addLabel = "Add item", empty = "Nothing here yet." }: {
  items: T[];
  onChange: (v: T[]) => void;
  render: (item: T, update: (p: Partial<T>) => void, index: number) => ReactNode;
  summary: (item: T, index: number) => ReactNode;
  blank: () => T;
  addLabel?: string;
  empty?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const upd = (i: number, p: Partial<T>) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">{empty}</p>}
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1 px-3 py-2">
            <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex flex-1 items-center gap-2 text-left">
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open === i && "rotate-180")} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{summary(it, i)}</span>
            </button>
            <IconBtn onClick={() => onChange(move(items, i, -1))} disabled={i === 0} aria-label="Move up"><ArrowUp className="h-4 w-4" /></IconBtn>
            <IconBtn onClick={() => onChange(move(items, i, 1))} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown className="h-4 w-4" /></IconBtn>
            <IconBtn onClick={() => { const c = [...items]; c.splice(i + 1, 0, structuredClone(it)); onChange(c); }} aria-label="Duplicate"><Copy className="h-4 w-4" /></IconBtn>
            <IconBtn onClick={() => confirm("Delete this item?") && onChange(items.filter((_, j) => j !== i))} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></IconBtn>
          </div>
          {open === i && <div className="space-y-4 border-t border-zinc-200 p-4 dark:border-zinc-800">{render(it, (p) => upd(i, p), i)}</div>}
        </div>
      ))}
      <Btn onClick={() => { onChange([...items, blank()]); setOpen(items.length); }}><Plus className="h-4 w-4" />{addLabel}</Btn>
    </div>
  );
}

export function SaveBar({ dirty, saving, onSave, onDiscard, onReset, dbConnected }: {
  dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void; onReset?: () => void; dbConnected: boolean;
}) {
  return (
    <>
      {!dbConnected && (
        <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          MongoDB is not connected (<code>MONGODB_URI</code> missing), so changes cannot be saved yet. You are seeing the default content.
        </div>
      )}
      <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:-mx-8 sm:px-8">
        <span className="text-xs text-zinc-500">{dirty ? "● Unsaved changes" : "All changes saved"}</span>
        <div className="flex gap-2">
          {onReset && <Btn onClick={onReset} className="hidden sm:inline-flex">Reset to defaults</Btn>}
          <Btn onClick={onDiscard} disabled={!dirty || saving}>Discard</Btn>
          <Btn variant="primary" onClick={onSave} disabled={!dirty || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Btn>
        </div>
      </div>
    </>
  );
}

export const Loading = () => (
  <div className="flex items-center gap-2 py-20 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
);

export function Toaster() {
  const [t, setT] = useState<{ message: string; type: "ok" | "err"; id: number } | null>(null);
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      const id = Date.now();
      setT({ ...d, id });
      setTimeout(() => setT((c) => (c?.id === id ? null : c)), 3500);
    };
    window.addEventListener("admin-toast", h);
    return () => window.removeEventListener("admin-toast", h);
  }, []);
  if (!t) return null;
  return (
    <div className={cn("fixed bottom-20 right-5 z-[60] max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg", t.type === "ok" ? "bg-emerald-600" : "bg-red-600")}>
      {t.message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Media: picker modal + image field
// ---------------------------------------------------------------------------
export type MediaItem = { id: string; name: string; mime: string; size: number; url: string; createdAt: string };

export async function uploadFile(file: File): Promise<MediaItem> {
  const fd = new FormData();
  fd.append("file", file);
  return api<MediaItem>("/api/admin/media", { method: "POST", body: fd });
}

export function MediaPicker({ onPick, onClose, accept = "image" }: { onPick: (url: string) => void; onClose: () => void; accept?: "image" | "pdf" | "any" }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const load = () => api<{ items: MediaItem[] }>("/api/admin/media").then((r) => setItems(r.items)).catch((e) => toast(e.message, "err"));
  useEffect(() => { load(); }, []);
  const shown = (items ?? []).filter((m) => accept === "any" || (accept === "pdf" ? m.mime === "application/pdf" : m.mime.startsWith("image/")));

  const upload = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try { const m = await uploadFile(f); onPick(m.url); onClose(); } catch (e) { toast((e as Error).message, "err"); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-5 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Media library</h3>
          <div className="flex gap-2">
            <input ref={input} type="file" hidden accept={accept === "pdf" ? "application/pdf" : accept === "image" ? "image/*" : undefined} onChange={(e) => upload(e.target.files?.[0])} />
            <Btn variant="primary" onClick={() => input.current?.click()} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload new</Btn>
            <IconBtn onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></IconBtn>
          </div>
        </div>
        {!items ? <Loading /> : shown.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">No files yet. Upload one (max 4 MB).</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {shown.map((m) => (
              <button key={m.id} type="button" onClick={() => { onPick(m.url); onClose(); }} className="group overflow-hidden rounded-lg border border-zinc-200 text-left hover:border-orange-500 dark:border-zinc-800">
                <div className="flex aspect-video items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  {m.mime.startsWith("image/") ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.url} alt={m.name} className="h-full w-full object-cover" /> : <span className="text-xs font-semibold">PDF</span>}
                </div>
                <p className="truncate px-2 py-1.5 text-xs">{m.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** URL text box + preview + "Choose / upload" button. Works for images and for the resume PDF. */
export function ImageField({ label, value, onChange, accept = "image", hint }: {
  label: string; value: string; onChange: (v: string) => void; accept?: "image" | "pdf" | "any"; hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const isImg = accept === "image" && !!value;
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-3">
        {accept === "image" && (
          <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
            {isImg ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-zinc-400" />}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input className={inputCls} value={value} placeholder="/images/… or https://…" onChange={(e) => onChange(e.target.value)} />
          <div className="flex gap-2">
            <Btn type="button" onClick={() => setOpen(true)}><Upload className="h-4 w-4" /> Choose / upload</Btn>
            {value && <Btn type="button" onClick={() => onChange("")}>Clear</Btn>}
          </div>
        </div>
      </div>
      {open && <MediaPicker accept={accept} onPick={onChange} onClose={() => setOpen(false)} />}
    </Field>
  );
}
