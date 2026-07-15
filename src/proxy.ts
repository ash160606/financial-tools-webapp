/**
 * Site-wide access gate. In this Next version the request-interception file is
 * `proxy` (the former `middleware` convention, renamed). It runs on the Node
 * runtime and redirects any visitor without a valid auth cookie to /login.
 *
 * This is an "optimistic" check only — the login Server Action re-validates the
 * code before setting the cookie, so this file never sees the raw code.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ENABLED, AUTH_COOKIE } from "@/config/auth";
import { expectedToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  if (!AUTH_ENABLED) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (token && token === expectedToken()) return NextResponse.next();

  return NextResponse.redirect(new URL("/login", request.url));
}

/**
 * Run on everything except: Next's build assets, the favicon, the login route
 * itself, any Open Graph image route (so link previews stay reachable), and
 * static image files.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|.*opengraph-image|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)",
  ],
};
