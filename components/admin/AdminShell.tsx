"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase, Eye, FolderKanban, Globe, Image as ImageIcon, LayoutDashboard, LayoutList, LogOut, Mail, Menu, Moon,
  Search, Send, Settings, Shield, Sparkles, Sun, Tags, User, UserCircle, Wrench, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "./api";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/job-assistant", label: "Job Assistant", icon: Send },
  { href: "/admin/profile", label: "Profile & Hero", icon: User },
  { href: "/admin/sections", label: "Sections & Order", icon: LayoutList },
  { href: "/admin/about", label: "About & Stats", icon: UserCircle },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/marquee", label: "Tech Marquee", icon: Tags },
  { href: "/admin/contact", label: "Contact", icon: Globe },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/account", label: "Account & Backup", icon: Shield },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [dark, setDark] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  useEffect(() => {
    api<{ unread?: number }>("/api/admin/stats").then((s) => setUnread(s.unread ?? 0)).catch(() => {});
  }, [path]);

  const toggleTheme = () => {
    const r = document.documentElement;
    const next = !r.classList.contains("dark");
    r.classList.toggle("dark", next);
    r.classList.toggle("light", !next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    setDark(next);
  };

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="space-y-0.5 p-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
              active ? "bg-orange-500/10 font-medium text-orange-600 dark:text-orange-400" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {label === "Messages" && unread > 0 && <span className="rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-white">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-full lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-y-auto border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        <div className="px-6 pt-6 text-sm font-semibold tracking-tight">Portfolio Admin</div>
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="absolute inset-y-0 left-0 w-64 overflow-y-auto bg-white dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 text-sm font-semibold">Portfolio Admin<button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button></div>
            {nav}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-8">
        <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <span className="hidden lg:block" />
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><Eye className="h-4 w-4" /> View site</a>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="rounded-lg border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><LogOut className="h-4 w-4" /> Logout</button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
