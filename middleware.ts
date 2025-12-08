import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  // Check authentication via session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie;

  // Redirect to sign-in if not authenticated and trying to access protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");
  
  if (!isAuthenticated && !isAuthRoute && !isApiAuthRoute) {
    // Allow public routes
    const publicRoutes = ["/", "/privacy", "/terms"];
    if (!publicRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
