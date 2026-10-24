import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { DayStat, Media, Message } from "@/lib/models";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return NextResponse.json({ dbConnected: false });
  await connectDb();
  const since = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10);
  const [days, unread, total, media, allViews] = await Promise.all([
    DayStat.find({ day: { $gte: since } }).sort({ day: 1 }).lean(),
    Message.countDocuments({ read: false }),
    Message.countDocuments(),
    Media.countDocuments(),
    DayStat.aggregate([{ $group: { _id: null, v: { $sum: "$views" } } }]),
  ]);
  const map = new Map(days.map((d) => [d.day, d.views]));
  const series = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10);
    return { day, views: map.get(day) ?? 0 };
  });
  return NextResponse.json({
    dbConnected: true,
    series,
    unread,
    total,
    media,
    totalViews: allViews[0]?.v ?? 0,
  });
}
