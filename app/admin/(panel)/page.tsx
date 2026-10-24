"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/components/admin/api";
import { Card, Loading, PageHeader } from "@/components/admin/ui";

type Stats = { dbConnected: boolean; series?: { day: string; views: number }[]; unread?: number; total?: number; media?: number; totalViews?: number };

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { api<Stats>("/api/admin/stats").then(setS).catch(() => setS({ dbConnected: false })); }, []);
  if (!s) return <Loading />;

  const series = s.series ?? [];
  const max = Math.max(1, ...series.map((d) => d.views));
  const last7 = series.slice(-7).reduce((a, d) => a + d.views, 0);
  const last30 = series.reduce((a, d) => a + d.views, 0);
  const tiles = [
    { label: "Views (7 days)", value: last7 },
    { label: "Views (30 days)", value: last30 },
    { label: "All-time views", value: s.totalViews ?? 0 },
    { label: "Unread messages", value: s.unread ?? 0, href: "/admin/messages" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" desc="A quick look at your portfolio." />
      {!s.dbConnected && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          MongoDB is not connected. Add <code>MONGODB_URI</code> to <code>.env.local</code> to save content, receive messages, upload media and see stats.
        </div>
      )}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => {
          const body = (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs text-zinc-500">{t.label}</p>
              <p className="mt-1 text-2xl font-semibold">{t.value}</p>
            </div>
          );
          return t.href ? <Link key={t.label} href={t.href}>{body}</Link> : <div key={t.label}>{body}</div>;
        })}
      </div>
      <Card title="Visits, last 30 days" desc="One count per browser session. Your own visits while logged in are ignored.">
        <div className="flex h-40 items-end gap-1">
          {series.map((d) => (
            <div key={d.day} title={`${d.day}: ${d.views}`} className="flex-1 rounded-t bg-orange-500/70 hover:bg-orange-500" style={{ height: `${Math.max(2, (d.views / max) * 100)}%` }} />
          ))}
        </div>
      </Card>
      <Card title="Quick links">
        <div className="flex flex-wrap gap-2 text-sm">
          {[["/admin/projects", "Add a project"], ["/admin/messages", "Read messages"], ["/admin/media", "Upload media"], ["/admin/settings", "Maintenance mode"], ["/admin/account", "Backup"]].map(([h, l]) => (
            <Link key={h} href={h} className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">{l}</Link>
          ))}
        </div>
      </Card>
    </>
  );
}
