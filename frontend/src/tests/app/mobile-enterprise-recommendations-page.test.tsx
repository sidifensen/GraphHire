import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Recommendations from "@/app/mobile-enterprise/recommendations/page";

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

describe("Mobile enterprise recommendations page", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue("/mobile-enterprise/recommendations");
  });

  it("links candidate detail actions to mobile-enterprise candidate routes", () => {
    render(<Recommendations />);

    const detailLinks = screen.getAllByRole("link", { name: "详情" });
    expect(detailLinks[0]).toHaveAttribute("href", "/mobile-enterprise/candidate/c1");
    expect(detailLinks[1]).toHaveAttribute("href", "/mobile-enterprise/candidate/c2");
  });
});
