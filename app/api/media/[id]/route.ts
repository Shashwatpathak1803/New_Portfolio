import { NextResponse } from "next/server";
import { connectDb, hasDb } from "@/lib/db";
import { Media } from "@/lib/models";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!hasDb() || !/^[a-f0-9]{24}$/i.test(id)) return new NextResponse("Not found", { status: 404 });
  await connectDb();
  const doc = await Media.findById(id);
  if (!doc) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(doc.data as Buffer), {
    headers: {
      "Content-Type": doc.mime as string,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // uploaded SVGs can never run scripts
      "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.name as string)}"`,
    },
  });
}
