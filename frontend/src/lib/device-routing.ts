const MOBILE_UA_REGEX =
  /Android|iPhone|iPad|iPod|Mobile|Windows Phone|BlackBerry|Opera Mini/i;

const EXCLUDED_PREFIXES = [
  "/api",
  "/_next",
  "/admin",
  "/enterprise",
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

export function shouldRewriteToMobile(pathname: string, userAgent: string): boolean {
  if (shouldBypassMobileRewrite(pathname)) {
    return false;
  }

  return isMobileUserAgent(userAgent);
}
