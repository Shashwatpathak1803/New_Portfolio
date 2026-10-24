import { NextResponse } from "next/server";
import { guard, rateLimit, clientIp } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantResume } from "@/lib/models/jobAssistant";
import { isPdfBuffer, extractPdfText } from "@/lib/jobAssistant/pdf";

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  if (!hasDb()) {
    return NextResponse.json({ resumes: [], dbConnected: false });
  }

  try {
    await connectDb();
    const docs = await JobAssistantResume.find()
      .select("-data")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ resumes: docs, dbConnected: true });
  } catch (err) {
    console.error("[job-assistant/resumes GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const ip = clientIp(req);
  if (!rateLimit(`resume-upload:${ip}`, 15, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many upload requests. Please wait a minute." },
      { status: 429 }
    );
  }

  if (!hasDb()) {
    return NextResponse.json(
      { error: "MONGODB_URI is not set — resumes cannot be saved." },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    const name = String(formData.get("name") || "").trim();
    const category = String(formData.get("category") || "General").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please select a resume file" }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json(
        { error: "Please provide a descriptive name for this resume" },
        { status: 400 }
      );
    }

    if (file.size > MAX_RESUME_SIZE) {
      return NextResponse.json(
        { error: "Resume file size exceeds the 5 MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!isPdfBuffer(buffer)) {
      return NextResponse.json(
        { error: "Invalid file: Must be a valid PDF document (%PDF- signature missing)." },
        { status: 400 }
      );
    }

    // Extract text and check for scanned PDF
    const { text, isScannedOrEmpty } = await extractPdfText(buffer);

    await connectDb();

    const doc = await JobAssistantResume.create({
      name: name.slice(0, 120),
      category: category.slice(0, 80),
      notes: notes.slice(0, 1000),
      fileName: file.name.slice(0, 200),
      fileSize: file.size,
      mimeType: "application/pdf",
      data: buffer,
      extractedText: text,
      isScannedOrEmpty,
    });

    return NextResponse.json({
      success: true,
      resume: {
        _id: doc._id,
        name: doc.name,
        category: doc.category,
        notes: doc.notes,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        isScannedOrEmpty: doc.isScannedOrEmpty,
        extractedTextPreview: doc.extractedText.slice(0, 300),
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    console.error("[job-assistant/resumes POST] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to upload and process resume" },
      { status: 500 }
    );
  }
}
