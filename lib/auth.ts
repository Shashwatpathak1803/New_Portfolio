import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE = "admin_token";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET missing or too short (use 32+ random chars)");
  return new TextEncoder().encode(s);
}

export async function signToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as { email: string };
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export async function getSession() {
  try {
    return await verifyToken((await cookies()).get(COOKIE)?.value);
  } catch {
    return null;
  }
}

/** Use at the top of every admin API handler. Returns a 401 response, or null when OK. */
export async function guard() {
  return (await getSession()) ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// --- tiny in-memory rate limiter (per server instance) ----------------------
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  h.n += 1;
  return h.n <= max;
}
export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
