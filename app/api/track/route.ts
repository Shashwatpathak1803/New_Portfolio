import { NextResponse } from "next/server";
import { clientIp, getSession, rateLimit } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { DayStat } from "@/lib/models";

export async function POST(req: Request) {
  if (!hasDb() || !rateLimit(`track:${clientIp(req)}`, 30, 60 * 1000)) return NextResponse.json({ ok: false });
  if (await getSession()) return NextResponse.json({ ok: false }); // don't count your own visits
  try {
    await connectDb();
    await DayStat.updateOne({ day: new Date().toISOString().slice(0, 10) }, { $inc: { views: 1 } }, { upsert: true });
  } catch {}
  return NextResponse.json({ ok: true });
}
