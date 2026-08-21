import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "lms_session";

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "SUPER_ADMIN",
  "/instructor": "INSTRUCTOR",
  "/student": "STUDENT",
};

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

function dashboardPathForRole(role: string): string {
  if (role === "SUPER_ADMIN") return "/admin/dashboard";
  if (role === "INSTRUCTOR") return "/instructor/dashboard";
  if (role === "STUDENT") return "/student/dashboard";
  return "/";
}

async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; role: string; name: string; email: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  // Redirect already-authenticated users away from auth pages
  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && session) {
    return NextResponse.redirect(new URL(dashboardPathForRole(session.role), req.url));
  }

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((p) => pathname.startsWith(p));
  if (matchedPrefix) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const requiredRole = ROLE_PREFIXES[matchedPrefix];
    if (session.role !== requiredRole) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/student/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
