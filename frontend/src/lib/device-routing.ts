const MOBILE_UA_REGEX =
  /Android|iPhone|iPad|iPod|Mobile|Windows Phone|BlackBerry|Opera Mini/i;

const MOBILE_USER_INTERNAL_PREFIX = "/mobile-user";
const MOBILE_ENTERPRISE_INTERNAL_PREFIX = "/mobile-enterprise";

const EXCLUDED_PREFIXES = [
  "/api",
  "/_next",
  "/admin",
  MOBILE_USER_INTERNAL_PREFIX,
  MOBILE_ENTERPRISE_INTERNAL_PREFIX,
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

const ENTERPRISE_TO_MOBILE_ROUTE_MAPPINGS: Array<[string, string]> = [
  ["/enterprise/notifications", "/messages"],
  ["/enterprise/employees", "/team"],
  ["/enterprise/recommendations", "/recommendations"],
  ["/enterprise/jobs/new", "/jobs/create"],
  ["/enterprise/jobs", "/jobs"],
  ["/enterprise/dashboard", "/"],
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

function isMappedPath(pathname: string, mappings: Array<[string, string]>): boolean {
  const normalizedPathname = normalizePathname(pathname);
  return mappings.some(([publicPath]) => matchesRoutePrefix(normalizedPathname, publicPath));
}

function mapPublicPathToMobilePath(
  pathname: string,
  mappings: Array<[string, string]>,
  fallbackPath: string,
): string {
  const normalizedPathname = normalizePathname(pathname);

  for (const [publicPath, mobilePath] of mappings) {
    if (!matchesRoutePrefix(normalizedPathname, publicPath)) {
      continue;
    }

    if (publicPath === "/" || mobilePath === "/") {
      if (publicPath === "/" && mobilePath === "/") {
        return mobilePath;
      }

      if (mobilePath === "/") {
        const suffix = normalizedPathname.slice(publicPath.length);
        return suffix || mobilePath;
      }
    }

    const suffix = normalizedPathname.slice(publicPath.length);
    return `${mobilePath}${suffix}` || mobilePath;
  }

  return fallbackPath;
}

function mapMobilePathToPublicPath(
  pathname: string,
  internalPrefix: string,
  mappings: Array<[string, string]>,
): string {
  const normalizedPathname = normalizePathname(pathname);
  const withoutInternalPrefix = normalizedPathname.startsWith(internalPrefix)
    ? normalizedPathname.slice(internalPrefix.length) || "/"
    : normalizedPathname;

  for (const [publicPath, mobilePath] of mappings) {
    if (!matchesRoutePrefix(withoutInternalPrefix, mobilePath)) {
      continue;
    }

    if (mobilePath === "/") {
      if (publicPath === "/") {
        return publicPath;
      }

      const suffix = withoutInternalPrefix.slice(mobilePath.length);
      return `${publicPath}${suffix}` || publicPath;
    }

    const suffix = withoutInternalPrefix.slice(mobilePath.length);
    return `${publicPath}${suffix}` || publicPath;
  }

  return withoutInternalPrefix || "/";
}

function mapPublicPathToMobileInternalPath(
  pathname: string,
  internalPrefix: string,
  mappings: Array<[string, string]>,
  fallbackPath: string,
): string {
  const mappedMobilePath = mapPublicPathToMobilePath(pathname, mappings, fallbackPath);
  return mappedMobilePath === "/" ? internalPrefix : `${internalPrefix}${mappedMobilePath}`;
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
  return isMappedPath(pathname, USER_TO_MOBILE_ROUTE_MAPPINGS);
}

export function isEnterprisePath(pathname: string): boolean {
  return isMappedPath(pathname, ENTERPRISE_TO_MOBILE_ROUTE_MAPPINGS);
}

export function shouldRewriteToMobile(
  pathname: string,
  userAgent: string,
  secChUaMobile?: string | null,
): boolean {
  if (shouldBypassMobileRewrite(pathname)) {
    return false;
  }

  return (
    (isUserPath(pathname) || isEnterprisePath(pathname)) &&
    (isMobileUserAgent(userAgent) || isMobileClientHint(secChUaMobile))
  );
}

export function mapUserPathToMobilePath(pathname: string): string {
  return mapPublicPathToMobilePath(pathname, USER_TO_MOBILE_ROUTE_MAPPINGS, "/");
}

export function mapEnterprisePathToMobilePath(pathname: string): string {
  return mapPublicPathToMobilePath(pathname, ENTERPRISE_TO_MOBILE_ROUTE_MAPPINGS, "/");
}

export function mapUserPathToMobileInternalPath(pathname: string): string {
  return mapPublicPathToMobileInternalPath(
    pathname,
    MOBILE_USER_INTERNAL_PREFIX,
    USER_TO_MOBILE_ROUTE_MAPPINGS,
    "/",
  );
}

export function mapMobilePathToUserPath(pathname: string): string {
  return mapMobilePathToPublicPath(
    pathname,
    MOBILE_USER_INTERNAL_PREFIX,
    USER_TO_MOBILE_ROUTE_MAPPINGS,
  );
}

export function mapEnterprisePathToMobileInternalPath(pathname: string): string {
  return mapPublicPathToMobileInternalPath(
    pathname,
    MOBILE_ENTERPRISE_INTERNAL_PREFIX,
    ENTERPRISE_TO_MOBILE_ROUTE_MAPPINGS,
    "/",
  );
}

export function mapMobilePathToEnterprisePath(pathname: string): string {
  return mapMobilePathToPublicPath(
    pathname,
    MOBILE_ENTERPRISE_INTERNAL_PREFIX,
    ENTERPRISE_TO_MOBILE_ROUTE_MAPPINGS,
  );
}

export function isMobileInternalPath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);
  return (
    normalizedPathname.startsWith(MOBILE_USER_INTERNAL_PREFIX) ||
    normalizedPathname.startsWith(MOBILE_ENTERPRISE_INTERNAL_PREFIX)
  );
}
