/** Разрешает только относительные пути приложения (защита от open redirect). */
export function sanitizeNextPath(
  next: string | null | undefined,
): string | null {
  if (!next) {
    return null;
  }
  const value = next.trim();
  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  if (value.startsWith("/login") || value.startsWith("/auth/")) {
    return null;
  }
  return value;
}
