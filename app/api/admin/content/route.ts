import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { SiteDoc } from "@/lib/models";
import { CONTENT_KEYS, getContentFresh } from "@/lib/content";

const noDb = () => NextResponse.json({ error: "MONGODB_URI is not set — add it to .env.local to save changes." }, { status: 400 });
const bust = () => {
  revalidateTag("content");
  revalidatePath("/");
};

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({ content: await getContentFresh(), dbConnected: hasDb() });
}

/** Save one section: { key, data } */
export async function PUT(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return noDb();
  const { key, data } = await req.json().catch(() => ({}));
  if (!CONTENT_KEYS.includes(key) || data === undefined)
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  await connectDb();
  await SiteDoc.updateOne({ key: "main" }, { $set: { [`data.${key}`]: data } }, { upsert: true });
  bust();
  return NextResponse.json({ ok: true });
}

/** Reset everything (or one section with ?key=) back to the built-in defaults. */
export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return noDb();
  const key = new URL(req.url).searchParams.get("key");
  await connectDb();
  if (key) {
    if (!CONTENT_KEYS.includes(key as never)) return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    await SiteDoc.updateOne({ key: "main" }, { $unset: { [`data.${key}`]: "" } });
  } else await SiteDoc.deleteOne({ key: "main" });
  bust();
  return NextResponse.json({ ok: true });
}
