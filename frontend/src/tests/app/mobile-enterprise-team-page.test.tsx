import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Team from "@/app/mobile-enterprise/pages/Team";

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

describe("Mobile enterprise Team page", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue("/mobile-enterprise/team");
  });

  it("keeps the floating add button constrained to the mobile shell width", () => {
    render(<Team />);

    const button = screen.getByRole("button", { name: /添加新成员/ });
    const container = button.parentElement;

    expect(container).not.toBeNull();
    expect(container?.className).toContain("left-1/2");
    expect(container?.className).toContain("-translate-x-1/2");
    expect(container?.className).toContain("w-full");
    expect(container?.className).toContain("max-w-[375px]");
  });
});
