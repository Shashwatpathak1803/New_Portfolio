// ---------------------------------------------------------------------------
// Central content file. Edit this file to update copy across the whole site.
// ---------------------------------------------------------------------------

import type { SiteContent, SkillGroup, ExperienceItem, Service, Project, SectionId, SectionConfig } from "./types";
export type { SkillGroup, ExperienceItem, Service, Project };

export const profile = {
  name: "Shashwat Pathak",
  roles: ["MERN Stack Developer", "AI Engineer", "Full Stack Developer"],
  location: "India",
  email: "shashwatpathak901@gmail.com",
  resumeUrl: "/resume/Shashwat_Pathak_Resume.pdf",
  photo: "/images/profile.jpg",
  social: {
    github: "https://github.com/Shashwatpathak1803",
    linkedin: "https://www.linkedin.com/in/shashwat-pathak-53b685228",
    instagram: "https://instagram.com/_shashwat_pathak_",
    email: "mailto:shashwatpathak901@gmail.com",
  },
};

export const aboutCopy = {
  eyebrow: "About",
  heading: "I build the parts of the internet that have to actually work.",
  paragraphs: [
    "I'm a full stack developer who likes the unglamorous middle of a product — the data model, the API contract, the edge case nobody flagged. The MERN stack is my default toolkit, but the real interest is in how a system holds up once real users start pushing on it.",
    "Lately that's extended into AI: training and evaluating LLMs, writing prompts that hold up under pressure, and running RLHF passes where a one-point rubric difference actually changes model behavior. I treat it with the same rigor as backend work — instrument it, measure it, don't trust your gut.",
    "Before any of this, I spent time in business development — sourcing leads, running outreach, managing a CRM pipeline. It's why I default to thinking about who uses a feature and what they're trying to get done, not just whether the code compiles.",
  ],
};

export const stats = [
  { label: "Years of Learning", value: 3, suffix: "+" },
  { label: "Projects Completed", value: 12, suffix: "+" },
  { label: "Internships", value: 2, suffix: "" },
  { label: "Technologies Learned", value: 20, suffix: "+" },
];

export const skillGroups: SkillGroup[] = [
  {
    groupLabel: "Languages",
    skills: [
      { name: "JavaScript", level: 90 },
      { name: "Python", level: 80 },
      { name: "SQL", level: 75 },
    ],
  },
  {
    groupLabel: "Frontend",
    skills: [
      { name: "React.js", level: 92 },
      { name: "Next.js", level: 88 },
      { name: "Tailwind CSS", level: 90 },
    ],
  },
  {
    groupLabel: "Backend",
    skills: [
      { name: "Node.js", level: 86 },
      { name: "Express.js", level: 85 },
      { name: "MongoDB", level: 82 },
      { name: "REST APIs", level: 88 },
    ],
  },
  {
    groupLabel: "Tools & Practice",
    skills: [
      { name: "Git", level: 88 },
      { name: "GitHub", level: 88 },
      { name: "Responsive Design", level: 90 },
    ],
  },
];

export const experience: ExperienceItem[] = [
  {
    company: "Ethara AI",
    role: "LLM Post-Training Engineer",
    period: "2025 — Present",
    type: "AI / Machine Learning",
    points: [
      "AI data annotation across multi-turn conversational datasets",
      "Prompt engineering for evaluation and red-teaming workflows",
      "Model evaluation against task-specific rubrics and quality bars",
      "RLHF tasks: pairwise ranking and reward-signal feedback loops",
    ],
  },
  {
    company: "Naturagro Harvest Pvt Ltd (HAPSMAN)",
    role: "Business Development Executive",
    period: "2023 — 2024",
    type: "Business Development",
    points: [
      "Lead generation and qualification for B2B agri-tech clients",
      "Client outreach and relationship management end-to-end",
      "CRM management to keep the sales pipeline accurate and current",
      "Sales coordination across field and back-office teams",
    ],
  },
];

