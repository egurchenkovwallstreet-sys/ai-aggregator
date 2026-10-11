import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export type SessionProfile = {
  email?: string | null;
  telegramId?: number | null;
  deviceId?: string | null;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET не задан.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  userId: string,
  profile: SessionProfile,
): Promise<string> {
  const claims: Record<string, string | number> = {};
  if (profile.email) {
    claims.email = profile.email;
  }
  if (profile.telegramId != null) {
    claims.telegramId = profile.telegramId;
  }
  if (profile.deviceId) {
    claims.deviceId = profile.deviceId;
  }

  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecretKey());
}

export type VerifiedSession = {
  userId: string;
  email?: string;
  telegramId?: number;
  deviceId?: string;
};

export async function verifySessionToken(
  token: string,
): Promise<string | null> {
  const session = await verifySession(token);
  return session?.userId ?? null;
}

export async function verifySession(
  token: string,
): Promise<VerifiedSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = payload.sub;
    if (typeof userId !== "string") {
      return null;
    }

    return {
      userId,
      email: typeof payload.email === "string" ? payload.email : undefined,
      telegramId:
        typeof payload.telegramId === "number" ? payload.telegramId : undefined,
      deviceId:
        typeof payload.deviceId === "string" ? payload.deviceId : undefined,
    };
  } catch {
    return null;
  }
}

/** Вход по email или Telegram (не только device_id). */
export function isRegisteredSession(session: VerifiedSession): boolean {
  return Boolean(session.email) || session.telegramId != null;
}
