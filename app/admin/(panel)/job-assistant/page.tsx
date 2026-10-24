"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, FileText, UserCheck, History, Sparkles } from "lucide-react";
import EmailComposer from "@/components/admin/job-assistant/EmailComposer";
import ResumeLibrary from "@/components/admin/job-assistant/ResumeLibrary";
import ProfessionalProfile from "@/components/admin/job-assistant/ProfessionalProfile";
import ApplicationHistory from "@/components/admin/job-assistant/ApplicationHistory";
import { Loading } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type TabId = "composer" | "resumes" | "profile" | "history";

const TABS: { id: TabId; label: string; icon: typeof Send; desc: string }[] = [
  { id: "composer", label: "Email Composer", icon: Send, desc: "Generate outreach" },
  { id: "resumes", label: "Resume Library", icon: FileText, desc: "Private PDF storage" },
  { id: "profile", label: "Professional Profile", icon: UserCheck, desc: "Verified credentials" },
  { id: "history", label: "Application History", icon: History, desc: "Tracked drafts & apps" },
];

function JobAssistantContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && ["composer", "resumes", "profile", "history"].includes(tabParam)
      ? tabParam
      : "composer"
  );

  const [composerResumeId, setComposerResumeId] = useState<string | undefined>(undefined);
  const [prefillApplication, setPrefillApplication] = useState<any>(null);

  // Sync tab with URL
  const switchTab = (id: TabId) => {
    setActiveTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState({}, "", url.toString());
  };

  useEffect(() => {
    if (tabParam && tabParam !== activeTab && ["composer", "resumes", "profile", "history"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Handle cross-tab actions
  const handleSelectResumeForComposer = (resumeId: string) => {
    setComposerResumeId(resumeId);
    switchTab("composer");
  };

  const handleLoadAppInComposer = (app: any) => {
    setPrefillApplication({
      recipientEmail: app.recipientEmail,
      recipientName: app.recipientName,
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      applicationType: app.applicationType,
      roleCategory: app.roleCategory,
      customRole: app.customRole,
      resumeId: app.resumeId,
      jobDescription: app.jobDescription,
      emailStyle: app.emailStyle,
      subject: app.subject,
      body: app.body,
    });
    switchTab("composer");
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition",
                  isActive
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-orange-500" : "text-zinc-400")} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === "composer" && (
          <EmailComposer
            initialResumeId={composerResumeId}
            onGoToTab={switchTab}
            prefillApplication={prefillApplication}
          />
        )}
        {activeTab === "resumes" && (
          <ResumeLibrary onSelectForComposer={handleSelectResumeForComposer} />
        )}
        {activeTab === "profile" && <ProfessionalProfile />}
        {activeTab === "history" && (
          <ApplicationHistory onLoadInComposer={handleLoadAppInComposer} />
        )}
      </div>
    </div>
  );
}

export default function JobAssistantPage() {
  return (
    <Suspense fallback={<Loading />}>
      <JobAssistantContent />
    </Suspense>
  );
}
