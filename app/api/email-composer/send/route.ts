import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantResume, JobApplication } from "@/lib/models/jobAssistant";
import { sendApplicationEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = clientIp(req);
  // Rate limit: 10 emails per 10 minutes per IP to prevent spamming
  if (!rateLimit(`public-send-email:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many emails sent from this address. Please wait a few minutes." },
      { status: 429 }
    );
  }

  try {
    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const recipientEmail = String(payload.recipientEmail || "").trim();
    const subject = String(payload.subject || "").trim();
    const body = String(payload.body || "").trim();
    const resumeId = String(payload.resumeId || "").trim();
    const role = String(payload.role || "").trim();

    // 1. Validation
    if (!recipientEmail || !EMAIL_REGEX.test(recipientEmail)) {
      return NextResponse.json(
        { error: "A valid recipient email address is required before sending." },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: "Email subject cannot be empty." },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        { error: "Email body cannot be empty." },
        { status: 400 }
      );
    }

    if (!resumeId) {
      return NextResponse.json(
        { error: "Please select a resume PDF to attach." },
        { status: 400 }
      );
    }

    // 2. Retrieve PDF buffer
    let pdfBuffer: Buffer | null = null;
    let pdfFileName = "Resume.pdf";
    let resumeDocName = "";

    if (resumeId === "default") {
      const defaultPdfPath = path.join(process.cwd(), "public", "resume", "Shashwat_Pathak_Resume.pdf");
      if (!fs.existsSync(defaultPdfPath)) {
        return NextResponse.json(
          { error: "The default resume PDF could not be found on the server." },
          { status: 404 }
        );
      }
      pdfBuffer = fs.readFileSync(defaultPdfPath);
      pdfFileName = "Shashwat_Pathak_Resume.pdf";
      resumeDocName = "Default Resume";
    } else if (/^[a-f0-9]{24}$/i.test(resumeId) && hasDb()) {
      await connectDb();
      const resumeDoc = await JobAssistantResume.findById(resumeId);
      if (!resumeDoc || !resumeDoc.data) {
        return NextResponse.json(
          { error: "The selected resume document could not be retrieved from secure storage." },
          { status: 404 }
        );
      }
      pdfBuffer = Buffer.from(resumeDoc.data);
      pdfFileName = resumeDoc.fileName || `${resumeDoc.name}.pdf`;
      resumeDocName = resumeDoc.name;
    } else {
      return NextResponse.json(
        { error: "Invalid resume selection or resume storage is inaccessible." },
        { status: 400 }
      );
    }

    // 3. Dispatch email with PDF attachment
    const sendResult = await sendApplicationEmail({
      to: recipientEmail,
      subject,
      body,
      pdfBuffer,
      pdfFileName,
    });

    // 4. Optionally record in application history if DB is active
    if (hasDb()) {
      try {
        await connectDb();
        await JobApplication.create({
          recipientEmail,
          companyName: recipientEmail.split("@")[1]?.split(".")[0] || "Target Company",
          jobTitle: role || subject.replace(/^Application for\s+/i, ""),
          applicationType: "Job Application",
          roleCategory: role || "Full Stack Developer",
          resumeId: resumeId === "default" ? null : resumeId,
          resumeName: resumeDocName || pdfFileName,
          emailStyle: "Professional",
          subject,
          body,
          status: "Applied",
          notes: `Sent automatically via Email Composer to ${recipientEmail} with attachment ${pdfFileName}. MessageId: ${sendResult.messageId || "N/A"}`,
        });
      } catch (err) {
        console.warn("[api/email-composer/send] Could not save history record:", err);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: sendResult.messageId,
      sender: sendResult.sender,
      fileName: pdfFileName,
    });
  } catch (err) {
    console.error("[api/email-composer/send] Error sending email:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to send email. Please check server configuration." },
      { status: 500 }
    );
  }
}
