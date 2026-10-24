"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Send,
  Plus,
  RefreshCw,
} from "lucide-react";
import { api, toast } from "@/components/admin/api";
import { Btn, Card, Field, PageHeader, Select, Text, Area } from "@/components/admin/ui";
import { RESUME_CATEGORIES } from "@/lib/jobAssistant/roles";

interface ResumeDoc {
  _id: string;
  name: string;
  category: string;
  notes?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string;
  isScannedOrEmpty?: boolean;
  createdAt: string;
}

interface ResumeLibraryProps {
  onSelectForComposer?: (resumeId: string) => void;
}

export default function ResumeLibrary({ onSelectForComposer }: ResumeLibraryProps) {
  const [resumes, setResumes] = useState<ResumeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  // Upload Form State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Full Stack");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded extracted text preview state
  const [expandedTextId, setExpandedTextId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const res = await api<{ resumes: ResumeDoc[]; dbConnected: boolean }>(
        "/api/admin/job-assistant/resumes"
      );
      setResumes(res.resumes || []);
      setDbConnected(res.dbConnected !== false);
    } catch (err) {
      toast((err as Error).message || "Failed to load resumes", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
        toast("Only PDF files are accepted.", "err");
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        toast("File size exceeds 5 MB limit.", "err");
        return;
      }
      setFile(selected);
      if (!name) {
        setName(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast("Please select a PDF file.", "err");
      return;
    }
    if (!name.trim()) {
      toast("Please provide a descriptive name.", "err");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name.trim());
      fd.append("category", category);
      fd.append("notes", notes.trim());

      await api("/api/admin/job-assistant/resumes", {
        method: "POST",
        body: fd,
      });

      toast("Resume uploaded and text extracted successfully!");
      setShowUploadForm(false);
      setName("");
      setNotes("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadResumes();
    } catch (err) {
      toast((err as Error).message || "Failed to upload resume", "err");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, resumeName: string) => {
    if (!confirm(`Are you sure you want to delete "${resumeName}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api(`/api/admin/job-assistant/resumes/${id}`, {
        method: "DELETE",
      });
      toast("Resume deleted successfully.");
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast((err as Error).message || "Failed to delete resume", "err");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Library"
        desc="Upload, organize, and inspect your private resumes. Resumes are stored securely in MongoDB and parsed on the server."
      >
        <Btn variant="primary" onClick={() => setShowUploadForm(!showUploadForm)}>
          <Plus className="h-4 w-4" /> Upload Resume
        </Btn>
      </PageHeader>

      {!dbConnected && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          MongoDB is not connected (<code>MONGODB_URI</code> missing). Resumes cannot be saved permanently.
        </div>
      )}

      {/* Upload Form Card */}
      {showUploadForm && (
        <Card
          title="Upload New Resume"
          desc="PDF only, max 5 MB. Server-side text extraction runs automatically upon upload."
          className="border-orange-500/20 bg-orange-500/5"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label="Descriptive Resume Name *"
                value={name}
                onChange={setName}
                placeholder="e.g. Shashwat - MERN Full Stack 2026"
              />
              <Select
                label="Role Category"
                value={category}
                onChange={setCategory}
                options={RESUME_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </div>

            <Area
              label="Optional Notes"
              value={notes}
              onChange={setNotes}
              rows={2}
              placeholder="e.g. Highlights 2 years MERN experience and Ethara AI LLM evaluation role."
            />

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                PDF File *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-600"
                required
              />
              <p className="mt-1 text-[11px] text-zinc-500">
                Resumes are kept strictly private and accessible only to you through this admin session.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="ghost" type="button" onClick={() => setShowUploadForm(false)} disabled={uploading}>
                Cancel
              </Btn>
              <Btn variant="primary" type="submit" disabled={uploading || !file}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Extracting Text & Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" /> Save to Library
                  </>
                )}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Resumes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading your resume library...
        </div>
      ) : resumes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <FileText className="mx-auto h-10 w-10 text-zinc-400" />
          <h3 className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
            No resumes uploaded yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Upload your PDF resume to ground your AI job applications in verified facts.
          </p>
          <Btn
            variant="primary"
            className="mt-4"
            onClick={() => setShowUploadForm(true)}
          >
            <Upload className="h-4 w-4" /> Upload Resume
          </Btn>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => {
            const isExpanded = expandedTextId === resume._id;
            const isDeleting = deletingId === resume._id;

            return (
              <div
                key={resume._id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {resume.name}
                      </h3>
                      <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                        {resume.category}
                      </span>
                      {resume.isScannedOrEmpty ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" /> Scanned / Low Text (Profile fallback used)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Text Extracted
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span>File: {resume.fileName}</span>
                      <span>Size: {formatFileSize(resume.fileSize)}</span>
                      <span>Uploaded: {new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>

                    {resume.notes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 italic">
                        &ldquo;{resume.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {onSelectForComposer && (
                      <Btn
                        variant="primary"
                        className="text-xs"
                        onClick={() => onSelectForComposer(resume._id)}
                      >
                        <Send className="h-3.5 w-3.5" /> Use in Composer
                      </Btn>
                    )}

                    <a
                      href={`/api/admin/job-assistant/resumes/${resume._id}/download`}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>

                    <Btn
                      variant="danger"
                      className="text-xs"
                      onClick={() => handleDelete(resume._id, resume.name)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Btn>
                  </div>
                </div>

                {/* Collapsible Extracted Text Preview */}
                <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setExpandedTextId(isExpanded ? null : resume._id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" /> Hide Extracted Text Preview
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" /> Inspect Extracted Text Content
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-950/60 font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                      {resume.extractedText ? (
                        resume.extractedText
                      ) : (
                        <span className="italic text-zinc-400">
                          (No extractable text found in this PDF. If this is a scanned document, the AI Email Composer will rely on your Professional Profile for candidate details.)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
