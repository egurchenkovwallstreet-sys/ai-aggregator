export const DEVICE_COOKIE = "device_id";

/** Срок жизни идентификатора устройства — 1 год. */
export const DEVICE_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;

const DEVICE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidDeviceId(value: string): boolean {
  return DEVICE_ID_PATTERN.test(value);
}

export function createDeviceId(): string {
  return crypto.randomUUID();
}

export function getDeviceCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE_SEC,
  };
}
