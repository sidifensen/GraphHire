import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  mapEnterprisePathToMobile,
  shouldRewriteEnterpriseToMobile,
} from "@/lib/device-routing";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent") ?? "";

  if (!shouldRewriteEnterpriseToMobile(pathname, userAgent)) {
    const response = NextResponse.next();
    response.headers.set("x-graphhire-mobile-rewrite", "0");
    return response;
  }

  const rewriteUrl = request.nextUrl.clone();
  const mappedPathname = mapEnterprisePathToMobile(pathname);
  rewriteUrl.pathname = "/_mobile";

  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set("x-graphhire-mobile-rewrite", "1");
  response.headers.set("x-graphhire-mobile-target", mappedPathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
