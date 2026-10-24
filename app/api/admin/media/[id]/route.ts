import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Media } from "@/lib/models";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  await connectDb();
  await Media.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
