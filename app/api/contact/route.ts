import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { Message } from "@/lib/models";

const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000))
    return NextResponse.json({ error: "Too many messages, try later" }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: bots fill this hidden field

  const msg = { name: clip(b.name, 100), email: clip(b.email, 200), subject: clip(b.subject, 200), message: clip(b.message, 5000) };
  if (!msg.name || !/^\S+@\S+\.\S+$/.test(msg.email) || !msg.subject || !msg.message)
    return NextResponse.json({ error: "Please fill all fields correctly" }, { status: 400 });
  if (!hasDb()) return NextResponse.json({ error: "Not stored" }, { status: 503 });
  try {
    await connectDb();
    await Message.create(msg);
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
