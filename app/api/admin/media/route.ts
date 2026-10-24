import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { Media } from "@/lib/models";

const MAX = 4 * 1024 * 1024; // keeps us under Vercel's 4.5 MB request limit
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "image/x-icon", "application/pdf"];

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return NextResponse.json({ items: [], dbConnected: false });
  await connectDb();
  const docs = await Media.find().select("-data").sort({ createdAt: -1 }).lean();
  const items = docs.map((m) => ({
    id: String(m._id),
    name: m.name,
    mime: m.mime,
    size: m.size,
    url: `/api/media/${m._id}`,
    createdAt: (m as unknown as { createdAt: string }).createdAt,
  }));
  return NextResponse.json({ items, dbConnected: true });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!hasDb()) return NextResponse.json({ error: "MONGODB_URI is not set — uploads are stored in MongoDB." }, { status: 400 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only images and PDF are allowed" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "File is larger than 4 MB" }, { status: 400 });
  await connectDb();
  const doc = await Media.create({
    name: file.name.slice(0, 120),
    mime: file.type,
    size: file.size,
    data: Buffer.from(await file.arrayBuffer()),
  });
  return NextResponse.json({ id: String(doc._id), name: doc.name, mime: doc.mime, size: doc.size, url: `/api/media/${doc._id}` });
}
