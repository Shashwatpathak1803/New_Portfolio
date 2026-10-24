import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantProfile } from "@/lib/models/jobAssistant";
import { profile as defaultProfile, experience as defaultExperience, projects as defaultProjects, skillGroups } from "@/lib/data";

function getDefaultProfileData() {
  const programmingLanguages: string[] = [];
  const frameworks: string[] = [];
  const databases: string[] = [];
  const tools: string[] = [];
  const other: string[] = [];

  for (const group of skillGroups) {
    const label = group.groupLabel.toLowerCase();
    const names = group.skills.map((s) => s.name);
    if (label.includes("language")) {
      programmingLanguages.push(...names);
    } else if (label.includes("front") || label.includes("backend")) {
      for (const n of names) {
        if (["MongoDB", "SQL", "PostgreSQL"].includes(n)) {
          databases.push(n);
        } else {
          frameworks.push(n);
        }
      }
    } else if (label.includes("tool") || label.includes("practice")) {
      tools.push(...names);
    } else {
      other.push(...names);
    }
  }

  return {
    fullName: defaultProfile.name || "Shashwat Pathak",
    email: defaultProfile.email || "shashwatpathak901@gmail.com",
    phone: "+91 6387886545",
    location: defaultProfile.location || "India",
    summary:
      "Software Engineer with hands-on experience building full-stack web applications using the MERN stack, and applied experience as an LLM Post-Training Engineer evaluating and refining AI model outputs. Skilled in designing responsive user interfaces, building REST APIs, and working with modern databases.",
    education: [
      {
        degree: "B.Tech. in Computer Science and Engineering",
        institution: "Greater Noida Institute of Technology",
        year: "2021 – 2025",
        details: "CGPA: 6.5",
      },
    ],
    skills: {
      programmingLanguages: programmingLanguages.length ? programmingLanguages : ["JavaScript", "Python", "SQL"],
      frameworks: frameworks.length ? frameworks : ["React.js", "Node.js", "Express.js", "Next.js", "Tailwind CSS"],
      databases: databases.length ? databases : ["MongoDB", "REST APIs"],
      tools: tools.length ? tools : ["Git", "GitHub"],
      other: other.length ? other : ["LLM Post-Training", "Evaluation Rubrics", "RLHF Workflows"],
    },
    experience: defaultExperience.map((e) => ({
      company: e.company,
      role: e.role,
      period: e.period,
      type: e.type,
      points: e.points || [],
    })),
    projects: defaultProjects.map((p) => ({
      title: p.title,
      description: p.description,
      stack: p.stack,
      highlights: [],
      liveUrl: p.live || "",
      githubUrl: p.github || "",
    })),
    certifications: [],
    achievements: [
      "Improved LLM response evaluation accuracy by 25–30% through systematic data annotation and QA workflows at Ethara.AI.",
      "Drove model performance improvements of 20%+ by evaluating AI-generated outputs against strict quality standards.",
      "Deployed production-ready full-stack applications across multiple domains handling real-time updates and search.",
    ],
    customNotes: "",
  };
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  if (!hasDb()) {
    return NextResponse.json({
      profile: getDefaultProfileData(),
      isDefault: true,
      dbConnected: false,
    });
  }

  try {
    await connectDb();
    let doc = await JobAssistantProfile.findOne().lean();

    if (!doc) {
      return NextResponse.json({
        profile: getDefaultProfileData(),
        isDefault: true,
        dbConnected: true,
      });
    }

    return NextResponse.json({
      profile: doc,
      isDefault: false,
      dbConnected: true,
    });
  } catch (err) {
    console.error("[job-assistant/profile GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to load professional profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  if (!hasDb()) {
    return NextResponse.json(
      { error: "MONGODB_URI is not set — profile cannot be saved to database." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid profile payload" }, { status: 400 });
    }

    if (!body.fullName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: "Full Name and Professional Email are required." },
        { status: 400 }
      );
    }

    await connectDb();

    // Upsert single profile record
    const updated = await JobAssistantProfile.findOneAndUpdate(
      {},
      {
        fullName: body.fullName.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || "",
        location: body.location?.trim() || "",
        summary: body.summary?.trim() || "",
        education: Array.isArray(body.education) ? body.education : [],
        skills: {
          programmingLanguages: Array.isArray(body.skills?.programmingLanguages)
            ? body.skills.programmingLanguages
            : [],
          frameworks: Array.isArray(body.skills?.frameworks) ? body.skills.frameworks : [],
          databases: Array.isArray(body.skills?.databases) ? body.skills.databases : [],
          tools: Array.isArray(body.skills?.tools) ? body.skills.tools : [],
          other: Array.isArray(body.skills?.other) ? body.skills.other : [],
        },
        experience: Array.isArray(body.experience) ? body.experience : [],
        projects: Array.isArray(body.projects) ? body.projects : [],
        certifications: Array.isArray(body.certifications) ? body.certifications : [],
        achievements: Array.isArray(body.achievements) ? body.achievements : [],
        customNotes: body.customNotes?.trim() || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ profile: updated, success: true });
  } catch (err) {
    console.error("[job-assistant/profile POST] Error:", err);
    return NextResponse.json(
      { error: "Failed to save professional profile" },
      { status: 500 }
    );
  }
}
