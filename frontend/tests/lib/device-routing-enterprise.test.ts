import { describe, expect, it } from "vitest";
import {
  mapEnterprisePathToMobile,
  shouldRewriteEnterpriseToMobile,
} from "@/lib/device-routing";

describe("enterprise mobile rewrite routing", () => {
  it("rewrites enterprise path for mobile UA", () => {
    expect(shouldRewriteEnterpriseToMobile("/enterprise/jobs", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)")).toBe(true);
  });

  it("rewrites enterprise path for mobile client hint even with desktop UA", () => {
    expect(
      shouldRewriteEnterpriseToMobile(
        "/enterprise/jobs",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "?1",
      ),
    ).toBe(true);
  });

  it("does not rewrite for desktop UA", () => {
    expect(shouldRewriteEnterpriseToMobile("/enterprise/jobs", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(false);
  });

  it("does not rewrite for non-enterprise path", () => {
    expect(shouldRewriteEnterpriseToMobile("/jobs", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)")).toBe(false);
  });

  it("maps enterprise jobs new path", () => {
    expect(mapEnterprisePathToMobile("/enterprise/jobs/new")).toBe("/jobs/create");
  });

  it("maps enterprise notifications path", () => {
    expect(mapEnterprisePathToMobile("/enterprise/notifications")).toBe("/messages");
  });

  it("falls back unknown enterprise path to mobile home", () => {
    expect(mapEnterprisePathToMobile("/enterprise/unknown")).toBe("/");
  });
});
