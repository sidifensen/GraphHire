import {
  isMobileUserAgent,
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

  it("bypasses excluded prefixes", () => {
    expect(shouldBypassMobileRewrite("/admin/dashboard")).toBe(true);
    expect(shouldBypassMobileRewrite("/_mobile/jobs")).toBe(true);
    expect(shouldBypassMobileRewrite("/api/health")).toBe(true);
    expect(shouldBypassMobileRewrite("/enterprise/jobs")).toBe(false);
  });

  it("rewrites only mobile requests on enterprise routes", () => {
    const mobileUa =
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/121.0 Mobile";
    const desktopUa =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 Chrome/124.0";

    expect(shouldRewriteToMobile("/enterprise/jobs", mobileUa)).toBe(true);
    expect(shouldRewriteToMobile("/enterprise/jobs", desktopUa)).toBe(false);
    expect(shouldRewriteToMobile("/jobs", mobileUa)).toBe(false);
    expect(shouldRewriteToMobile("/admin/users", mobileUa)).toBe(false);
  });
});
