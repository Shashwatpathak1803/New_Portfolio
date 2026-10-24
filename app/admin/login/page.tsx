"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { api } from "@/components/admin/api";
import { Btn, Text } from "@/components/admin/ui";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/api/admin/login", { method: "POST", json: { email, password } });
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10 text-orange-500"><Lock className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-semibold">Admin login</h1>
          <p className="text-sm text-zinc-500">Sign in to manage your portfolio.</p>
        </div>
        <Text label="Email" type="email" value={email} onChange={setEmail} />
        <Text label="Password" type="password" value={password} onChange={setPassword} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Btn variant="primary" className="w-full" disabled={busy || !email || !password}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </Btn>
      </form>
    </div>
  );
}
