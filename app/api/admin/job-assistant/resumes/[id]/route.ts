import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { JobAssistantResume } from "@/lib/models/jobAssistant";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  if (!hasDb() || !/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    await connectDb();
    const doc = await JobAssistantResume.findById(id).select("-data").lean();
    if (!doc) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume: doc });
  } catch (err) {
    console.error("[job-assistant/resumes/[id] GET] Error:", err);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  if (!hasDb() || !/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const update: Record<string, string> = {};
    if (typeof body.name === "string" && body.name.trim()) {
      update.name = body.name.trim().slice(0, 120);
    }
    if (typeof body.category === "string" && body.category.trim()) {
      update.category = body.category.trim().slice(0, 80);
    }
    if (typeof body.notes === "string") {
      update.notes = body.notes.trim().slice(0, 1000);
    }

    await connectDb();
    const updated = await JobAssistantResume.findByIdAndUpdate(id, update, {
      new: true,
    })
      .select("-data")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume: updated, success: true });
  } catch (err) {
    console.error("[job-assistant/resumes/[id] PATCH] Error:", err);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  if (!hasDb() || !/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    await connectDb();
    const deleted = await JobAssistantResume.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Resume deleted" });
  } catch (err) {
    console.error("[job-assistant/resumes/[id] DELETE] Error:", err);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
