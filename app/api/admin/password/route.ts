import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { AdminUser } from "@/lib/models";

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return NextResponse.json({ error: "Needs MongoDB. Change ADMIN_PASSWORD in your env instead." }, { status: 400 });

  const { current = "", next = "" } = await req.json().catch(() => ({}));
  if (String(next).length < 10) return NextResponse.json({ error: "New password must be at least 10 characters" }, { status: 400 });

  const email = process.env.ADMIN_EMAIL!.trim().toLowerCase();
  await connectDb();
  const user = await AdminUser.findOne({ email });
  const valid = user
    ? await bcrypt.compare(String(current), user.passwordHash as string)
    : String(current) === process.env.ADMIN_PASSWORD;
  if (!valid) return NextResponse.json({ error: "Current password is wrong" }, { status: 401 });

  await AdminUser.updateOne({ email }, { passwordHash: await bcrypt.hash(String(next), 12) }, { upsert: true });
  return NextResponse.json({ ok: true });
}
