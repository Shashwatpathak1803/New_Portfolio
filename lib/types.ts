export type SectionId = "about" | "skills" | "experience" | "services" | "projects" | "contact";

export type Profile = {
  name: string;
  roles: string[];
  location: string;
  email: string;
  resumeUrl: string;
  photo: string;
  social: {
    github: string;
    linkedin: string;
    instagram: string;
    twitter: string;
    youtube: string;
    website: string;
    /** derived from `email` — not edited directly */
    email: string;
  };
};

export type Stat = { label: string; value: number; suffix: string };
export type SkillGroup = { groupLabel: string; skills: { name: string; level: number }[] };
export type ExperienceItem = { company: string; role: string; period: string; type: string; points: string[] };
export type Service = { number: string; title: string; description: string };
export type Project = {
  title: string;
  description: string;
  image: string;
  stack: string[];
  github: string;
  live?: string;
  visible?: boolean;
};
export type ContactInfo = { label: string; value: string; href?: string };

export type SectionConfig = { visible: boolean; eyebrow: string; heading: string };

export type SiteContent = {
  profile: Profile;
  hero: {
    badge: string;
    showBadge: boolean;
    titleLine1: string;
    titleLine2: string;
    subtext: string;
    ctaLabel: string;
    showResumeButton: boolean;
  };
  sections: { order: SectionId[]; items: Record<SectionId, SectionConfig> };
  about: { paragraphs: string[]; highlights: string[] };
  stats: Stat[];
  skillGroups: SkillGroup[];
  experience: ExperienceItem[];
  services: Service[];
  projects: Project[];
  marquee: { show: boolean; heading: string; rowOne: string[]; rowTwo: string[] };
  contact: { formEnabled: boolean; info: ContactInfo[] };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    siteUrl: string;
    noindex: boolean;
  };
  settings: {
    defaultTheme: "light" | "dark";
    showLoader: boolean;
    customCursor: boolean;
    trackViews: boolean;
    footerText: string;
    maintenance: boolean;
    maintenanceMessage: string;
    senderEmail?: string;
    senderName?: string;
  };
};

export type ContentKey = keyof SiteContent;
