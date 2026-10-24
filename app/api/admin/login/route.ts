import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "crypto";
import { COOKIE, clientIp, cookieOptions, rateLimit, signToken } from "@/lib/auth";
import { connectDb, hasDb } from "@/lib/db";
import { AdminUser } from "@/lib/models";

const sha = (s: string) => createHash("sha256").update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 6, 15 * 60 * 1000))
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });

  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envEmail || !envPass || !process.env.AUTH_SECRET)
    return NextResponse.json({ error: "Set ADMIN_EMAIL, ADMIN_PASSWORD and AUTH_SECRET in .env.local" }, { status: 500 });

  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const e = String(email).trim().toLowerCase();
  const fail = () => NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  if (!same(e, envEmail)) {
    await new Promise((r) => setTimeout(r, 400));
    return fail();
  }

  let ok = false;
  if (hasDb()) {
    try {
      await connectDb();
      const user = await AdminUser.findOne({ email: envEmail });
      if (user) ok = await bcrypt.compare(String(password), user.passwordHash as string);
      else if (same(String(password), envPass)) {
        ok = true;
        await AdminUser.create({ email: envEmail, passwordHash: await bcrypt.hash(envPass, 12) });
      }
    } catch {
      return NextResponse.json({ error: "Database unreachable" }, { status: 503 });
    }
  } else ok = same(String(password), envPass);

  if (!ok) {
    await new Promise((r) => setTimeout(r, 400));
    return fail();
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await signToken(envEmail), cookieOptions);
  return res;
}
