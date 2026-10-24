import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { Message } from "@/lib/models";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return NextResponse.json({ messages: [], dbConnected: false });
  await connectDb();
  const docs = await Message.find().sort({ createdAt: -1 }).limit(500).lean();
  const messages = docs.map((m) => ({ ...m, _id: String(m._id) }));
  return NextResponse.json({ messages, dbConnected: true });
}

/** Bulk action: { action: "read" | "unread" | "delete", ids: string[] } */
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const { action, ids } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || !ids.length) return NextResponse.json({ error: "No ids" }, { status: 400 });
  await connectDb();
  if (action === "delete") await Message.deleteMany({ _id: { $in: ids } });
  else if (action === "read" || action === "unread")
    await Message.updateMany({ _id: { $in: ids } }, { read: action === "read" });
  else return NextResponse.json({ error: "Bad action" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
