const MOBILE_UA_REGEX =
  /Android|iPhone|iPad|iPod|Mobile|Windows Phone|BlackBerry|Opera Mini/i;

const EXCLUDED_PREFIXES = [
  "/api",
  "/_next",
  "/admin",
  "/mobile-enterprise-internal",
  "/mobile-internal",
  "/favicon",
  "/sitemap",
  "/robots",
];

export function isMobileUserAgent(userAgent: string): boolean {
  return MOBILE_UA_REGEX.test(userAgent);
}

export function shouldBypassMobileRewrite(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isEnterprisePath(pathname: string): boolean {
  return pathname === "/enterprise" || pathname.startsWith("/enterprise/");
}

export function shouldRewriteEnterpriseToMobile(
  pathname: string,
  userAgent: string,
): boolean {
  if (shouldBypassMobileRewrite(pathname)) {
    return false;
  }

  if (!isEnterprisePath(pathname)) {
    return false;
  }

  return isMobileUserAgent(userAgent);
}

export function mapEnterprisePathToMobile(pathname: string): string {
  if (pathname === "/enterprise" || pathname === "/enterprise/" || pathname === "/enterprise/dashboard") {
    return "/";
  }

  if (pathname === "/enterprise/jobs") {
    return "/jobs";
  }

  if (pathname === "/enterprise/jobs/new") {
    return "/jobs/create";
  }

  if (pathname.startsWith("/enterprise/jobs/")) {
    const suffix = pathname.slice("/enterprise".length);
    return suffix;
  }

  if (pathname === "/enterprise/recommendations") {
    return "/recommendations";
  }

  if (pathname === "/enterprise/employees") {
    return "/team";
  }

  if (pathname === "/enterprise/notifications") {
    return "/messages";
  }

  return "/";
}

export function shouldRewriteToMobile(pathname: string, userAgent: string): boolean {
  return shouldRewriteEnterpriseToMobile(pathname, userAgent);
}

