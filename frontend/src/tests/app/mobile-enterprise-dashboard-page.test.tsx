import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "@/app/mobile-enterprise/page";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation",
  );

  return {
    ...actual,
    usePathname: () => usePathnameMock(),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    useParams: () => ({}),
  };
});

describe("Mobile enterprise Dashboard page", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue("/mobile-enterprise");
  });

  it("uses the original centered 375 container with container spacing", () => {
    const { container } = render(<Dashboard />);
    const main = container.querySelector("main");

    expect(main).not.toBeNull();
    expect(main?.className).toContain("w-full");
    expect(main?.className).toContain("max-w-[375px]");
    expect(main?.className).toContain("mx-auto");
    expect(main?.className).toContain("px-container-margin");
  });
});
