import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  mapUserPathToMobileInternalPath,
  shouldRewriteToMobile,
} from "@/lib/device-routing";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent") ?? "";
  const secChUaMobile = request.headers.get("sec-ch-ua-mobile");

  if (!shouldRewriteToMobile(pathname, userAgent, secChUaMobile)) {
    const response = NextResponse.next();
    response.headers.set("x-graphhire-mobile-rewrite", "0");
    return response;
  }

  const rewriteUrl = request.nextUrl.clone();
  const mappedPathname = mapUserPathToMobileInternalPath(pathname);
  rewriteUrl.pathname = mappedPathname;

  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set("x-graphhire-mobile-rewrite", "1");
  response.headers.set("x-graphhire-mobile-target", mappedPathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
