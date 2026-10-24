export const JOB_ROLES = [
  "Frontend Developer",
  "React Developer",
  "JavaScript Developer",
  "Backend Developer",
  "Node.js Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "Junior Web Developer",
  "IT Support Engineer",
  "IT Engineer",
  "Technical Support Engineer",
  "Desktop Support Engineer",
  "Service Desk Engineer",
  "Application Support Engineer",
  "Network Support Engineer",
  "QA / Test Engineer",
  "Other",
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

export const RESUME_CATEGORIES = [
  "Full Stack",
  "Frontend",
  "Backend",
  "MERN Stack",
  "IT Support & Technical Support",
  "AI & Machine Learning",
  "General / Software Engineer",
] as const;

export const APPLICATION_TYPES = [
  "Job Application",
  "Internship Application",
  "Referral Request",
  "Recruiter Outreach",
  "Follow-up Email",
] as const;

export type ApplicationType = (typeof APPLICATION_TYPES)[number];

export const EMAIL_STYLES = [
  "Professional",
  "Short and Direct",
  "Friendly but Professional",
  "Formal",
  "Referral Request",
  "Follow-up",
] as const;

export type EmailStyle = (typeof EMAIL_STYLES)[number];

export const APPLICATION_STATUSES = [
  "Draft",
  "Ready to Apply",
  "Applied",
  "Follow-up Due",
  "Interview",
  "Rejected",
  "Offer Received",
  "Closed",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