export const services: Service[] = [
  {
    number: "01",
    title: "Web Development",
    description:
      "Marketing sites and web apps built on a clean, semantic foundation — fast by default, not as an afterthought.",
  },
  {
    number: "02",
    title: "Full Stack Development",
    description:
      "End-to-end ownership: data model, API, and UI designed together so nothing gets lost in translation.",
  },
  {
    number: "03",
    title: "MERN Stack Applications",
    description:
      "MongoDB, Express, React, and Node assembled into products that are easy to extend six months from now.",
  },
  {
    number: "04",
    title: "AI & LLM Solutions",
    description:
      "Prompt design, evaluation pipelines, and RLHF-informed workflows for teams shipping LLM-backed features.",
  },
  {
    number: "05",
    title: "API Integration",
    description:
      "Third-party and internal APIs wired up with proper error handling, retries, and documentation that holds up.",
  },
  {
    number: "06",
    title: "Responsive UI Design",
    description:
      "Interfaces that hold their composition from a 27-inch monitor down to a phone in one hand.",
  },
];

export const projects: Project[] = [
  {
    title: "YR Realty — Real Estate Platform",
    description:
      "A full-stack real estate platform with secure authentication, property listing management, and advanced search and filtering by location, price, and category.",
    image: "/images/projects/yr-realty.jpg",
    stack: ["React", "TypeScript", "Node.js", "MongoDB"],
    github: "https://github.com/Shashwatpathak1803/YR-reality",
    live: "https://yr-reality.vercel.app",
  },
  {
    title: "YR Realty — Admin Dashboard",
    description:
      "The admin side of YR Realty: a dashboard for creating, editing, and managing property listings, deployed separately from the public site.",
    image: "/images/projects/yr-admin.jpg",
    stack: ["React", "TypeScript", "TanStack", "Tailwind CSS"],
    github: "https://github.com/Shashwatpathak1803/yr_admin",
    live: "https://yr-admin-yr11.vercel.app",
  },
  {
    title: "AutoFlow AI",
    description:
      "An autonomous content and email automation engine. A Node.js scheduler picks up due jobs from MongoDB, generates content with Google Gemini, publishes or sends it, and logs every step.",
    image: "/images/projects/autoflow-ai.jpg",
    stack: ["React", "Node.js", "Express.js", "MongoDB", "Gemini API"],
    github: "https://github.com/Shashwatpathak1803/autoai_new",
  },
  {
    title: "Arkveda Herbals — Ayurvedic E-commerce",
    description:
      "A four-part e-commerce system: a TypeScript REST API, a customer storefront, an admin panel, and a lead-capture landing page with agent assignment, with Razorpay payments.",
    image: "/images/projects/arkveda.jpg",
    stack: ["React", "TypeScript", "Express.js", "MongoDB", "Razorpay"],
    github: "https://github.com/Shashwatpathak1803/akrveda",
  },
  {
    title: "FoodasMood — Food Ordering App",
    description:
      "A full-stack food ordering application with user authentication, menu browsing, cart management, and online order placement, plus a separate admin panel.",
    image: "/images/projects/foodasmood.jpg",
    stack: ["React", "Node.js", "Express.js", "MongoDB", "Stripe"],
    github: "https://github.com/Shashwatpathak1803/React-FoodasMood",
    live: "https://react-foodas-mood.vercel.app",
  },
  {
    title: "SATHI-UP — NGO Website",
    description:
      "A responsive website for an NGO, built around photographs from the organisation's projects, with all content driven from a single config file.",
    image: "/images/projects/sathi-up.jpg",
    stack: ["React", "Vite", "React Router"],
    github: "https://github.com/Shashwatpathak1803/sathi",
    live: "https://sathi-yr11.vercel.app",
  },
];

