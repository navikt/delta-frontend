import { NextRequest, NextResponse } from "next/server";

const UNPROTECTED_PREFIXES = ["/internal", "/oauth2", "/_next"];

/**
 * Centralized auth guard. In production, Wonderwall (NAIS OAuth proxy) validates
 * the JWT before requests reach this app, so we only need to verify the header exists.
 * This replaces the checkToken() calls that were duplicated across every page.
 */
export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (UNPROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    const loginUrl = new URL("/oauth2/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
