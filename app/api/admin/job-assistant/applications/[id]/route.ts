import { NextResponse } from "next/server";
import { guard } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { JobApplication } from "@/lib/models/jobAssistant";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await params;
  if (!hasDb() || !/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  try {
    await connectDb();
    const doc = await JobApplication.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application: doc });
  } catch (err) {
    console.error("[job-assistant/applications/[id] GET] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
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
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Safe field whitelisting
    const update: Record<string, unknown> = {};
    const allowedFields = [
      "status",
      "notes",
      "subject",
      "body",
      "recipientEmail",
      "recipientName",
      "companyName",
      "jobTitle",
      "applicationType",
      "roleCategory",
      "customRole",
      "jobDescription",
      "emailStyle",
    ];

    for (const key of allowedFields) {
      if (key in body) {
        update[key] = body[key];
      }
    }

    await connectDb();
    const updated = await JobApplication.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ application: updated, success: true });
  } catch (err) {
    console.error("[job-assistant/applications/[id] PATCH] Error:", err);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
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
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  try {
    await connectDb();
    const deleted = await JobApplication.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Application deleted" });
  } catch (err) {
    console.error("[job-assistant/applications/[id] DELETE] Error:", err);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