export const contactInfo = [
  { label: "Email", value: profile.email, href: profile.social.email },
  { label: "LinkedIn", value: "/in/shashwat-pathak-53b685228", href: profile.social.linkedin },
  { label: "GitHub", value: "/Shashwatpathak1803", href: profile.social.github },
  { label: "Location", value: profile.location, href: undefined },
];

// ---------------------------------------------------------------------------
// Default content: used until something is saved from /admin, and as the
// fallback whenever MongoDB is not configured or unreachable.
// ---------------------------------------------------------------------------

const sectionItems: Record<SectionId, SectionConfig> = {
  about: { visible: true, eyebrow: aboutCopy.eyebrow, heading: aboutCopy.heading },
  skills: { visible: true, eyebrow: "Skills", heading: "Tools I reach for, sharpened through repetition." },
  experience: {
    visible: true,
    eyebrow: "Experience",
    heading: "Two very different jobs, one habit: figure out what actually moves the needle.",
  },
  services: {
    visible: true,
    eyebrow: "Services",
    heading: "Six ways I can help, in the order I usually get asked about them.",
  },
  projects: { visible: true, eyebrow: "Featured Projects", heading: "A few builds worth the click-through." },
  contact: {
    visible: true,
    eyebrow: "Contact",
    heading: "Have a project, a role, or just a question? Send it over.",
  },
};

export const defaultContent: SiteContent = {
  profile: {
    ...profile,
    roles: [...profile.roles],
    social: { ...profile.social, twitter: "", youtube: "", website: "" },
  },
  hero: {
    badge: "Open to work",
    showBadge: true,
    titleLine1: "Hii, I'm",
    titleLine2: "Shashwat Pathak",
    subtext:
      "Full stack developer working across MERN and LLM engineering. Clean APIs, solid data models, interfaces people enjoy using.",
    ctaLabel: "View Projects",
    showResumeButton: true,
  },
  sections: {
    order: ["about", "skills", "experience", "services", "projects", "contact"],
    items: sectionItems,
  },
  about: {
    paragraphs: [...aboutCopy.paragraphs],
    highlights: [
      "MERN stack developer who ships, not just prototypes",
      "AI engineer — LLM post-training, prompts, RLHF",
      "Background in business development & client ops",
      "Creative problem solver, fast learner by default",
    ],
  },
  stats,
  skillGroups,
  experience,
  services,
  projects: projects.map((p) => ({ ...p, visible: true })),
  marquee: {
    show: true,
    heading: "Tools & technologies I work with",
    rowOne: [
      "React.js", "Next.js", "TypeScript", "JavaScript", "Node.js", "Express.js",
      "MongoDB", "Tailwind CSS", "REST APIs", "Framer Motion",
    ],
    rowTwo: [
      "LLM Post-Training", "Agentic AI Workflows", "OpenAI API", "Gemini API", "Python",
      "SQL", "Git & GitHub", "Stripe", "Razorpay", "Vercel",
    ],
  },
  contact: {
    formEnabled: true,
    info: contactInfo.map((c) => ({ label: c.label, value: c.value, href: c.href })),
  },
  seo: {
    title: `${profile.name} — ${profile.roles.join(" / ")}`,
    description:
      "Personal portfolio of Shashwat Pathak — MERN Stack Developer, AI Engineer, and Full Stack Developer. Explore projects, experience, and skills.",
    keywords: [
      "Shashwat Pathak", "MERN Stack Developer", "AI Engineer", "Full Stack Developer",
      "Portfolio", "React Developer", "Next.js Developer",
    ],
    ogImage: "/images/og-cover.jpg",
    siteUrl: "https://shashwatpathak.dev",
    noindex: false,
  },
  settings: {
    defaultTheme: "light",
    showLoader: true,
    customCursor: true,
    trackViews: true,
    footerText: "Built with Next.js, Framer Motion & GSAP.",
    maintenance: false,
    maintenanceMessage: "The site is getting an update. Please check back soon.",
    senderEmail: "shashwatpathak901@gmail.com",
    senderName: "Shashwat Pathak",
  },
};
