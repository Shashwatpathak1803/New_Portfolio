import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantResume } from "@/lib/models/jobAssistant";
import { getActiveSender } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`public-resumes:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const resumes: Array<{
    _id: string;
    name: string;
    category: string;
    fileName: string;
    fileSize: number;
  }> = [];

  // 1. Fetch resumes from MongoDB if available
  if (hasDb()) {
    try {
      await connectDb();
      const docs = await JobAssistantResume.find()
        .select("_id name category fileName fileSize createdAt")
        .sort({ createdAt: -1 })
        .lean();

      for (const d of docs) {
        resumes.push({
          _id: String(d._id),
          name: d.name,
          category: d.category || "General",
          fileName: d.fileName,
          fileSize: d.fileSize,
        });
      }
    } catch (err) {
      console.error("[api/email-composer/resumes] DB query error:", err);
    }
  }

  // 2. Include default public resume if present on disk
  try {
    const defaultPdfPath = path.join(process.cwd(), "public", "resume", "Shashwat_Pathak_Resume.pdf");
    if (fs.existsSync(defaultPdfPath)) {
      const stats = fs.statSync(defaultPdfPath);
      resumes.push({
        _id: "default",
        name: "Shashwat Pathak - Primary Resume",
        category: "Full Stack / MERN",
        fileName: "Shashwat_Pathak_Resume.pdf",
        fileSize: stats.size,
      });
    }
  } catch (err) {
    console.warn("[api/email-composer/resumes] Default PDF check error:", err);
  }

  const activeSender = await getActiveSender();

  return NextResponse.json({
    success: true,
    resumes,
    senderEmail: activeSender.email,
  });
}
