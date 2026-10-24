import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantResume } from "@/lib/models/jobAssistant";
import { rateLimit, clientIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Serves a resume PDF to the public WhatsApp composer so the browser can attach the real file
 * (WhatsApp links can't carry attachments). Same set of resumes that /api/email-composer/resumes lists.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(`public-resume-file:${clientIp(req)}`, 40, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const { id } = await params;
  let buffer: Buffer | null = null;
  let fileName = "Resume.pdf";

  if (id === "default") {
    const file = path.join(process.cwd(), "public", "resume", "Shashwat_Pathak_Resume.pdf");
    if (!fs.existsSync(file)) return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    buffer = fs.readFileSync(file);
    fileName = "Shashwat_Pathak_Resume.pdf";
  } else if (/^[a-f0-9]{24}$/i.test(id) && hasDb()) {
    try {
      await connectDb();
      const doc = await JobAssistantResume.findById(id);
      if (!doc || !doc.data) return NextResponse.json({ error: "Resume not found." }, { status: 404 });
      buffer = Buffer.from(doc.data as Buffer);
      fileName = (doc.fileName as string) || `${doc.name}.pdf`;
    } catch (err) {
      console.error("[api/message-composer/resume] error:", err);
      return NextResponse.json({ error: "Could not load the resume." }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  if (!/\.pdf$/i.test(fileName)) fileName += ".pdf";
  const safeName = fileName.replace(/[^\w.\- ]+/g, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-cache",
      "X-Resume-Filename": encodeURIComponent(safeName),
    },
  });
}
