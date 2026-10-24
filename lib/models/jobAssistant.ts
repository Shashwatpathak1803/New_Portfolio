import mongoose, { Schema, type Model, type Document } from "mongoose";

function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

// ---------------------------------------------------------------------------
// 1. Professional Profile
// ---------------------------------------------------------------------------
export interface IJobAssistantProfile {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  summary: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    details?: string;
  }>;
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    other: string[];
  };
  experience: Array<{
    company: string;
    role: string;
    period: string;
    type?: string;
    points: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    stack: string[];
    highlights?: string[];
    liveUrl?: string;
    githubUrl?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
  }>;
  achievements?: string[];
  customNotes?: string;
}

const JobAssistantProfileSchema = new Schema<IJobAssistantProfile>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    summary: { type: String, default: "" },
    education: [
      {
        degree: { type: String, default: "" },
        institution: { type: String, default: "" },
        year: { type: String, default: "" },
        details: { type: String, default: "" },
      },
    ],
    skills: {
      programmingLanguages: { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      databases: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      other: { type: [String], default: [] },
    },
    experience: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        period: { type: String, default: "" },
        type: { type: String, default: "" },
        points: { type: [String], default: [] },
      },
    ],
    projects: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        stack: { type: [String], default: [] },
        highlights: { type: [String], default: [] },
        liveUrl: { type: String, default: "" },
        githubUrl: { type: String, default: "" },
      },
    ],
    certifications: [
      {
        name: { type: String, default: "" },
        issuer: { type: String, default: "" },
        year: { type: String, default: "" },
      },
    ],
    achievements: { type: [String], default: [] },
    customNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const JobAssistantProfile = getModel<IJobAssistantProfile>(
  "JobAssistantProfile",
  JobAssistantProfileSchema
);

// ---------------------------------------------------------------------------
// 2. Resume Library (Private Storage in MongoDB)
// ---------------------------------------------------------------------------
export interface IJobAssistantResume {
  name: string;
  category: string;
  notes?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: Buffer;
  extractedText: string;
  isScannedOrEmpty: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobAssistantResumeSchema = new Schema<IJobAssistantResume>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, default: "General" },
    notes: { type: String, default: "", maxlength: 1000 },
    fileName: { type: String, required: true, trim: true, maxlength: 200 },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true, default: "application/pdf" },
    data: { type: Buffer, required: true },
    extractedText: { type: String, default: "" },
    isScannedOrEmpty: { type: Boolean, default: false },
  },
  { timestamps: true }
);

JobAssistantResumeSchema.index({ category: 1, createdAt: -1 });

export const JobAssistantResume = getModel<IJobAssistantResume>(
  "JobAssistantResume",
  JobAssistantResumeSchema
);

// ---------------------------------------------------------------------------
// 3. Application History
// ---------------------------------------------------------------------------
export type ApplicationStatus =
  | "Draft"
  | "Ready to Apply"
  | "Applied"
  | "Follow-up Due"
  | "Interview"
  | "Rejected"
  | "Offer Received"
  | "Closed";

export interface IJobApplication {
  recipientEmail: string;
  recipientName?: string;
  companyName: string;
  jobTitle: string;
  applicationType: string;
  roleCategory: string;
  customRole?: string;
  resumeId?: mongoose.Types.ObjectId | null;
  resumeName?: string;
  jobDescription?: string;
  emailStyle: string;
  subject: string;
  body: string;
  aiRelevanceNotes?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    recipientEmail: { type: String, required: true, trim: true },
    recipientName: { type: String, trim: true, default: "" },
    companyName: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    applicationType: { type: String, required: true, default: "Job Application" },
    roleCategory: { type: String, required: true, default: "Full Stack Developer" },
    customRole: { type: String, trim: true, default: "" },
    resumeId: { type: Schema.Types.ObjectId, ref: "JobAssistantResume", default: null },
    resumeName: { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    emailStyle: { type: String, default: "Professional" },
    subject: { type: String, default: "" },
    body: { type: String, default: "" },
    aiRelevanceNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "Draft",
        "Ready to Apply",
        "Applied",
        "Follow-up Due",
        "Interview",
        "Rejected",
        "Offer Received",
        "Closed",
      ],
      default: "Draft",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

JobApplicationSchema.index({ status: 1, createdAt: -1 });
JobApplicationSchema.index({ companyName: 1, jobTitle: 1 });
JobApplicationSchema.index({ recipientEmail: 1 });

export const JobApplication = getModel<IJobApplication>(
  "JobApplication",
  JobApplicationSchema
);
