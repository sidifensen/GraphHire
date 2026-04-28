import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Team from "@/app/mobile-enterprise/team/page";

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

  it("uses the original centered content container and button frame", () => {
    const { container } = render(<Team />);

    const main = container.querySelector("main");
    const button = screen.getByRole("button", { name: /添加新成员/ });
    const buttonContainer = button.parentElement;

    expect(main).not.toBeNull();
    expect(main?.className).toContain("max-w-[375px]");
    expect(main?.className).toContain("mx-auto");
    expect(main?.className).toContain("w-full");

    expect(buttonContainer).not.toBeNull();
    expect(buttonContainer?.className).toContain("left-0");
    expect(buttonContainer?.className).toContain("right-0");
    expect(buttonContainer?.className).toContain("px-container-margin");
  });
});
