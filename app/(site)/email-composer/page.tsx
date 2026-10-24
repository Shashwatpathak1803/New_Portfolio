"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Mail,
  MessageCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Paperclip,
  X,
  ShieldCheck,
  ExternalLink,
  Phone,
  UserCheck,
  Link as LinkIcon,
  Globe,
  Briefcase,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import { cn } from "@/lib/utils";
import { validateAndNormalizePhone, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { WhatsAppContactType } from "@/lib/jobAssistant/ai";

type ComposerMode = "email" | "whatsapp";

const JOB_ROLES = [
  "Frontend Developer",
  "React Developer",
  "Backend Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "IT Engineer",
  "IT Support Engineer",
  "Technical Support Engineer",
  "Desktop Support Engineer",
  "Service Desk Engineer",
  "Application Support Engineer",
  "Network Support Engineer",
  "QA / Test Engineer",
  "Other",
] as const;

const WHATSAPP_CONTACT_TYPES: { id: WhatsAppContactType; label: string; desc: string }[] = [
  { id: "HR / Recruiter", label: "HR / Recruiter", desc: "Concise job inquiry" },
  { id: "Employee Referral", label: "Employee Referral", desc: "Polite referral request" },
  { id: "Hiring Manager", label: "Hiring Manager", desc: "Direct engineering intro" },
];

interface ResumeOption {
  _id: string;
  name: string;
  category: string;
  fileName: string;
  fileSize: number;
}

export default function MessageComposerPage() {
  const [mode, setMode] = useState<ComposerMode>("email");

  // ==========================================
  // 1. Email Mode State
  // ==========================================
  const [emailRole, setEmailRole] = useState<string>("Full Stack Developer");
  const [customRole, setCustomRole] = useState<string>("");
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [senderEmail, setSenderEmail] = useState<string>("");
  const [loadingResumes, setLoadingResumes] = useState<boolean>(true);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [emailRelevanceNotes, setEmailRelevanceNotes] = useState<string>("");
  const [emailGenerated, setEmailGenerated] = useState<boolean>(false);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // ==========================================
  // 2. WhatsApp Mode State
  // ==========================================
  const [waRole, setWaRole] = useState<string>("Full Stack Developer");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [contactType, setContactType] = useState<WhatsAppContactType>("HR / Recruiter");
  const [portfolioOrResumeLink, setPortfolioOrResumeLink] = useState<string>("https://shashwatpathak.dev");
  // The resume always goes as a real PDF file (never as a link). It is fetched ahead of time so the
  // share / download can run straight from the button click.
  const [waPdf, setWaPdf] = useState<{ id: string; file: File | null; state: "idle" | "loading" | "ready" | "error" }>({
    id: "",
    file: null,
    state: "idle",
  });
  const waPdfReq = useRef(0);
  const [waMessage, setWaMessage] = useState<string>("");
  const [waGenerated, setWaGenerated] = useState<boolean>(false);

  // ==========================================
  // Shared Operational States
  // ==========================================
  const [generating, setGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
    details?: string;
  } | null>(null);

  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);
  const [copiedBody, setCopiedBody] = useState<boolean>(false);
  const [copiedWaMessage, setCopiedWaMessage] = useState<boolean>(false);

  // Load resumes and sender account
  useEffect(() => {
    async function fetchResumes() {
      try {
        setLoadingResumes(true);
        const res = await fetch("/api/email-composer/resumes");
        const data = await res.json();
        if (data.resumes && Array.isArray(data.resumes)) {
          setResumes(data.resumes);
          if (data.resumes.length > 0) {
            setSelectedResumeId(data.resumes[0]._id);
          }
        }
        if (data.senderEmail) {
          setSenderEmail(data.senderEmail);
        }
      } catch (err) {
        console.error("Failed to load resumes:", err);
      } finally {
        setLoadingResumes(false);
      }
    }
    fetchResumes();
  }, []);

  const selectedResume = resumes.find((r) => r._id === selectedResumeId);

  // WhatsApp mode: download the chosen resume PDF in the background so it can be attached instantly
  useEffect(() => {
    if (mode !== "whatsapp" || !selectedResumeId) return;
    const reqId = ++waPdfReq.current;
    setWaPdf({ id: selectedResumeId, file: null, state: "loading" });
    (async () => {
      try {
        const res = await fetch(`/api/message-composer/resume/${selectedResumeId}`);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        const name =
          selectedResume?.fileName && /\.pdf$/i.test(selectedResume.fileName)
            ? selectedResume.fileName
            : `${selectedResume?.fileName || "Resume"}.pdf`;
        const file = new File([blob], name, { type: "application/pdf" });
        if (reqId === waPdfReq.current) setWaPdf({ id: selectedResumeId, file, state: "ready" });
      } catch {
        if (reqId === waPdfReq.current) setWaPdf({ id: selectedResumeId, file: null, state: "error" });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedResumeId, resumes.length]);

  // Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(recipientEmail.trim());

  // Phone Validation
  const phoneValidation = validateAndNormalizePhone(recipientPhone);

  // Switch Mode Handler
  const handleModeSwitch = (newMode: ComposerMode) => {
    setMode(newMode);
    setStatusMessage(null);
  };

  // ==========================================
  // Handlers: Email Mode
  // ==========================================
  const handleGenerateEmail = async () => {
    setStatusMessage(null);

    if (!isEmailValid) {
      setStatusMessage({
        type: "error",
        text: "Please provide a valid recipient email address before generating.",
      });
      return;
    }

    if (emailRole === "Other" && !customRole.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter your custom job role.",
      });
      return;
    }

    if (!selectedResumeId) {
      setStatusMessage({
        type: "error",
        text: "Please select a resume for this job role.",
      });
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/email-composer/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: emailRole,
          customRole: emailRole === "Other" ? customRole.trim() : undefined,
          recipientEmail: recipientEmail.trim(),
          resumeId: selectedResumeId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed. Please try again.");
      }

      setEmailSubject(data.subject || "");
      setEmailBody(data.body || "");
      setEmailRelevanceNotes(data.relevanceNotes || "");
      setEmailGenerated(true);
      setStatusMessage({
        type: "success",
        text: "Email draft generated! You can review and edit the subject and body below before sending.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: (err as Error).message || "Failed to generate email. Please retry.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleInitiateSendEmail = () => {
    setStatusMessage(null);

    if (!isEmailValid) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid recipient email address.",
      });
      return;
    }

    if (!selectedResumeId) {
      setStatusMessage({
        type: "error",
        text: "A valid resume must be selected to attach to the email.",
      });
      return;
    }

    if (!emailSubject.trim()) {
      setStatusMessage({
        type: "error",
        text: "Email subject cannot be empty. Please generate or enter a subject.",
      });
      return;
    }

    if (!emailBody.trim()) {
      setStatusMessage({
        type: "error",
        text: "Email body cannot be empty. Please generate or write an email body.",
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSendEmail = async () => {
    setShowConfirmModal(false);
    setSendingEmail(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/email-composer/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          subject: emailSubject.trim(),
          body: emailBody.trim(),
          resumeId: selectedResumeId,
          role: emailRole === "Other" ? customRole.trim() : emailRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Sending failed. Please check your SMTP settings.");
      }

      setStatusMessage({
        type: "success",
        text: `Application sent successfully to ${recipientEmail.trim()}!`,
        details: `Attachment "${data.fileName || selectedResume?.fileName || "Resume.pdf"}" delivered via authenticated sender (${data.sender || senderEmail}).`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: (err as Error).message || "Failed to send email. Please check server configuration.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // ==========================================
  // Handlers: WhatsApp Mode
  // ==========================================
  const handleGenerateWhatsApp = async () => {
    setStatusMessage(null);

    if (!waRole.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter the target job role.",
      });
      return;
    }

    if (recipientPhone.trim() && !phoneValidation.valid) {
      setStatusMessage({
        type: "error",
        text: phoneValidation.error || "Please enter a valid international mobile number with country code.",
      });
      return;
    }

    if (/\.pdf(\?|#|$)|\bresume\b|\bcv\b/i.test(portfolioOrResumeLink.trim())) {
      setStatusMessage({
        type: "error",
        text: "That looks like a resume link. The resume is sent as a PDF attachment, so enter your portfolio link only (or leave it empty).",
      });
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/message-composer/whatsapp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: waRole.trim(),
          contactType,
          portfolioUrl: portfolioOrResumeLink.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate WhatsApp message. Please retry.");
      }

      setWaMessage(data.message || "");
      setWaGenerated(true);
      setStatusMessage({
        type: "success",
        text: "WhatsApp message generated! Review it, then click 'Send with Resume PDF'. Your resume is attached as a PDF file.",
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: (err as Error).message || "Failed to generate WhatsApp message.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenWhatsApp = async () => {
    setStatusMessage(null);

    if (!phoneValidation.valid) {
      setStatusMessage({
        type: "error",
        text: phoneValidation.error || "A valid international phone number with country code is required to open WhatsApp.",
      });
      return;
    }

    if (!waMessage.trim()) {
      setStatusMessage({
        type: "error",
        text: "Message text is empty. Please generate or write a message before opening WhatsApp.",
      });
      return;
    }

    if (!selectedResumeId) {
      setStatusMessage({ type: "error", text: "Please select the resume PDF to send." });
      return;
    }

    const pdf = waPdf.id === selectedResumeId ? waPdf : null;
    if (!pdf || pdf.state === "loading") {
      setStatusMessage({ type: "info", text: "The resume PDF is still loading. Please try again in a second." });
      return;
    }
    if (pdf.state !== "ready" || !pdf.file) {
      setStatusMessage({ type: "error", text: "Could not load the resume PDF. Please re-select the resume and try again." });
      return;
    }
    const file = pdf.file;
    const text = waMessage.trim();

    // Phones: the native share sheet can send the PDF file and the message together into WhatsApp
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (isMobile && typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text, title: file.name });
        setStatusMessage({
          type: "success",
          text: "Share sheet opened with your message and the resume PDF.",
          details: `Pick WhatsApp, choose the chat with ${phoneValidation.formatted}, and hit send. The PDF goes along with the message.`,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return; // user closed the share sheet
        // any other failure: fall through to the download + chat method below
      }
    }

    // Desktop (or no file sharing): WhatsApp links cannot carry files, so open the chat with the
    // message and save the PDF so it can be attached in one step.
    const { url, error } = buildWhatsAppUrl(recipientPhone, text);
    if (error || !url) {
      setStatusMessage({ type: "error", text: error || "Could not generate WhatsApp link." });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");

    const href = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = href;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 10000);

    setStatusMessage({
      type: "info",
      text: `WhatsApp chat with ${phoneValidation.formatted} is opening and "${file.name}" was saved to your downloads.`,
      details: "In the chat, click the paperclip (+) → Document, select that PDF (or drag it in), and send it together with the message.",
    });
  };

  const copyToClipboard = (text: string, type: "subject" | "body" | "wa") => {
    navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else if (type === "body") {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } else {
      setCopiedWaMessage(true);
      setTimeout(() => setCopiedWaMessage(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-24 pb-16">
      <ScrollProgress />
      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 mb-3 text-xs font-mono tracking-wider text-accent uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Career Outreach</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink mb-3">
            Message <span className="text-gradient">Composer</span>
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-2xl">
            Quickly compose and dispatch professional outreach messages tailored to recruiters and hiring managers. Choose between direct Email delivery with PDF attachment or instant WhatsApp chat.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex w-full sm:inline-flex sm:w-auto p-1.5 rounded-2xl glass border border-line gap-2">
            <button
              type="button"
              id="tab-mode-email"
              onClick={() => handleModeSwitch("email")}
              className={cn(
                "flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-300",
                mode === "email"
                  ? "bg-accent text-white shadow-glow-accent"
                  : "text-muted hover:text-ink"
              )}
            >
              <Mail className="h-4 w-4" />
              <span>Email Mode</span>
            </button>
            <button
              type="button"
              id="tab-mode-whatsapp"
              onClick={() => handleModeSwitch("whatsapp")}
              className={cn(
                "flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-300",
                mode === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                  : "text-muted hover:text-ink"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Mode</span>
            </button>
          </div>

          {mode === "email" && senderEmail && (
            <div className="mt-3 inline-flex max-w-full flex-wrap items-center gap-1.5 text-xs font-mono text-muted/90 bg-ink/5 dark:bg-white/5 px-3 py-1 rounded-md border border-line break-all">
              <ShieldCheck className="h-3.5 w-3.5 text-teal" />
              <span>Configured Sender: <strong className="text-ink font-semibold">{senderEmail}</strong></span>
            </div>
          )}
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm",
                statusMessage.type === "success"
                  ? "bg-teal/10 border-teal/30 text-teal dark:text-emerald-300"
                  : statusMessage.type === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
              )}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : statusMessage.type === "info" ? (
                <MessageCircle className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">{statusMessage.text}</p>
                {statusMessage.details && (
                  <p className="mt-1 text-xs opacity-90">{statusMessage.details}</p>
                )}
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-current opacity-70 hover:opacity-100 p-0.5"
                aria-label="Dismiss message"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================= */}
        {/* MODE 1: EMAIL MODE FORM                                  */}
        {/* ========================================================= */}
        {mode === "email" && (
          <motion.div
            key="email-mode-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 sm:p-8 shadow-glow-flame mb-8 border border-line"
          >
            <div className="space-y-6">
              {/* Input 1: Job Role */}
              <div>
                <label
                  htmlFor="job-role-select"
                  className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium"
                >
                  1. Job Role <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <select
                    id="job-role-select"
                    value={emailRole}
                    onChange={(e) => setEmailRole(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                  >
                    {JOB_ROLES.map((r) => (
                      <option key={r} value={r} className="bg-paper text-ink">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {emailRole === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    <label
                      htmlFor="custom-role-input"
                      className="block font-mono text-xs text-muted mb-1"
                    >
                      Enter Specific Role Title
                    </label>
                    <input
                      id="custom-role-input"
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="e.g. Cloud Solutions Architect, DevOps Engineer"
                      className="w-full rounded-xl border border-line bg-paper/60 px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                    />
                  </motion.div>
                )}
              </div>

              {/* Input 2: Recipient Email */}
              <div>
                <label
                  htmlFor="recipient-email-input"
                  className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium"
                >
                  2. Recipient Email <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    id="recipient-email-input"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="hr@company.com or recruiter@organization.com"
                    className={cn(
                      "w-full rounded-xl border bg-paper/60 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-1 transition",
                      recipientEmail && !isEmailValid
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500"
                        : "border-line focus:border-accent focus:ring-accent"
                    )}
                  />
                  <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-muted pointer-events-none" />
                </div>
                {recipientEmail && !isEmailValid && (
                  <p className="mt-1.5 text-xs text-red-500 font-mono">
                    Please enter a valid email address (e.g. name@domain.com)
                  </p>
                )}
              </div>

              {/* Input 3: Resume Selector */}
              <div>
                <label
                  htmlFor="resume-select"
                  className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium"
                >
                  3. Resume PDF <span className="text-accent">*</span>
                </label>
                {loadingResumes ? (
                  <div className="flex items-center gap-2 py-3 px-4 rounded-xl border border-line bg-paper/40 text-xs text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span>Loading available resumes...</span>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300">
                    No uploaded resumes found.
                  </div>
                ) : (
                  <select
                    id="resume-select"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition"
                  >
                    {resumes.map((res) => (
                      <option key={res._id} value={res._id} className="bg-paper text-ink">
                        {res.name} — [{res.category}] ({res.fileName})
                      </option>
                    ))}
                  </select>
                )}

                {selectedResume && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-muted font-mono">
                    <Paperclip className="h-3.5 w-3.5 text-accent" />
                    <span>Attachment: <strong className="text-ink">{selectedResume.fileName}</strong> ({Math.round(selectedResume.fileSize / 1024)} KB)</span>
                  </div>
                )}
              </div>

              {/* Two Main Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  id="btn-generate-email"
                  onClick={handleGenerateEmail}
                  disabled={generating || sendingEmail}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-sm transition-all duration-300 shadow-sm",
                    generating || sendingEmail
                      ? "bg-accent/40 text-white cursor-not-allowed"
                      : "bg-accent text-white hover:brightness-110 shadow-glow-accent active:scale-[0.99]"
                  )}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Tailored Email...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Email</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-send-email"
                  onClick={handleInitiateSendEmail}
                  disabled={sendingEmail || generating || !emailSubject.trim() || !emailBody.trim()}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-sm transition-all duration-300 shadow-sm",
                    sendingEmail || generating || !emailSubject.trim() || !emailBody.trim()
                      ? "bg-teal/30 text-teal/60 border border-teal/20 cursor-not-allowed"
                      : "bg-teal text-white hover:brightness-110 shadow-glow-teal active:scale-[0.99]"
                  )}
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending With PDF Attachment...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Email Directly</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: WHATSAPP MODE FORM                               */}
        {/* ========================================================= */}
        {mode === "whatsapp" && (
          <motion.div
            key="whatsapp-mode-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 sm:p-8 shadow-glow-flame mb-8 border border-line"
          >
            <div className="space-y-6">
              {/* Field 1: Job Role (Text Input) */}
              <div>
                <label
                  htmlFor="wa-job-role-input"
                  className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium"
                >
                  1. Target Job Role <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="wa-job-role-input"
                    type="text"
                    value={waRole}
                    onChange={(e) => setWaRole(e.target.value)}
                    placeholder="e.g. React Developer, Full Stack Developer, MERN Stack Developer"
                    className="w-full rounded-xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  />
                  <Briefcase className="absolute right-3.5 top-3.5 h-4 w-4 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Recipient Mobile Number with Country Code */}
              <div>
                <label
                  htmlFor="wa-recipient-phone-input"
                  className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium"
                >
                  2. Recipient Mobile Number <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="wa-recipient-phone-input"
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+91 9876543210 or +1 5551234567"
                    className={cn(
                      "w-full rounded-xl border bg-paper/60 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-1 transition",
                      recipientPhone && !phoneValidation.valid
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500"
                        : "border-line focus:border-emerald-500 focus:ring-emerald-500"
                    )}
                  />
                  <Phone className="absolute right-3.5 top-3.5 h-4 w-4 text-muted pointer-events-none" />
                </div>
                {recipientPhone ? (
                  !phoneValidation.valid ? (
                    <p className="mt-1.5 text-xs text-red-500 font-mono">
                      {phoneValidation.error}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>Valid international number: {phoneValidation.formatted}</span>
                    </p>
                  )
                ) : (
                  <p className="mt-1.5 text-xs text-muted font-mono">
                    Must include country code with '+' (e.g. +91 for India, +1 for US/Canada)
                  </p>
                )}
              </div>

              {/* Field 3: Contact Type */}
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium">
                  3. Contact Type <span className="text-emerald-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {WHATSAPP_CONTACT_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setContactType(ct.id)}
                      className={cn(
                        "p-3.5 rounded-xl border text-left transition-all duration-200",
                        contactType === ct.id
                          ? "border-emerald-500 bg-emerald-500/10 text-ink shadow-sm"
                          : "border-line bg-paper/40 text-muted hover:border-line/80 hover:text-ink"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs sm:text-sm text-ink">{ct.label}</span>
                        {contactType === ct.id && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted">{ct.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Portfolio or Resume Link (Optional) */}
              <div>
                <label
                  htmlFor="wa-link-input"
                  className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium"
                >
                  4. Portfolio Link <span className="text-muted text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    id="wa-link-input"
                    type="url"
                    value={portfolioOrResumeLink}
                    onChange={(e) => setPortfolioOrResumeLink(e.target.value)}
                    placeholder="https://shashwatpathak.dev"
                    className="w-full rounded-xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  />
                  <Globe className="absolute right-3.5 top-3.5 h-4 w-4 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Field 5: Resume PDF (always attached as a file, never shared as a link) */}
              <div>
                <label
                  htmlFor="wa-resume-select"
                  className="block font-mono text-xs uppercase tracking-wider text-muted mb-2 font-medium"
                >
                  5. Resume PDF <span className="text-emerald-500">*</span>
                </label>
                {loadingResumes ? (
                  <div className="flex items-center gap-2 text-xs text-muted font-mono">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Loading available resumes...</span>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-xs text-red-500 font-mono">
                    No resume PDF found. Upload one in the admin panel first.
                  </div>
                ) : (
                  <select
                    id="wa-resume-select"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-xl border border-line bg-transparent px-4 py-3 text-sm text-ink focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  >
                    {resumes.map((res) => (
                      <option key={res._id} value={res._id} className="bg-petrol text-sandstone-light">
                        {res.name} ({res.category})
                      </option>
                    ))}
                  </select>
                )}
                {selectedResume && (
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-mono text-muted break-all">
                    <Paperclip className="h-3 w-3 shrink-0 text-emerald-500" />
                    <span>
                      Sent as a PDF file: <strong className="text-ink">{selectedResume.fileName}</strong> (
                      {Math.round(selectedResume.fileSize / 1024)} KB)
                      {waPdf.state === "loading" && " · preparing…"}
                      {waPdf.state === "ready" && " · ready"}
                      {waPdf.state === "error" && " · could not load"}
                    </span>
                  </p>
                )}
              </div>

              {/* Two Main WhatsApp Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  id="btn-generate-wa"
                  onClick={handleGenerateWhatsApp}
                  disabled={generating}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-sm transition-all duration-300 shadow-sm",
                    generating
                      ? "bg-emerald-600/40 text-white cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:brightness-110 shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-[0.99]"
                  )}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Message...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate WhatsApp Message</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-open-wa"
                  onClick={handleOpenWhatsApp}
                  disabled={!waMessage.trim() || !phoneValidation.valid || waPdf.state !== "ready"}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-sm transition-all duration-300 shadow-sm",
                    !waMessage.trim() || !phoneValidation.valid || waPdf.state !== "ready"
                      ? "bg-paper/40 text-muted border border-line cursor-not-allowed"
                      : "bg-emerald-700 text-white hover:brightness-110 shadow-[0_0_20px_rgba(4,120,87,0.35)] active:scale-[0.99]"
                  )}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send with Resume PDF</span>
                  <Paperclip className="h-3.5 w-3.5 ml-0.5 opacity-80" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* EDITABLE PREVIEW SECTION                                  */}
        {/* ========================================================= */}
        {mode === "email" ? (
          <motion.div
            key="email-preview-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "glass rounded-2xl p-6 sm:p-8 border border-line transition-all duration-300",
              emailGenerated ? "ring-1 ring-accent/30 shadow-glow-flame" : "opacity-95"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-line gap-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
                  <span>Email Preview & Editor</span>
                  {emailGenerated && (
                    <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Draft Ready
                    </span>
                  )}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Review and customize the subject and body before sending.
                </p>
              </div>

              {selectedResume && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper/60 border border-line text-xs font-mono text-muted">
                  <Paperclip className="h-3 w-3 text-accent" />
                  <span className="truncate max-w-[200px]">{selectedResume.fileName}</span>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Subject Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="email-subject-input"
                    className="font-mono text-xs uppercase tracking-wider text-muted font-medium"
                  >
                    Email Subject
                  </label>
                  {emailSubject && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(emailSubject, "subject")}
                      className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-accent transition-colors"
                    >
                      {copiedSubject ? (
                        <>
                          <Check className="h-3 w-3 text-teal" />
                          <span className="text-teal">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <input
                  id="email-subject-input"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Click 'Generate Email' above to compose an authentic subject..."
                  className="w-full rounded-xl border border-line bg-paper/60 px-4 py-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition font-medium"
                />
              </div>

              {/* Body Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="email-body-input"
                    className="font-mono text-xs uppercase tracking-wider text-muted font-medium"
                  >
                    Email Body
                  </label>
                  {emailBody && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(emailBody, "body")}
                      className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-accent transition-colors"
                    >
                      {copiedBody ? (
                        <>
                          <Check className="h-3 w-3 text-teal" />
                          <span className="text-teal">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  id="email-body-input"
                  rows={12}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Click 'Generate Email' above or type your personalized message here..."
                  className="w-full rounded-xl border border-line bg-paper/60 p-4 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition leading-relaxed font-sans"
                />
              </div>

              {emailRelevanceNotes && (
                <div className="p-3.5 rounded-xl border border-line bg-paper/40 text-xs text-muted">
                  <strong className="text-ink font-semibold">AI Relevance Note: </strong>
                  <span>{emailRelevanceNotes}</span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="whatsapp-preview-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "glass rounded-2xl p-6 sm:p-8 border border-line transition-all duration-300",
              waGenerated ? "ring-1 ring-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]" : "opacity-95"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-line gap-2">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
                  <span>WhatsApp Message Preview</span>
                  {waGenerated && (
                    <span className="text-[11px] font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Ready to Send
                    </span>
                  )}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Editable preview of the message. Your resume goes along as a PDF attachment.
                </p>
              </div>

              {phoneValidation.valid && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <Phone className="h-3 w-3" />
                  <span>{phoneValidation.formatted}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-muted font-medium">
                  Message Content ({waMessage.length} characters)
                </span>
                {waMessage && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(waMessage, "wa")}
                    className="inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-emerald-500 transition-colors"
                  >
                    {copiedWaMessage ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Chat bubble styled textarea */}
              <div className="relative rounded-2xl border border-line bg-paper/70 p-4 sm:p-5">
                <textarea
                  id="wa-message-textarea"
                  rows={8}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Click 'Generate WhatsApp Message' above or type your direct outreach here..."
                  className="w-full bg-transparent text-sm text-ink focus:outline-none leading-relaxed font-sans resize-y"
                />
                {selectedResume && (
                  <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-mono text-emerald-400">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 break-all">{selectedResume.fileName}</span>
                    <span className="shrink-0 opacity-70">PDF attached</span>
                  </div>
                )}
                <div className="pt-3 border-t border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
                  <span className="text-[11px] font-mono break-words">
                    Target: <strong>{contactType}</strong> &bull; Role: <strong>{waRole}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    disabled={!waMessage.trim() || !phoneValidation.valid || waPdf.state !== "ready"}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition",
                      !waMessage.trim() || !phoneValidation.valid || waPdf.state !== "ready"
                        ? "opacity-50 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    )}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Send with Resume PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Confirmation Modal for Email Mode */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg glass rounded-2xl p-6 sm:p-7 border border-line shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                  <Send className="h-4 w-4 text-accent" />
                  <span>Confirm Email Dispatch</span>
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-muted hover:text-ink p-1"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-muted">
                <p>
                  You are about to send this job application directly from the server:
                </p>
                <div className="p-3.5 rounded-xl bg-paper/80 border border-line space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-muted">To: </span>
                    <strong className="text-ink">{recipientEmail}</strong>
                  </div>
                  <div>
                    <span className="text-muted">From: </span>
                    <strong className="text-ink">{senderEmail || "Configured Sender"}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Subject: </span>
                    <strong className="text-ink truncate block">{emailSubject}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-accent pt-1">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attached: <strong>{selectedResume?.fileName || "Resume.pdf"}</strong></span>
                  </div>
                </div>
                <p className="text-xs text-muted/80">
                  Please confirm that the details are correct. The email provider will be contacted immediately.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-mono font-medium text-muted hover:text-ink transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendEmail}
                  disabled={sendingEmail}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110 shadow-glow-teal transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Confirm & Send Now</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
