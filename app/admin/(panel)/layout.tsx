import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!(await getSession())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
