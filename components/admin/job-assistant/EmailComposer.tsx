"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Mail,
  Save,
  RotateCcw,
  ExternalLink,
  Check,
  FileText,
  AlertCircle,
  Loader2,
  Info,
  Upload,
} from "lucide-react";
import { api, toast } from "@/components/admin/api";
import {
  Btn,
  Card,
  Field,
  Grid,
  PageHeader,
  Select,
  Text,
  Area,
} from "@/components/admin/ui";
import {
  JOB_ROLES,
  APPLICATION_TYPES,
  EMAIL_STYLES,
  type ApplicationType,
  type EmailStyle,
} from "@/lib/jobAssistant/roles";

interface ResumeSummary {
  _id: string;
  name: string;
  category: string;
  fileName: string;
  fileSize: number;
  isScannedOrEmpty?: boolean;
}

interface EmailComposerProps {
  initialResumeId?: string;
  onGoToTab?: (tab: "composer" | "resumes" | "profile" | "history") => void;
  prefillApplication?: {
    recipientEmail?: string;
    recipientName?: string;
    companyName?: string;
    jobTitle?: string;
    applicationType?: ApplicationType;
    roleCategory?: string;
    customRole?: string;
    resumeId?: string;
    jobDescription?: string;
    emailStyle?: EmailStyle;
    subject?: string;
    body?: string;
  } | null;
}

