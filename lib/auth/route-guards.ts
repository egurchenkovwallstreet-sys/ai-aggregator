const PUBLIC_EXACT = new Set(["/", "/login"]);

const PUBLIC_PREFIXES = ["/auth/", "/api/auth/"];

/** Страницы и API только для входа по email/Telegram (не device_id). */
const PROTECTED_PREFIXES = [
  "/profile",
  "/wallet",
  "/history",
  "/projects",
];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) {
    return true;
  }
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
