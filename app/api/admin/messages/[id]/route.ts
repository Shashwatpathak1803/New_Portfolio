import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Message } from "@/lib/models";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const update: Record<string, boolean> = {};
  if (typeof body.read === "boolean") update.read = body.read;
  if (typeof body.starred === "boolean") update.starred = body.starred;
  await connectDb();
  await Message.updateOne({ _id: id }, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  await connectDb();
  await Message.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
