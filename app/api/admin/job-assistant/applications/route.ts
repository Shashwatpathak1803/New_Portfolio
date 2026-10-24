import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { JobApplication, type ApplicationStatus } from "@/lib/models/jobAssistant";

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  if (!hasDb()) {
    return NextResponse.json({ applications: [], dbConnected: false });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const status = (searchParams.get("status") || "").trim();
    const type = (searchParams.get("type") || "").trim();

    await connectDb();

    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (type && type !== "all") {
      query.applicationType = type;
    }

    let docs = await JobApplication.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (q) {
      docs = docs.filter((item) => {
        const text = [
          item.companyName,
          item.jobTitle,
          item.recipientEmail,
          item.recipientName,
          item.roleCategory,
          item.customRole,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      });
    }

    return NextResponse.json({ applications: docs, dbConnected: true });
  } catch (err) {
    console.error("[job-assistant/applications GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  if (!hasDb()) {
    return NextResponse.json(
      { error: "MONGODB_URI is not set — cannot save application." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid application payload" }, { status: 400 });
    }

    if (!body.recipientEmail?.trim() || !body.companyName?.trim() || !body.jobTitle?.trim()) {
      return NextResponse.json(
        { error: "Recipient Email, Company Name, and Job Title are required." },
        { status: 400 }
      );
    }

    await connectDb();

    const doc = await JobApplication.create({
      recipientEmail: body.recipientEmail.trim(),
      recipientName: body.recipientName?.trim() || "",
      companyName: body.companyName.trim(),
      jobTitle: body.jobTitle.trim(),
      applicationType: body.applicationType || "Job Application",
      roleCategory: body.roleCategory || "Full Stack Developer",
      customRole: body.customRole?.trim() || "",
      resumeId: body.resumeId && /^[a-f0-9]{24}$/i.test(body.resumeId) ? body.resumeId : null,
      resumeName: body.resumeName?.trim() || "",
      jobDescription: body.jobDescription || "",
      emailStyle: body.emailStyle || "Professional",
      subject: body.subject || "",
      body: body.body || "",
      aiRelevanceNotes: body.aiRelevanceNotes || "",
      status: (body.status || "Draft") as ApplicationStatus,
      notes: body.notes?.trim() || "",
    });

    return NextResponse.json({ success: true, application: doc });
  } catch (err) {
    console.error("[job-assistant/applications POST] Error:", err);
    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}
