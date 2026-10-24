import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin — Portfolio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-zinc-50 font-body text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {children}
      <Toaster />
    </div>
  );
}
