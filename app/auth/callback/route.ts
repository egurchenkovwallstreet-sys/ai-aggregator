import { NextRequest, NextResponse } from "next/server";

import { sanitizeNextPath } from "@/lib/auth/safe-next-path";
import { consumeMagicLink } from "@/server/auth/magic-link.service";
import { createSession } from "@/server/auth/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=missing_token", request.url),
    );
  }

  const result = await consumeMagicLink(token);
  if (!result) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_token", request.url),
    );
  }

  await createSession(result.userId, { email: result.email });
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  return NextResponse.redirect(new URL(next ?? "/", request.url));
}
