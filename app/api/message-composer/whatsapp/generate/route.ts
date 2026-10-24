import { NextResponse } from "next/server";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantProfile } from "@/lib/models/jobAssistant";
import { generateWhatsAppMessage, type WhatsAppContactType } from "@/lib/jobAssistant/ai";
import { getContentFresh } from "@/lib/content";
import { rateLimit, clientIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_CONTACT_TYPES: WhatsAppContactType[] = [
  "HR / Recruiter",
  "Employee Referral",
  "Hiring Manager",
];

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`public-whatsapp-gen:${ip}`, 30, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many message generation requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const jobRole = String(payload.jobRole || "").trim();
    const contactType = String(payload.contactType || "HR / Recruiter").trim() as WhatsAppContactType;
    const portfolioUrl = String(payload.portfolioUrl || "").trim();

    // 1. Validation
    if (!jobRole) {
      return NextResponse.json({ error: "Job role is required." }, { status: 400 });
    }

    if (!VALID_CONTACT_TYPES.includes(contactType)) {
      return NextResponse.json(
        { error: "Please select a valid contact type (HR / Recruiter, Employee Referral, or Hiring Manager)." },
        { status: 400 }
      );
    }

    // 2. Retrieve verified candidate profile
    let profileData: any = null;
    if (hasDb()) {
      try {
        await connectDb();
        profileData = await JobAssistantProfile.findOne().lean();
      } catch (err) {
        console.error("[api/message-composer/whatsapp/generate] DB profile fetch error:", err);
      }
    }

    if (!profileData) {
      const siteContent = await getContentFresh();
      profileData = {
        fullName: siteContent.profile.name || "Shashwat Pathak",
        email: siteContent.profile.email || "shashwatpathak901@gmail.com",
        location: siteContent.profile.location || "India",
        summary: siteContent.about.paragraphs.join(" "),
        skills: {
          frameworks: siteContent.skillGroups.flatMap((g) => g.skills.map((s) => s.name)),
        },
        projects: siteContent.projects.map((p) => ({
          title: p.title,
          description: p.description,
          stack: p.stack,
        })),
      };
    }

    // 3. Generate WhatsApp message
    const result = await generateWhatsAppMessage({
      jobRole,
      contactType,
      portfolioUrl: portfolioUrl || undefined,
      profile: profileData,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      provider: result.provider,
    });
  } catch (err) {
    console.error("[api/message-composer/whatsapp/generate] Error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to generate WhatsApp message. Please retry." },
      { status: 500 }
    );
  }
}
