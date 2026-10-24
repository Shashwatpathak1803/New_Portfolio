"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ContentKey, SiteContent } from "@/lib/types";
import { api, toast } from "./api";

type Draft<K extends ContentKey> = Pick<SiteContent, K>;

/** Loads the given content sections, keeps an editable draft, and saves only what changed. */
export function useEditor<K extends ContentKey>(keys: K[]) {
  const [orig, setOrig] = useState<Draft<K> | null>(null);
  const [draft, setDraft] = useState<Draft<K> | null>(null);
  const [saving, setSaving] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const keyId = keys.join(",");

  const load = useCallback(async () => {
    const { content, dbConnected } = await api<{ content: SiteContent; dbConnected: boolean }>("/api/admin/content");
    const pick = Object.fromEntries(keys.map((k) => [k, content[k]])) as Draft<K>;
    setOrig(structuredClone(pick));
    setDraft(structuredClone(pick));
    setDbConnected(dbConnected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyId]);

  useEffect(() => {
    load().catch((e) => toast(e.message, "err"));
  }, [load]);

  const dirtyKeys = useMemo(
    () => (orig && draft ? keys.filter((k) => JSON.stringify(orig[k]) !== JSON.stringify(draft[k])) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orig, draft]
  );
  const dirty = dirtyKeys.length > 0;

  // warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = <Key extends K>(key: Key, value: SiteContent[Key]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  /** Shallow-patch an object section, e.g. patch("hero", { ctaLabel: "Hi" }) */
  const patch = <Key extends K>(key: Key, p: Partial<SiteContent[Key]>) =>
    setDraft((d) => (d ? { ...d, [key]: { ...(d[key] as object), ...p } } : d));

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      for (const k of dirtyKeys) await api("/api/admin/content", { method: "PUT", json: { key: k, data: draft[k] } });
      setOrig(structuredClone(draft));
      toast("Saved — live on the site");
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setSaving(false);
    }
  };

  const discard = () => orig && setDraft(structuredClone(orig));

  const resetToDefaults = async () => {
    if (!confirm("Reset this page's content back to the original defaults?")) return;
    try {
      for (const k of keys) await api(`/api/admin/content?key=${k}`, { method: "DELETE" });
      await load();
      toast("Reset to defaults");
    } catch (e) {
      toast((e as Error).message, "err");
    }
  };

  return { draft, set, patch, save, discard, resetToDefaults, dirty, saving, dbConnected, loading: !draft };
}
