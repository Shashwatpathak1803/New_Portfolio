import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantProfile, JobAssistantResume } from "@/lib/models/jobAssistant";
import { generateJobEmail } from "@/lib/jobAssistant/ai";
import { extractPdfText } from "@/lib/jobAssistant/pdf";
import { getContentFresh } from "@/lib/content";
import { rateLimit, clientIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inferCompanyFromEmail(email: string): string {
  try {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const name = domain.split(".")[0];
    const genericDomains = ["gmail", "yahoo", "outlook", "hotmail", "icloud", "proton", "aol", "zoho"];
    if (!genericDomains.includes(name) && name.length >= 2) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  } catch {}
  return "your organization";
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`public-ai-gen:${ip}`, 20, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many email generation requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const role = String(payload.role || "").trim();
    const customRole = String(payload.customRole || "").trim();
    const recipientEmail = String(payload.recipientEmail || "").trim();
    const resumeId = String(payload.resumeId || "").trim();

    // 1. Validate role
    if (!role) {
      return NextResponse.json({ error: "Job role is required." }, { status: 400 });
    }
    const finalRole = role === "Other" ? customRole : role;
    if (!finalRole) {
      return NextResponse.json({ error: "Please enter the custom job role." }, { status: 400 });
    }

    // 2. Validate recipient email
    if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid recipient email address." },
        { status: 400 }
      );
    }

    // 3. Validate resumeId
    if (!resumeId) {
      return NextResponse.json({ error: "Please select a resume." }, { status: 400 });
    }

    // 4. Retrieve candidate profile & selected resume text
    let resumeText = "";
    let profileData: any = null;

    if (resumeId === "default") {
      const defaultPdfPath = path.join(process.cwd(), "public", "resume", "Shashwat_Pathak_Resume.pdf");
      if (fs.existsSync(defaultPdfPath)) {
        try {
          const buffer = fs.readFileSync(defaultPdfPath);
          const extracted = await extractPdfText(buffer);
          resumeText = extracted.text || "";
        } catch (e) {
          console.warn("[api/email-composer/generate] PDF text extract failed:", e);
        }
      }
    } else if (/^[a-f0-9]{24}$/i.test(resumeId) && hasDb()) {
      await connectDb();
      const resumeDoc = await JobAssistantResume.findById(resumeId).lean();
      if (resumeDoc) {
        resumeText = resumeDoc.extractedText || "";
      } else {
        return NextResponse.json({ error: "Selected resume could not be found." }, { status: 404 });
      }
    }

    // Load verified profile data
    if (hasDb()) {
      try {
        await connectDb();
        profileData = await JobAssistantProfile.findOne().lean();
      } catch (err) {
        console.error("[api/email-composer/generate] Error loading DB profile:", err);
      }
    }

    // Supplement with site content profile if needed
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
        experience: siteContent.experience.map((e) => ({
          company: e.company,
          role: e.role,
          period: e.period,
          points: e.points,
        })),
      };
    }

    const inferredCompany = inferCompanyFromEmail(recipientEmail);

    // 5. Generate email draft using existing AI service
    const result = await generateJobEmail({
      recipientEmail,
      companyName: inferredCompany,
      jobTitle: finalRole,
      applicationType: "Job Application",
      roleCategory: finalRole,
      customRole: role === "Other" ? customRole : undefined,
      resumeText,
      profile: profileData,
      emailStyle: "Professional",
    });

    return NextResponse.json({
      success: true,
      subject: result.subject,
      body: result.body,
      relevanceNotes: result.relevanceNotes,
      provider: result.provider,
    });
  } catch (err) {
    console.error("[api/email-composer/generate] Generation error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to generate email draft. Please retry." },
      { status: 500 }
    );
  }
}
