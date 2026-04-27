const MOBILE_UA_REGEX =
  /Android|iPhone|iPad|iPod|Mobile|Windows Phone|BlackBerry|Opera Mini/i;

const MOBILE_INTERNAL_PREFIX = "/mobile-internal";

const EXCLUDED_PREFIXES = [
  "/api",
  "/_next",
  "/admin",
  MOBILE_INTERNAL_PREFIX,
  "/favicon",
  "/sitemap",
  "/robots",
];

const USER_TO_MOBILE_ROUTE_MAPPINGS: Array<[string, string]> = [
  ["/skill-graph", "/graph"],
  ["/resume/manage", "/resume"],
  ["/resume/upload", "/resume"],
  ["/applications", "/applications"],
  ["/notifications", "/notifications"],
  ["/companies", "/companies"],
  ["/jobs", "/jobs"],
  ["/profile", "/profile"],
  ["/login", "/login"],
  ["/register", "/register"],
  ["/", "/"],
];

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function matchesRoutePrefix(pathname: string, routePrefix: string): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function isMobileUserAgent(userAgent: string): boolean {
  return MOBILE_UA_REGEX.test(userAgent);
}

export function isMobileClientHint(secChUaMobile: string | null | undefined): boolean {
  return secChUaMobile?.trim() === "?1";
}

export function shouldBypassMobileRewrite(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);
  return EXCLUDED_PREFIXES.some((prefix) => normalizedPathname.startsWith(prefix));
}

export function isUserPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);
  return USER_TO_MOBILE_ROUTE_MAPPINGS.some(([userPath]) =>
    matchesRoutePrefix(normalizedPathname, userPath),
  );
}

export function shouldRewriteToMobile(
  pathname: string,
  userAgent: string,
  secChUaMobile?: string | null,
): boolean {
  if (shouldBypassMobileRewrite(pathname)) {
    return false;
  }

  return isUserPath(pathname) && (isMobileUserAgent(userAgent) || isMobileClientHint(secChUaMobile));
}

export function mapUserPathToMobilePath(pathname: string): string {
  const normalizedPathname = normalizePathname(pathname);

  for (const [userPath, mobilePath] of USER_TO_MOBILE_ROUTE_MAPPINGS) {
    if (!matchesRoutePrefix(normalizedPathname, userPath)) {
      continue;
    }

    if (userPath === "/") {
      return mobilePath;
    }

    const suffix = normalizedPathname.slice(userPath.length);
    return `${mobilePath}${suffix}` || mobilePath;
  }

  return "/";
}

export function mapUserPathToMobileInternalPath(pathname: string): string {
  const mappedMobilePath = mapUserPathToMobilePath(pathname);
  return mappedMobilePath === "/"
    ? MOBILE_INTERNAL_PREFIX
    : `${MOBILE_INTERNAL_PREFIX}${mappedMobilePath}`;
}

export function mapMobilePathToUserPath(pathname: string): string {
  const normalizedPathname = normalizePathname(pathname);
  const withoutInternalPrefix = normalizedPathname.startsWith(MOBILE_INTERNAL_PREFIX)
    ? normalizedPathname.slice(MOBILE_INTERNAL_PREFIX.length) || "/"
    : normalizedPathname;

  for (const [userPath, mobilePath] of USER_TO_MOBILE_ROUTE_MAPPINGS) {
    if (!matchesRoutePrefix(withoutInternalPrefix, mobilePath)) {
      continue;
    }

    if (mobilePath === "/") {
      return userPath;
    }

    const suffix = withoutInternalPrefix.slice(mobilePath.length);
    return `${userPath}${suffix}` || userPath;
  }

  return withoutInternalPrefix || "/";
}

export function isMobileInternalPath(pathname: string): boolean {
  return normalizePathname(pathname).startsWith(MOBILE_INTERNAL_PREFIX);
}
