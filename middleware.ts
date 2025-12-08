import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Better-Auth handles its own middleware through the API routes
// We don't need custom middleware for basic auth flows
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
