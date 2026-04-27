import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { shouldRewriteToMobile } from "@/lib/device-routing";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent") ?? "";

  if (!shouldRewriteToMobile(pathname, userAgent)) {
    const response = NextResponse.next();
    response.headers.set("x-graphhire-mobile-rewrite", "0");
    return response;
  }

  const rewriteUrl = request.nextUrl.clone();
  const mappedPathname = mapDesktopPathToMobile(pathname);
  rewriteUrl.pathname =
    mappedPathname === "/"
      ? "/mobile-internal"
      : `/mobile-internal${mappedPathname}`;
  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set("x-graphhire-mobile-rewrite", "1");
  return response;
}

function mapDesktopPathToMobile(pathname: string): string {
  if (pathname === "/skill-graph") {
    return "/graph";
  }

  if (pathname === "/resume/manage" || pathname === "/resume/upload") {
    return "/resume";
  }

  return pathname;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
