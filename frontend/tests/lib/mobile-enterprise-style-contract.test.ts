import fs from "node:fs";
import path from "node:path";
import tailwindConfig from "../../tailwind.config";
import { describe, expect, it } from "vitest";

type TailwindColors = Record<string, string>;

describe("mobile enterprise style contract", () => {
  it("exposes the prototype secondary-container token in tailwind config", () => {
    const colors =
      ((tailwindConfig.theme as { extend?: { colors?: TailwindColors } })
        ?.extend?.colors as TailwindColors | undefined) ?? {};

    expect(colors["secondary-container"]).toBe("var(--color-secondary-container)");
  });

  it("does not hard-code material symbols font-size in globals.css", () => {
    const globals = fs.readFileSync(
      path.join(process.cwd(), "src", "styles", "globals.css"),
      "utf8",
    );

    expect(globals).not.toContain("font-size: 1em;");
    expect(globals).toContain("font-size: 24px;");
    expect(globals).toContain("'opsz' 24");
  });
});
