import {
  isMobileClientHint,
  isMobileInternalPath,
  isMobileUserAgent,
  isUserPath,
  mapMobilePathToUserPath,
  mapUserPathToMobileInternalPath,
  mapUserPathToMobilePath,
  shouldBypassMobileRewrite,
  shouldRewriteToMobile,
} from "@/lib/device-routing";

describe("device-routing", () => {
  it("detects mobile user agents", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe(true);
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ),
    ).toBe(false);
  });

  it("detects mobile client hints", () => {
    expect(isMobileClientHint("?1")).toBe(true);
    expect(isMobileClientHint("?0")).toBe(false);
    expect(isMobileClientHint(null)).toBe(false);
  });

  it("detects user paths across the whole user app", () => {
    expect(isUserPath("/")).toBe(true);
    expect(isUserPath("/jobs/12")).toBe(true);
    expect(isUserPath("/companies/9")).toBe(true);
    expect(isUserPath("/resume/manage")).toBe(true);
    expect(isUserPath("/skill-graph")).toBe(true);
    expect(isUserPath("/enterprise/jobs")).toBe(false);
    expect(isUserPath("/admin/dashboard")).toBe(false);
  });

  it("bypasses excluded prefixes", () => {
    expect(shouldBypassMobileRewrite("/admin/dashboard")).toBe(true);
    expect(shouldBypassMobileRewrite("/mobile-user/jobs")).toBe(true);
    expect(shouldBypassMobileRewrite("/api/health")).toBe(true);
    expect(shouldBypassMobileRewrite("/jobs")).toBe(false);
  });

  it("rewrites only mobile requests on user routes", () => {
    const mobileUa =
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/121.0 Mobile";
    const desktopUa =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 Chrome/124.0";

    expect(shouldRewriteToMobile("/jobs", mobileUa)).toBe(true);
    expect(shouldRewriteToMobile("/skill-graph", mobileUa)).toBe(true);
    expect(shouldRewriteToMobile("/jobs", desktopUa)).toBe(false);
    expect(shouldRewriteToMobile("/jobs", desktopUa, "?1")).toBe(true);
    expect(shouldRewriteToMobile("/enterprise/jobs", mobileUa)).toBe(false);
    expect(shouldRewriteToMobile("/admin/users", mobileUa)).toBe(false);
  });

  it("maps user routes into mobile implementation routes", () => {
    expect(mapUserPathToMobilePath("/")).toBe("/");
    expect(mapUserPathToMobilePath("/jobs")).toBe("/jobs");
    expect(mapUserPathToMobilePath("/jobs/12")).toBe("/jobs/12");
    expect(mapUserPathToMobilePath("/companies/9")).toBe("/companies/9");
    expect(mapUserPathToMobilePath("/resume/manage")).toBe("/resume");
    expect(mapUserPathToMobilePath("/resume/upload")).toBe("/resume");
    expect(mapUserPathToMobilePath("/skill-graph")).toBe("/graph");
  });

  it("maps user routes into hidden mobile internal routes", () => {
    expect(mapUserPathToMobileInternalPath("/")).toBe("/mobile-user");
    expect(mapUserPathToMobileInternalPath("/jobs/12")).toBe("/mobile-user/jobs/12");
    expect(mapUserPathToMobileInternalPath("/resume/manage")).toBe("/mobile-user/resume");
    expect(mapUserPathToMobileInternalPath("/skill-graph")).toBe("/mobile-user/graph");
  });

  it("maps internal mobile routes back to public user routes", () => {
    expect(mapMobilePathToUserPath("/mobile-user")).toBe("/");
    expect(mapMobilePathToUserPath("/mobile-user/jobs/12")).toBe("/jobs/12");
    expect(mapMobilePathToUserPath("/mobile-user/companies/9")).toBe("/companies/9");
    expect(mapMobilePathToUserPath("/mobile-user/resume")).toBe("/resume/manage");
    expect(mapMobilePathToUserPath("/mobile-user/graph")).toBe("/skill-graph");
  });

  it("recognizes internal mobile implementation paths", () => {
    expect(isMobileInternalPath("/mobile-user")).toBe(true);
    expect(isMobileInternalPath("/mobile-user/jobs")).toBe(true);
    expect(isMobileInternalPath("/jobs")).toBe(false);
  });
});
