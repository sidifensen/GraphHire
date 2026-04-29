import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileShell from "@/app/mobile-user/_components/MobileShell";
import Profile from "@/app/mobile-user/profile/page";

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

describe("Mobile user profile shell contract", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue("/mobile-user/profile");
  });

  it("shows the current profile settings entries on the profile page", () => {
    render(<Profile />);

    expect(screen.getByText("个人资料")).toBeInTheDocument();
    expect(screen.getByText("简历管理")).toBeInTheDocument();
    expect(screen.getByText("账号设置")).toBeInTheDocument();
    expect(screen.queryByText("夜间模式")).toBeNull();
  });

  it("keeps the mobile shell container classes stable on the profile route", () => {
    const { container } = render(
      <MobileShell>
        <Profile />
      </MobileShell>,
    );

    const shellRoot = container.firstElementChild;
    expect(shellRoot).not.toBeNull();
    expect(shellRoot).toHaveClass("mobile-ui");
    expect(shellRoot).toHaveClass("min-h-screen");
  });
});
