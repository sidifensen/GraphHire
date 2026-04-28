import fs from "node:fs";
import path from "node:path";

function walkFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return fullPath;
  });
}

describe("mobile-user app structure", () => {
  it("does not import from legacy forwarding directories inside app/mobile-user", () => {
    const root = path.join(process.cwd(), "src", "app", "mobile-user");
    const offenders = walkFiles(root)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
      .filter((file) =>
        ["mobile-user-page", "/_pages/", "\\_pages\\"].some((pattern) =>
          fs.readFileSync(file, "utf8").includes(pattern),
        ),
      )
      .map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/"));

    expect(offenders).toEqual([]);
  });

  it("removes the legacy mobile-user-page directory", () => {
    const legacyDir = path.join(process.cwd(), "src", "mobile-user-page");
    expect(fs.existsSync(legacyDir)).toBe(false);
  });

  it("removes the temporary _pages directory", () => {
    const pagesDir = path.join(process.cwd(), "src", "app", "mobile-user", "_pages");
    expect(fs.existsSync(pagesDir)).toBe(false);
  });
});
