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

describe("mobile-enterprise app structure", () => {
  it("does not import from legacy forwarding directories inside app/mobile-enterprise", () => {
    const root = path.join(process.cwd(), "src", "app", "mobile-enterprise");
    const offenders = walkFiles(root)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
      .filter((file) =>
        [
          "./pages/",
          ".\\pages\\",
          "../pages/",
          "..\\pages\\",
          "./components/",
          ".\\components\\",
          "../components/",
          "..\\components\\",
          "./lib/",
          ".\\lib\\",
          "../lib/",
          "..\\lib\\",
        ].some((pattern) =>
          fs.readFileSync(file, "utf8").includes(pattern),
        ),
      )
      .map((file) => path.relative(process.cwd(), file).replaceAll("\\", "/"));

    expect(offenders).toEqual([]);
  });

  it("removes the temporary pages directory", () => {
    const pagesDir = path.join(process.cwd(), "src", "app", "mobile-enterprise", "pages");
    expect(fs.existsSync(pagesDir)).toBe(false);
  });

  it("removes the temporary components directory", () => {
    const componentsDir = path.join(process.cwd(), "src", "app", "mobile-enterprise", "components");
    expect(fs.existsSync(componentsDir)).toBe(false);
  });

  it("removes the temporary lib directory", () => {
    const libDir = path.join(process.cwd(), "src", "app", "mobile-enterprise", "lib");
    expect(fs.existsSync(libDir)).toBe(false);
  });
});
