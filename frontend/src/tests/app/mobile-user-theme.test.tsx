import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileShell from "@/app/mobile-user/_components/MobileShell";
import { ThemeProvider } from "@/app/mobile-user/_context/ThemeContext";
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

describe("Mobile user profile theme contract", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue("/mobile-user/profile");
  });

  it("shows the night mode label and toggle button on the profile page", () => {
    render(
      <ThemeProvider>
        <Profile />
      </ThemeProvider>,
    );

    expect(screen.getByText("夜间模式")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /夜间模式|切换主题|切换夜间模式/,
      }),
    ).toBeInTheDocument();
  });

  it("toggles the mobile shell root theme classes between light and dark", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ThemeProvider>
        <MobileShell>
          <Profile />
        </MobileShell>
      </ThemeProvider>,
    );

    const shellRoot = container.firstElementChild;
    expect(shellRoot).not.toBeNull();
    expect(shellRoot).toHaveClass("light");
    expect(shellRoot).not.toHaveClass("dark");

    const toggleButton = screen.getByRole("button", {
      name: /夜间模式|切换主题|切换夜间模式/,
    });

    await user.click(toggleButton);

    expect(shellRoot).toHaveClass("dark");
    expect(shellRoot).not.toHaveClass("light");

    await user.click(toggleButton);

    expect(shellRoot).toHaveClass("light");
    expect(shellRoot).not.toHaveClass("dark");
  });
});
