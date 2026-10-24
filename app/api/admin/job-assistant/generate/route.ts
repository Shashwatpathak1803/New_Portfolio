import { NextResponse } from "next/server";
import { guard, rateLimit, clientIp } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantProfile, JobAssistantResume } from "@/lib/models/jobAssistant";
import { generateJobEmail } from "@/lib/jobAssistant/ai";
import { APPLICATION_TYPES, EMAIL_STYLES, type ApplicationType, type EmailStyle } from "@/lib/jobAssistant/roles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const ip = clientIp(req);
  if (!rateLimit(`ai-gen:${ip}`, 20, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many email generation requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const recipientEmail = String(body.recipientEmail || "").trim();
    const recipientName = String(body.recipientName || "").trim();
    const companyName = String(body.companyName || "").trim();
    const jobTitle = String(body.jobTitle || "").trim();
    const applicationType = (body.applicationType || "Job Application") as ApplicationType;
    const roleCategory = String(body.roleCategory || "Full Stack Developer").trim();
    const customRole = String(body.customRole || "").trim();
    const resumeId = String(body.resumeId || "").trim();
    const jobDescription = String(body.jobDescription || "").trim();
    const emailStyle = (body.emailStyle || "Professional") as EmailStyle;

    // Field validations
    if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail)) {
      return NextResponse.json(
        { error: "A valid recipient email address is required." },
        { status: 400 }
      );
    }
    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }
    if (!jobTitle) {
      return NextResponse.json(
        { error: "Job title is required." },
        { status: 400 }
      );
    }

    // Retrieve saved profile & resume if DB is connected
    let profileData = null;
    let resumeText = "";

    if (hasDb()) {
      await connectDb();
      profileData = await JobAssistantProfile.findOne().lean();

      if (resumeId && /^[a-f0-9]{24}$/i.test(resumeId)) {
        const resumeDoc = await JobAssistantResume.findById(resumeId).lean();
        if (resumeDoc) {
          resumeText = resumeDoc.extractedText || "";
        }
      }
    }

    const result = await generateJobEmail({
      recipientEmail,
      recipientName,
      companyName,
      jobTitle,
      applicationType,
      roleCategory,
      customRole,
      resumeText,
      profile: profileData,
      jobDescription,
      emailStyle,
    });

    return NextResponse.json({
      success: true,
      subject: result.subject,
      body: result.body,
      relevanceNotes: result.relevanceNotes,
      provider: result.provider,
    });
  } catch (err) {
    console.error("[job-assistant/generate POST] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate email draft. Please check your inputs or try again." },
      { status: 500 }
    );
  }
}
