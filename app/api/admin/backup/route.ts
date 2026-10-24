import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { Message, SiteDoc } from "@/lib/models";
import { CONTENT_KEYS, getContentFresh } from "@/lib/content";

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const withMessages = new URL(req.url).searchParams.get("messages") === "1";
  const out: Record<string, unknown> = { version: 1, exportedAt: new Date().toISOString(), content: await getContentFresh() };
  if (withMessages && hasDb()) {
    await connectDb();
    out.messages = await Message.find().sort({ createdAt: 1 }).lean();
  }
  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="portfolio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

/** Restore: body is a backup file ({ content: {...} }). Only known sections are imported. */
export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return NextResponse.json({ error: "MONGODB_URI is not set" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const content = body?.content;
  if (!content || typeof content !== "object") return NextResponse.json({ error: "Not a valid backup file" }, { status: 400 });
  const data: Record<string, unknown> = {};
  for (const k of CONTENT_KEYS) if (k in content) data[k] = content[k];
  if (!Object.keys(data).length) return NextResponse.json({ error: "Backup has no known sections" }, { status: 400 });
  await connectDb();
  await SiteDoc.updateOne({ key: "main" }, { $set: { data } }, { upsert: true });
  revalidateTag("content");
  revalidatePath("/");
  return NextResponse.json({ ok: true, sections: Object.keys(data).length });
}
