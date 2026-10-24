"use client";

import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  DownloadCloud,
} from "lucide-react";
import { api, toast } from "@/components/admin/api";
import {
  Btn,
  Card,
  Field,
  Grid,
  PageHeader,
  Tags,
  Text,
  Area,
  StringList,
  ItemList,
} from "@/components/admin/ui";
import type { IJobAssistantProfile } from "@/lib/models/jobAssistant";

export default function ProfessionalProfile() {
  const [profile, setProfile] = useState<IJobAssistantProfile | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api<{
        profile: IJobAssistantProfile;
        isDefault: boolean;
        dbConnected: boolean;
      }>("/api/admin/job-assistant/profile");
      setProfile(res.profile);
      setSavedSnapshot(JSON.stringify(res.profile));
      setDbConnected(res.dbConnected !== false);
    } catch (err) {
      toast((err as Error).message || "Failed to load profile", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const isDirty = profile ? JSON.stringify(profile) !== savedSnapshot : false;

  const handleSave = async () => {
    if (!profile) return;
    if (!profile.fullName?.trim() || !profile.email?.trim()) {
      toast("Full Name and Professional Email are required.", "err");
      return;
    }

    setSaving(true);
    try {
      const res = await api<{ profile: IJobAssistantProfile; success: boolean }>(
        "/api/admin/job-assistant/profile",
        {
          method: "POST",
          json: profile,
        }
      );
      setProfile(res.profile);
      setSavedSnapshot(JSON.stringify(res.profile));
      toast("Professional profile saved successfully!");
    } catch (err) {
      toast((err as Error).message || "Failed to save profile", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!savedSnapshot) return;
    try {
      setProfile(JSON.parse(savedSnapshot));
      toast("Unsaved changes discarded.");
    } catch {}
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading professional profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Professional Profile"
        desc="Maintain your verified background (education, skills, experience, projects). The AI uses only these facts to draft outreach emails."
      >
        <div className="flex items-center gap-2">
          <Btn variant="ghost" onClick={loadProfile} disabled={saving}>
            <RotateCcw className="h-4 w-4" /> Reset / Reload
          </Btn>
          <Btn variant="primary" onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </Btn>
        </div>
      </PageHeader>

      {!dbConnected && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          MongoDB is not connected (<code>MONGODB_URI</code> missing). Changes cannot be saved to the database.
        </div>
      )}

      {/* 1. Basic Information */}
      <Card title="1. Basic Information" desc="Your verified identity and contact details.">
        <Grid>
          <Text
            label="Full Name *"
            value={profile.fullName}
            onChange={(v) => setProfile({ ...profile, fullName: v })}
            placeholder="e.g. Shashwat Pathak"
          />
          <Text
            label="Professional Email *"
            value={profile.email}
            onChange={(v) => setProfile({ ...profile, email: v })}
            placeholder="e.g. your.email@example.com"
          />
        </Grid>
        <Grid>
          <Text
            label="Phone Number (Optional)"
            value={profile.phone || ""}
            onChange={(v) => setProfile({ ...profile, phone: v })}
            placeholder="e.g. +91 9876543210"
          />
          <Text
            label="Location"
            value={profile.location || ""}
            onChange={(v) => setProfile({ ...profile, location: v })}
            placeholder="e.g. Noida, India"
          />
        </Grid>
        <Area
          label="Professional Summary"
          value={profile.summary || ""}
          onChange={(v) => setProfile({ ...profile, summary: v })}
          rows={3}
          placeholder="Brief 2-3 sentence summary of your core strengths and technical focus..."
        />
      </Card>

      {/* 2. Education */}
      <Card title="2. Education" desc="Degrees and academic background.">
        <ItemList
          items={profile.education || []}
          onChange={(v) => setProfile({ ...profile, education: v })}
          blank={() => ({
            degree: "",
            institution: "",
            year: "",
            details: "",
          })}
          summary={(e) => <>{e.degree || "New Degree"} — {e.institution || "Institution"}</>}
          addLabel="Add Education"
          render={(edu, update) => (
            <div className="space-y-3">
              <Grid>
                <Text
                  label="Degree / Major"
                  value={edu.degree}
                  onChange={(v) => update({ degree: v })}
                  placeholder="e.g. B.Tech. in Computer Science"
                />
                <Text
                  label="Institution / University"
                  value={edu.institution}
                  onChange={(v) => update({ institution: v })}
                  placeholder="e.g. Greater Noida Institute of Technology"
                />
              </Grid>
              <Grid>
                <Text
                  label="Graduation Year / Period"
                  value={edu.year}
                  onChange={(v) => update({ year: v })}
                  placeholder="e.g. 2021 – 2025"
                />
                <Text
                  label="Grade / CGPA / Details"
                  value={edu.details || ""}
                  onChange={(v) => update({ details: v })}
                  placeholder="e.g. CGPA: 7.5"
                />
              </Grid>
            </div>
          )}
        />
      </Card>

      {/* 3. Verified Skills */}
      <Card
        title="3. Verified Technical Skills"
        desc="Categorized skills. The AI will only claim proficiency in the items listed here."
      >
        <div className="space-y-4">
          <Tags
            label="Programming Languages"
            value={profile.skills?.programmingLanguages || []}
            onChange={(v) =>
              setProfile({
                ...profile,
                skills: { ...profile.skills, programmingLanguages: v },
              })
            }
            placeholder="Type language and press Enter (e.g. JavaScript, Python, TypeScript)"
          />

          <Tags
            label="Frameworks & Libraries"
            value={profile.skills?.frameworks || []}
            onChange={(v) =>
              setProfile({
                ...profile,
                skills: { ...profile.skills, frameworks: v },
              })
            }
            placeholder="e.g. React.js, Node.js, Express.js, Next.js, Tailwind CSS"
          />

          <Tags
            label="Databases & Data Storage"
            value={profile.skills?.databases || []}
            onChange={(v) =>
              setProfile({
                ...profile,
                skills: { ...profile.skills, databases: v },
              })
            }
            placeholder="e.g. MongoDB, PostgreSQL, SQL, Redis"
          />

          <Tags
            label="Tools, Platforms & Practices"
            value={profile.skills?.tools || []}
            onChange={(v) =>
              setProfile({
                ...profile,
                skills: { ...profile.skills, tools: v },
              })
            }
            placeholder="e.g. Git, GitHub, REST APIs, Docker, Postman"
          />

          <Tags
            label="Other Specializations (AI/ML, Systems, Support)"
            value={profile.skills?.other || []}
            onChange={(v) =>
              setProfile({
                ...profile,
                skills: { ...profile.skills, other: v },
              })
            }
            placeholder="e.g. LLM Post-Training, Evaluation Rubrics, IT Support"
          />
        </div>
      </Card>

      {/* 4. Experience & Internships */}
      <Card
        title="4. Work & Internship Experience"
        desc="Real positions and verifiable responsibilities."
      >
        <ItemList
          items={profile.experience || []}
          onChange={(v) => setProfile({ ...profile, experience: v })}
          blank={() => ({
            company: "",
            role: "",
            period: "",
            type: "Full-Time",
            points: [""],
          })}
          summary={(exp) => <>{exp.role || "Role"} at {exp.company || "Company"} ({exp.period || "Period"})</>}
          addLabel="Add Experience"
          render={(exp, update) => (
            <div className="space-y-4">
              <Grid cols={3}>
                <Text
                  label="Company Name"
                  value={exp.company}
                  onChange={(v) => update({ company: v })}
                  placeholder="e.g. Ethara AI"
                />
                <Text
                  label="Role Title"
                  value={exp.role}
                  onChange={(v) => update({ role: v })}
                  placeholder="e.g. LLM Post-Training Engineer"
                />
                <Text
                  label="Period"
                  value={exp.period}
                  onChange={(v) => update({ period: v })}
                  placeholder="e.g. 2025 – Present"
                />
              </Grid>

              <StringList
                label="Key Responsibilities / Accomplishments"
                value={exp.points || []}
                onChange={(pts) => update({ points: pts })}
                placeholder="e.g. Evaluated AI-generated model outputs against quality rubrics."
                addLabel="Add responsibility bullet"
              />
            </div>
          )}
        />
      </Card>

      {/* 5. Projects */}
      <Card
        title="5. Verified Projects"
        desc="Key applications and real deliverables the AI can reference in email pitches."
      >
        <ItemList
          items={profile.projects || []}
          onChange={(v) => setProfile({ ...profile, projects: v })}
          blank={() => ({
            title: "",
            description: "",
            stack: [],
            highlights: [],
            liveUrl: "",
            githubUrl: "",
          })}
          summary={(p) => <>{p.title || "New Project"} ({(p.stack || []).slice(0, 3).join(", ")})</>}
          addLabel="Add Project"
          render={(proj, update) => (
            <div className="space-y-3">
              <Grid>
                <Text
                  label="Project Title"
                  value={proj.title}
                  onChange={(v) => update({ title: v })}
                  placeholder="e.g. YR Realty — Real Estate Platform"
                />
                <Tags
                  label="Tech Stack"
                  value={proj.stack || []}
                  onChange={(v) => update({ stack: v })}
                  placeholder="e.g. React, Node.js, MongoDB"
                />
              </Grid>
              <Area
                label="Description"
                value={proj.description}
                onChange={(v) => update({ description: v })}
                rows={2}
                placeholder="Brief description of the platform and what it does..."
              />
              <Grid>
                <Text
                  label="Live URL (Optional)"
                  value={proj.liveUrl || ""}
                  onChange={(v) => update({ liveUrl: v })}
                  placeholder="https://..."
                />
                <Text
                  label="GitHub URL (Optional)"
                  value={proj.githubUrl || ""}
                  onChange={(v) => update({ githubUrl: v })}
                  placeholder="https://github.com/..."
                />
              </Grid>
            </div>
          )}
        />
      </Card>

      {/* 6. Achievements & Notes */}
      <Card title="6. Key Achievements & Notes" desc="Measurable milestones or custom guidance.">
        <StringList
          label="Notable Achievements / Metrics"
          value={profile.achievements || []}
          onChange={(v) => setProfile({ ...profile, achievements: v })}
          placeholder="e.g. Improved LLM evaluation accuracy by 25% through systematic QA workflows."
          addLabel="Add achievement"
        />

        <div className="mt-4">
          <Area
            label="Additional Career Context / Notes for AI"
            value={profile.customNotes || ""}
            onChange={(v) => setProfile({ ...profile, customNotes: v })}
            rows={3}
            placeholder="Any specific preferences or career guidance the AI assistant should keep in mind..."
          />
        </div>
      </Card>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 z-20 -mx-4 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 sm:-mx-8 sm:px-8">
        <span className="text-xs text-zinc-500">
          {isDirty ? "● Unsaved changes in profile" : "All profile changes saved"}
        </span>
        <div className="flex gap-2">
          <Btn onClick={handleDiscard} disabled={!isDirty || saving}>
            Discard
          </Btn>
          <Btn variant="primary" onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile Changes
          </Btn>
        </div>
      </div>
    </div>
  );
}
