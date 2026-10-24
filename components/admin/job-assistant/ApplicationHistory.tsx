"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  CopyCheck,
  Send,
  Loader2,
  Calendar,
  Building,
  Check,
  Save,
  X,
  FileText,
  ChevronDown,
} from "lucide-react";
import { api, toast } from "@/components/admin/api";
import { Btn, IconBtn, PageHeader, Select, Card, Text, Area } from "@/components/admin/ui";
import {
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  type ApplicationStatus,
  type ApplicationType,
} from "@/lib/jobAssistant/roles";

interface ApplicationItem {
  _id: string;
  recipientEmail: string;
  recipientName?: string;
  companyName: string;
  jobTitle: string;
  applicationType: ApplicationType;
  roleCategory: string;
  customRole?: string;
  resumeId?: string | null;
  resumeName?: string;
  jobDescription?: string;
  emailStyle: string;
  subject: string;
  body: string;
  aiRelevanceNotes?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationHistoryProps {
  onLoadInComposer?: (app: ApplicationItem) => void;
}

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  Draft: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400", border: "border-zinc-300 dark:border-zinc-700" },
  "Ready to Apply": { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  Applied: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  "Follow-up Due": { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  Interview: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  "Offer Received": { bg: "bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/40" },
  Rejected: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
  Closed: { bg: "bg-zinc-200/50 dark:bg-zinc-800/40", text: "text-zinc-500", border: "border-zinc-300/50 dark:border-zinc-700/50" },
};

export default function ApplicationHistory({ onLoadInComposer }: ApplicationHistoryProps) {
  const [apps, setApps] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Selected for edit modal
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("Draft");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Expanded View details
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Copy tracking
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await api<{ applications: ApplicationItem[]; dbConnected: boolean }>(
        "/api/admin/job-assistant/applications"
      );
      setApps(res.applications || []);
      setDbConnected(res.dbConnected !== false);
    } catch (err) {
      toast((err as Error).message || "Failed to load applications", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesType = typeFilter === "all" || app.applicationType === typeFilter;
      const matchesSearch =
        !searchQuery ||
        [
          app.companyName,
          app.jobTitle,
          app.recipientEmail,
          app.recipientName,
          app.roleCategory,
          app.customRole,
          app.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [apps, statusFilter, typeFilter, searchQuery]);

  // Status Quick Update
  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      setApps((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
      await api(`/api/admin/job-assistant/applications/${id}`, {
        method: "PATCH",
        json: { status: newStatus },
      });
      toast(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast((err as Error).message || "Failed to update status", "err");
      loadApplications();
    }
  };

  // Duplicate Application
  const handleDuplicate = async (app: ApplicationItem) => {
    try {
      const res = await api<{ application: ApplicationItem }>(
        "/api/admin/job-assistant/applications",
        {
          method: "POST",
          json: {
            recipientEmail: app.recipientEmail,
            recipientName: app.recipientName,
            companyName: `${app.companyName} (Copy)`,
            jobTitle: app.jobTitle,
            applicationType: app.applicationType,
            roleCategory: app.roleCategory,
            customRole: app.customRole,
            resumeId: app.resumeId,
            resumeName: app.resumeName,
            jobDescription: app.jobDescription,
            emailStyle: app.emailStyle,
            subject: app.subject,
            body: app.body,
            aiRelevanceNotes: app.aiRelevanceNotes,
            status: "Draft",
            notes: app.notes,
          },
        }
      );
      toast("Application duplicated as new draft.");
      setApps((prev) => [res.application, ...prev]);
    } catch (err) {
      toast((err as Error).message || "Failed to duplicate application", "err");
    }
  };

  // Delete Application
  const handleDelete = async (id: string, company: string) => {
    if (!confirm(`Delete application record for ${company}? This cannot be undone.`)) {
      return;
    }
    try {
      await api(`/api/admin/job-assistant/applications/${id}`, {
        method: "DELETE",
      });
      toast("Application deleted.");
      setApps((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      toast((err as Error).message || "Failed to delete application", "err");
    }
  };

  // Open Edit Modal
  const openEdit = (app: ApplicationItem) => {
    setEditingApp(app);
    setEditSubject(app.subject || "");
    setEditBody(app.body || "");
    setEditStatus(app.status || "Draft");
    setEditNotes(app.notes || "");
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingApp) return;
    setSavingEdit(true);
    try {
      const res = await api<{ application: ApplicationItem }>(
        `/api/admin/job-assistant/applications/${editingApp._id}`,
        {
          method: "PATCH",
          json: {
            subject: editSubject,
            body: editBody,
            status: editStatus,
            notes: editNotes,
          },
        }
      );
      toast("Application updated.");
      setApps((prev) =>
        prev.map((a) => (a._id === editingApp._id ? res.application : a))
      );
      setEditingApp(null);
    } catch (err) {
      toast((err as Error).message || "Failed to save edits", "err");
    } finally {
      setSavingEdit(false);
    }
  };

  // Copy Email
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast("Email copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open in Mail Client
  const handleMailto = (app: ApplicationItem) => {
    const s = encodeURIComponent(app.subject || "");
    const b = encodeURIComponent(app.body || "");
    const url = `mailto:${app.recipientEmail}?subject=${s}&body=${b}`;
    if (url.length > 1900) {
      toast("Email content copied to clipboard (exceeds mailto URL limit)", "ok");
      navigator.clipboard.writeText(`Subject: ${app.subject}\n\n${app.body}`);
      window.location.href = `mailto:${app.recipientEmail}?subject=${s}`;
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application History"
        desc="Track, filter, and manage your job applications, drafts, and follow-ups in one place."
      />

      {!dbConnected && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          MongoDB is not connected (<code>MONGODB_URI</code> missing). Application history requires a database connection.
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All Statuses ({apps.length})</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({apps.filter((a) => a.status === s).length})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All Types</option>
            {APPLICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search company, role, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading application records...
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <Building className="mx-auto h-10 w-10 text-zinc-400" />
          <h3 className="mt-3 text-base font-medium text-zinc-900 dark:text-zinc-100">
            No applications found
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {searchQuery || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "Generate an email in the Email Composer and click 'Save Draft' to start tracking here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const isExpanded = expandedId === app._id;
            const style = STATUS_COLORS[app.status] || STATUS_COLORS.Draft;

            return (
              <div
                key={app._id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        {app.companyName}
                      </h3>
                      <span className="text-zinc-400">—</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {app.jobTitle}
                      </span>

                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app._id, e.target.value as ApplicationStatus)
                        }
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${style.bg} ${style.text} ${style.border} focus:outline-none cursor-pointer`}
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span>
                        Recipient: {app.recipientName ? `${app.recipientName} ` : ""}
                        &lt;{app.recipientEmail}&gt;
                      </span>
                      <span>Type: {app.applicationType}</span>
                      {app.resumeName && (
                        <span>Resume: {app.resumeName}</span>
                      )}
                      <span>
                        Created: {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {app.subject && (
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mt-1">
                        Subject: {app.subject}
                      </p>
                    )}

                    {app.notes && (
                      <p className="text-xs text-zinc-500 italic mt-0.5">
                        Notes: &ldquo;{app.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {onLoadInComposer && (
                      <Btn
                        variant="ghost"
                        className="text-xs py-1 px-2.5"
                        onClick={() => onLoadInComposer(app)}
                        title="Load into Email Composer"
                      >
                        <Send className="h-3 w-3" /> Composer
                      </Btn>
                    )}

                    <Btn
                      variant="ghost"
                      className="text-xs py-1 px-2.5"
                      onClick={() => handleCopy(app._id, `Subject: ${app.subject}\n\n${app.body}`)}
                      title="Copy complete email"
                    >
                      {copiedId === app._id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Btn>

                    <Btn
                      variant="ghost"
                      className="text-xs py-1 px-2.5"
                      onClick={() => handleMailto(app)}
                      title="Open in Email App"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Btn>

                    <Btn
                      variant="ghost"
                      className="text-xs py-1 px-2.5"
                      onClick={() => openEdit(app)}
                      title="Edit application"
                    >
                      <Edit className="h-3 w-3" />
                    </Btn>

                    <Btn
                      variant="ghost"
                      className="text-xs py-1 px-2.5"
                      onClick={() => handleDuplicate(app)}
                      title="Duplicate as new draft"
                    >
                      <CopyCheck className="h-3 w-3" />
                    </Btn>

                    <Btn
                      variant="danger"
                      className="text-xs py-1 px-2"
                      onClick={() => handleDelete(app._id, app.companyName)}
                      title="Delete application"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Btn>
                  </div>
                </div>

                {/* Collapsible Full Draft Body */}
                <div className="mt-3 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : app._id)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                    {isExpanded ? "Hide Draft Body" : "View Draft Body"}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-300 font-sans whitespace-pre-wrap border border-zinc-200 dark:border-zinc-800">
                      {app.body || "(No email body saved)"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setEditingApp(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Edit Application: {editingApp.companyName}
                </h3>
                <p className="text-xs text-zinc-500">
                  {editingApp.jobTitle} • {editingApp.recipientEmail}
                </p>
              </div>
              <IconBtn onClick={() => setEditingApp(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </IconBtn>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Body
                </label>
                <textarea
                  rows={8}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Followed up on LinkedIn with hiring manager..."
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <Btn variant="ghost" onClick={() => setEditingApp(null)} disabled={savingEdit}>
                  Cancel
                </Btn>
                <Btn variant="primary" onClick={handleSaveEdit} disabled={savingEdit}>
                  {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
