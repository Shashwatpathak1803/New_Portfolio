import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantResume } from "@/lib/models/jobAssistant";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  if (!hasDb() || !/^[a-f0-9]{24}$/i.test(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    await connectDb();
    const doc = await JobAssistantResume.findById(id);
    if (!doc || !doc.data) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(doc.data as Buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.fileName || "resume.pdf")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[job-assistant/resumes/[id]/download GET] Error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