export default function EmailComposer({
  initialResumeId,
  onGoToTab,
  prefillApplication,
}: EmailComposerProps) {
  // Form State
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [applicationType, setApplicationType] = useState<ApplicationType>("Job Application");
  const [roleCategory, setRoleCategory] = useState<string>("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || "");
  const [jobDescription, setJobDescription] = useState("");
  const [emailStyle, setEmailStyle] = useState<EmailStyle>("Professional");

  // Output State
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [relevanceNotes, setRelevanceNotes] = useState("");
  const [providerUsed, setProviderUsed] = useState<string>("");

  // Loading & Action states
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Quick Resume Upload state
  const [showQuickUpload, setShowQuickUpload] = useState(false);
  const [quickUploadName, setQuickUploadName] = useState("");
  const [quickUploadCategory, setQuickUploadCategory] = useState("Full Stack");
  const [quickUploadFile, setQuickUploadFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load Resumes
  const loadResumes = async () => {
    try {
      setLoadingResumes(true);
      const res = await api<{ resumes: ResumeSummary[] }>("/api/admin/job-assistant/resumes");
      setResumes(res.resumes || []);
      if (initialResumeId && res.resumes?.some((r) => r._id === initialResumeId)) {
        setSelectedResumeId(initialResumeId);
      } else if (!selectedResumeId && res.resumes?.length > 0) {
        setSelectedResumeId(res.resumes[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  // Handle prefill if coming from History
  useEffect(() => {
    if (prefillApplication) {
      if (prefillApplication.recipientEmail) setRecipientEmail(prefillApplication.recipientEmail);
      if (prefillApplication.recipientName) setRecipientName(prefillApplication.recipientName);
      if (prefillApplication.companyName) setCompanyName(prefillApplication.companyName);
      if (prefillApplication.jobTitle) setJobTitle(prefillApplication.jobTitle);
      if (prefillApplication.applicationType) setApplicationType(prefillApplication.applicationType);
      if (prefillApplication.roleCategory) setRoleCategory(prefillApplication.roleCategory);
      if (prefillApplication.customRole) setCustomRole(prefillApplication.customRole);
      if (prefillApplication.resumeId) setSelectedResumeId(prefillApplication.resumeId);
      if (prefillApplication.jobDescription) setJobDescription(prefillApplication.jobDescription);
      if (prefillApplication.emailStyle) setEmailStyle(prefillApplication.emailStyle);
      if (prefillApplication.subject) setSubject(prefillApplication.subject);
      if (prefillApplication.body) setBody(prefillApplication.body);
    }
  }, [prefillApplication]);

  const selectedResume = resumes.find((r) => r._id === selectedResumeId);

  // Form Validation
  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!recipientEmail.trim()) {
      errs.recipientEmail = "Recruiter's email address is required.";
    } else if (!emailRegex.test(recipientEmail.trim())) {
      errs.recipientEmail = "Please enter a valid email address.";
    }

    if (!companyName.trim()) {
      errs.companyName = "Company name is required.";
    }

    if (!jobTitle.trim()) {
      errs.jobTitle = "Job title is required.";
    }

    if (roleCategory === "Other" && !customRole.trim()) {
      errs.customRole = "Please specify the custom role.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Generate Email Handler
  const handleGenerate = async () => {
    if (!validateForm()) {
      toast("Please fix the errors in the form before generating", "err");
      return;
    }

    setGenerating(true);
    try {
      const res = await api<{
        subject: string;
        body: string;
        relevanceNotes: string;
        provider: string;
      }>("/api/admin/job-assistant/generate", {
        method: "POST",
        json: {
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim(),
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          applicationType,
          roleCategory,
          customRole: roleCategory === "Other" ? customRole.trim() : "",
          resumeId: selectedResumeId || undefined,
          jobDescription: jobDescription.trim() || undefined,
          emailStyle,
        },
      });

      setSubject(res.subject);
      setBody(res.body);
      setRelevanceNotes(res.relevanceNotes || "");
      setProviderUsed(res.provider || "gemini");
      toast("Email draft generated successfully!");
    } catch (err) {
      toast((err as Error).message || "Failed to generate email", "err");
    } finally {
      setGenerating(false);
    }
  };

  // Save Draft to Application History
  const handleSaveDraft = async (status: "Draft" | "Ready to Apply" = "Draft") => {
    if (!recipientEmail || !companyName || !jobTitle) {
      toast("Recipient email, company, and job title are required to save.", "err");
      return;
    }

    setSavingDraft(true);
    try {
      await api("/api/admin/job-assistant/applications", {
        method: "POST",
        json: {
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim(),
          companyName: companyName.trim(),
          jobTitle: jobTitle.trim(),
          applicationType,
          roleCategory,
          customRole: roleCategory === "Other" ? customRole.trim() : "",
          resumeId: selectedResumeId || null,
          resumeName: selectedResume ? selectedResume.name : "",
          jobDescription: jobDescription.trim(),
          emailStyle,
          subject,
          body,
          aiRelevanceNotes: relevanceNotes,
          status,
        },
      });

      toast(status === "Draft" ? "Draft saved to Application History" : "Marked as Ready to Apply!");
      if (onGoToTab) {
        onGoToTab("history");
      }
    } catch (err) {
      toast((err as Error).message || "Failed to save application", "err");
    } finally {
      setSavingDraft(false);
    }
  };

  // Copy Helpers
  const handleCopy = (text: string, type: "subject" | "body" | "all") => {
    navigator.clipboard.writeText(text);
    if (type === "subject") {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
      toast("Subject copied to clipboard");
    } else if (type === "body") {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
      toast("Email body copied to clipboard");
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
      toast("Complete email copied to clipboard");
    }
  };

  // Open in email client with URL length safety check
  const handleOpenEmailClient = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

    // Standard URL length limit across browsers is ~2000 chars
    if (mailtoUrl.length > 1900) {
      toast("Email body is too long for direct mailto link. Complete email copied to clipboard instead!", "err");
      handleCopy(`Subject: ${subject}\n\n${body}`, "all");
      window.location.href = `mailto:${recipientEmail}?subject=${encodedSubject}`;
    } else {
      window.location.href = mailtoUrl;
    }
  };

  // Quick Resume Upload Submit
  const handleQuickUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUploadFile) {
      toast("Please select a PDF file", "err");
      return;
    }
    if (!quickUploadName.trim()) {
      toast("Please provide a name for this resume", "err");
      return;
    }

    setUploadingResume(true);
    try {
      const fd = new FormData();
      fd.append("file", quickUploadFile);
      fd.append("name", quickUploadName.trim());
      fd.append("category", quickUploadCategory);

      const res = await api<{ success: boolean; resume: ResumeSummary }>(
        "/api/admin/job-assistant/resumes",
        {
          method: "POST",
          body: fd,
        }
      );

      toast("Resume uploaded and processed!");
      setShowQuickUpload(false);
      setQuickUploadFile(null);
      setQuickUploadName("");
      await loadResumes();
      if (res.resume?._id) {
        setSelectedResumeId(res.resume._id);
      }
    } catch (err) {
      toast((err as Error).message || "Upload failed", "err");
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Composer"
        desc="Generate highly tailored, factual job outreach emails matching your verified profile and selected resume."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form Inputs (7 cols on lg) */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Recipient Information */}
          <Card title="1. Recipient Information" desc="Who are you reaching out to?">
            <Grid>
              <div>
                <Text
                  label="Recruiter's Email *"
                  value={recipientEmail}
                  onChange={(v) => {
                    setRecipientEmail(v);
                    if (errors.recipientEmail) setErrors({ ...errors, recipientEmail: "" });
                  }}
                  placeholder="recruiter@company.com"
                  type="email"
                />
                {errors.recipientEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.recipientEmail}</p>
                )}
              </div>
              <Text
                label="Recruiter's Name (Optional)"
                value={recipientName}
                onChange={setRecipientName}
                placeholder="e.g. Sarah Connor"
              />
            </Grid>

            <Grid>
              <div>
                <Text
                  label="Company Name *"
                  value={companyName}
                  onChange={(v) => {
                    setCompanyName(v);
                    if (errors.companyName) setErrors({ ...errors, companyName: "" });
                  }}
                  placeholder="e.g. Acme Corp"
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>
                )}
              </div>
              <div>
                <Text
                  label="Job Title *"
                  value={jobTitle}
                  onChange={(v) => {
                    setJobTitle(v);
                    if (errors.jobTitle) setErrors({ ...errors, jobTitle: "" });
                  }}
                  placeholder="e.g. Frontend Engineer"
                />
                {errors.jobTitle && (
                  <p className="mt-1 text-xs text-red-500">{errors.jobTitle}</p>
                )}
              </div>
            </Grid>
          </Card>

          {/* 2. Application & Role Alignment */}
          <Card title="2. Role & Application Type" desc="Tailor the tone and positioning.">
            <Grid>
              <Select
                label="Application Type"
                value={applicationType}
                onChange={(v) => setApplicationType(v as ApplicationType)}
                options={APPLICATION_TYPES.map((t) => ({ value: t, label: t }))}
              />
              <Select
                label="Job Role Category"
                value={roleCategory}
                onChange={setRoleCategory}
                options={JOB_ROLES.map((r) => ({ value: r, label: r }))}
              />
            </Grid>

            {roleCategory === "Other" && (
              <div>
                <Text
                  label="Custom Role Title *"
                  value={customRole}
                  onChange={(v) => {
                    setCustomRole(v);
                    if (errors.customRole) setErrors({ ...errors, customRole: "" });
                  }}
                  placeholder="e.g. Solutions Architect"
                />
                {errors.customRole && (
                  <p className="mt-1 text-xs text-red-500">{errors.customRole}</p>
                )}
              </div>
            )}

            <Select
              label="Email Tone / Style"
              value={emailStyle}
              onChange={(v) => setEmailStyle(v as EmailStyle)}
              options={EMAIL_STYLES.map((s) => ({ value: s, label: s }))}
            />
          </Card>

          {/* 3. Resume Selection */}
          <Card title="3. Resume Selection" desc="Pick an uploaded resume to ground the email in verified facts.">
            {loadingResumes ? (
              <div className="flex items-center gap-2 py-3 text-xs text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading resumes...
              </div>
            ) : resumes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
                <p className="text-xs text-zinc-500">No resumes found in your Resume Library.</p>
                <Btn
                  variant="ghost"
                  className="mt-2 text-xs"
                  onClick={() => setShowQuickUpload(true)}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload a resume now
                </Btn>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <select
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                    >
                      <option value="">(None - Rely on Professional Profile only)</option>
                      {resumes.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} — [{r.category}] ({Math.round(r.fileSize / 1024)} KB)
                        </option>
                      ))}
                    </select>
                  </div>
                  <Btn
                    variant="ghost"
                    className="shrink-0 text-xs"
                    onClick={() => setShowQuickUpload(!showQuickUpload)}
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload new
                  </Btn>
                </div>

                {selectedResume && (
                  <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    <FileText className="h-4 w-4 shrink-0 text-orange-500" />
                    <span className="font-medium truncate">{selectedResume.fileName}</span>
                    <span className="ml-auto rounded bg-zinc-200 px-2 py-0.5 text-[10px] dark:bg-zinc-700">
                      {selectedResume.category}
                    </span>
                    {selectedResume.isScannedOrEmpty && (
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                        Scanned PDF
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick Upload Modal / Accordion */}
            {showQuickUpload && (
              <form
                onSubmit={handleQuickUploadSubmit}
                className="mt-3 space-y-3 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 text-xs"
              >
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Quick Upload Resume (PDF only, max 5 MB)
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Resume Name (e.g. Full Stack 2026)"
                    className="w-full rounded border border-zinc-300 bg-white p-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    value={quickUploadName}
                    onChange={(e) => setQuickUploadName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category (e.g. Full Stack)"
                    className="w-full rounded border border-zinc-300 bg-white p-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                    value={quickUploadCategory}
                    onChange={(e) => setQuickUploadCategory(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="text-xs file:mr-2 file:rounded file:border-0 file:bg-orange-500 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setQuickUploadFile(f);
                        if (!quickUploadName) setQuickUploadName(f.name.replace(/\.[^/.]+$/, ""));
                      }
                    }}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Btn variant="ghost" onClick={() => setShowQuickUpload(false)} disabled={uploadingResume}>
                    Cancel
                  </Btn>
                  <Btn variant="primary" type="submit" disabled={uploadingResume}>
                    {uploadingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Upload & Select"}
                  </Btn>
                </div>
              </form>
            )}
          </Card>

          {/* 4. Optional Job Description */}
          <Card
            title="4. Job Description (Optional)"
            desc="Paste the full JD to allow the AI to emphasize the most relevant matching skills."
          >
            <Area
              label="Paste Job Description"
              value={jobDescription}
              onChange={setJobDescription}
              rows={5}
              placeholder="Paste job requirements, responsibilities, or role details here..."
            />
          </Card>

          {/* Generate Button */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              * The assistant will never automatically send an email. You can edit the output freely.
            </p>
            <Btn
              variant="primary"
              className="h-11 px-6 text-sm font-semibold shadow-sm"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating Draft...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Email
                </>
              )}
            </Btn>
          </div>
        </div>

        {/* Right Column: Editable Preview & Actions (5 cols on lg) */}
        <div className="space-y-6 lg:col-span-5">
          <Card
            title="Email Preview"
            desc="Review and refine before using."
            className="sticky top-20 border-orange-500/20 bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/60"
          >
            {/* Metadata Summary Pill */}
            <div className="rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800/70">
              <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">To:</span>{" "}
                  {recipientEmail || "—"}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Company:</span>{" "}
                  {companyName || "—"}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Role:</span>{" "}
                  {jobTitle || "—"}
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Tone:</span>{" "}
                  {emailStyle}
                </div>
              </div>

              {providerUsed && (
                <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 text-[11px] text-zinc-500 dark:border-zinc-700">
                  <span>Engine: {providerUsed.toUpperCase()}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">● Grounded in verified facts</span>
                </div>
              )}
            </div>

            {/* AI Relevance Notes (if any) */}
            {relevanceNotes && (
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-xs text-orange-800 dark:text-orange-300">
                <div className="flex items-center gap-1.5 font-medium">
                  <Info className="h-3.5 w-3.5" /> Alignment Context:
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {relevanceNotes}
                </p>
              </div>
            )}

            {/* Editable Subject */}
            <Field label="Subject Line">
              <div className="relative">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject will appear here after generation..."
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-sm font-medium text-zinc-900 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(subject, "subject")}
                  disabled={!subject}
                  aria-label="Copy subject"
                  className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
                >
                  {copiedSubject ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            {/* Editable Body */}
            <Field label="Email Body">
              <div className="relative">
                <textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Generated email body will appear here. You can edit any part before copying or opening..."
                  className="w-full rounded-lg border border-zinc-300 bg-white p-3 font-sans text-sm leading-relaxed text-zinc-900 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            </Field>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <Btn
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={() => handleCopy(subject, "subject")}
                  disabled={!subject}
                >
                  {copiedSubject ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Subject
                </Btn>
                <Btn
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={() => handleCopy(body, "body")}
                  disabled={!body}
                >
                  {copiedBody ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Email
                </Btn>
              </div>

              <Btn
                variant="ghost"
                className="w-full text-xs"
                onClick={() => handleCopy(`Subject: ${subject}\n\n${body}`, "all")}
                disabled={!subject && !body}
              >
                {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                Copy Complete Email (Subject + Body)
              </Btn>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Btn
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={() => handleSaveDraft("Draft")}
                  disabled={savingDraft || (!subject && !body)}
                >
                  {savingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Draft
                </Btn>
                <Btn
                  variant="primary"
                  className="w-full text-xs"
                  onClick={handleOpenEmailClient}
                  disabled={!recipientEmail || (!subject && !body)}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open in Email App
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
