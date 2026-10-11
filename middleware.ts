import { NextRequest, NextResponse } from "next/server";

import {
  createDeviceId,
  DEVICE_COOKIE,
  getDeviceCookieOptions,
  isValidDeviceId,
} from "@/lib/auth/device-cookie";
import { isProtectedPath, isPublicPath } from "@/lib/auth/route-guards";
import { sanitizeNextPath } from "@/lib/auth/safe-next-path";
import {
  isRegisteredSession,
  SESSION_COOKIE,
  verifySession,
} from "@/lib/auth/session-token";

function withDeviceCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const existing = request.cookies.get(DEVICE_COOKIE)?.value;
  if (existing && isValidDeviceId(existing)) {
    return response;
  }

  response.cookies.set(
    DEVICE_COOKIE,
    createDeviceId(),
    getDeviceCookieOptions(),
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === "/login") {
      const token = request.cookies.get(SESSION_COOKIE)?.value;
      const session = token ? await verifySession(token) : null;
      if (session && isRegisteredSession(session)) {
        const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
        return withDeviceCookie(
          request,
          NextResponse.redirect(new URL(next ?? "/", request.url)),
        );
      }
    }
    return withDeviceCookie(request, NextResponse.next());
  }

  if (!isProtectedPath(pathname)) {
    return withDeviceCookie(request, NextResponse.next());
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || !isRegisteredSession(session)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withDeviceCookie(request, NextResponse.redirect(loginUrl));
  }

  return withDeviceCookie(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
