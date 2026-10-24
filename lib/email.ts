import nodemailer from "nodemailer";
import { getContentFresh } from "@/lib/content";

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  pdfBuffer: Buffer;
  pdfFileName: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  sender: string;
  accepted?: string[];
}

/**
 * Returns the currently active sender address and display name
 * based on admin settings, falling back to profile or env.
 */
export async function getActiveSender(): Promise<{ email: string; name: string }> {
  try {
    const content = await getContentFresh();
    const email =
      content.settings?.senderEmail?.trim() ||
      content.profile?.email?.trim() ||
      process.env.ADMIN_EMAIL?.trim() ||
      "shashwatpathak901@gmail.com";
    const name =
      content.settings?.senderName?.trim() ||
      content.profile?.name?.trim() ||
      "Shashwat Pathak";
    return { email, name };
  } catch {
    return {
      email: process.env.ADMIN_EMAIL?.trim() || "shashwatpathak901@gmail.com",
      name: "Shashwat Pathak",
    };
  }
}

/**
 * Check whether server SMTP credentials are fully provided in environment.
 */
export function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;
  return Boolean(user && pass);
}

/**
 * Send an outreach email with the candidate's PDF resume attached directly via SMTP.
 */
export async function sendApplicationEmail(
  payload: SendEmailPayload
): Promise<SendEmailResult> {
  const { to, subject, body, pdfBuffer, pdfFileName } = payload;

  // 1. Validate destination email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!to || !emailRegex.test(to.trim())) {
    throw new Error("Invalid recipient email address.");
  }

  // 2. Validate email subject and body
  if (!subject.trim()) {
    throw new Error("Email subject cannot be empty.");
  }
  if (!body.trim()) {
    throw new Error("Email body cannot be empty.");
  }

  // 3. Validate PDF buffer
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("Selected resume PDF is missing or empty.");
  }
  // Validate magic bytes: %PDF-
  const isPdf =
    pdfBuffer.length >= 4 &&
    pdfBuffer[0] === 0x25 &&
    pdfBuffer[1] === 0x50 &&
    pdfBuffer[2] === 0x44 &&
    pdfBuffer[3] === 0x46;
  if (!isPdf) {
    throw new Error("Selected resume file is not a valid PDF document.");
  }

  // 4. Retrieve active sender from admin settings
  const { email: senderEmail, name: senderName } = await getActiveSender();

  // 5. Check server SMTP credentials
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      `SMTP sending is not configured on the server. Please set SMTP_USER and SMTP_PASS (or App Password) in .env.local to send outgoing emails with attachments from ${senderEmail}.`
    );
  }

  // Optional: check host and port
  const isGmail = senderEmail.toLowerCase().includes("gmail.com") || smtpUser.toLowerCase().includes("gmail.com");
  const host =
    process.env.SMTP_HOST || (isGmail ? "smtp.gmail.com" : "smtp.mailtrap.io");
  const port = parseInt(
    process.env.SMTP_PORT || (isGmail ? "465" : "587"),
    10
  );
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  // 6. Build nodemailer transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

  const fromHeader = `"${senderName.replace(/"/g, "")}" <${smtpUser}>`;
  const replyTo = senderEmail;

  // Convert plain text newlines into clean HTML formatting for email clients
  const htmlBody = body
    .split("\n\n")
    .map((paragraph) => `<p style="margin-bottom: 14px; line-height: 1.6; color: #222;">${paragraph.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const cleanAttachmentName = pdfFileName.toLowerCase().endsWith(".pdf")
    ? pdfFileName
    : `${pdfFileName}.pdf`;

  // 7. Dispatch email
  const info = await transporter.sendMail({
    from: fromHeader,
    to: to.trim(),
    replyTo,
    subject: subject.trim(),
    text: body.trim(),
    html: htmlBody,
    attachments: [
      {
        filename: cleanAttachmentName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  if (!info.messageId && (!info.accepted || info.accepted.length === 0)) {
    throw new Error("Email provider did not confirm acceptance of the message.");
  }

  return {
    success: true,
    messageId: info.messageId,
    sender: senderEmail,
    accepted: Array.isArray(info.accepted) ? (info.accepted as string[]) : [to],
  };
}
