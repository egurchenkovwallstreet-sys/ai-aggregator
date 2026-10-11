import "server-only";

import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  signSessionToken,
  verifySessionToken,
  type SessionProfile,
} from "@/lib/auth/session-token";

export type { SessionProfile };

export async function createSession(
  userId: string,
  profile: SessionProfile,
): Promise<void> {
  const token = await signSessionToken(userId, profile);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}
