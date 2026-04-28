import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileShell from "@/app/mobile-user/_components/MobileShell";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation",
  );

  return {
    ...actual,
    usePathname: () => usePathnameMock(),
  };
});

describe("MobileShell", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("shows bottom navigation on the mobile home route", () => {
    usePathnameMock.mockReturnValue("/mobile-user");
    render(
      <MobileShell>
        <div>content</div>
      </MobileShell>,
    );

    expect(screen.getByText("首页")).toBeInTheDocument();
    expect(screen.getByText("职位")).toBeInTheDocument();
    expect(screen.getByText("公司")).toBeInTheDocument();
    expect(screen.getByText("我的")).toBeInTheDocument();
  });

  it("hides bottom navigation on the mobile login route", () => {
    usePathnameMock.mockReturnValue("/mobile-user/login");
    render(
      <MobileShell>
        <div>content</div>
      </MobileShell>,
    );

    expect(screen.queryByText("首页")).toBeNull();
    expect(screen.queryByText("职位")).toBeNull();
    expect(screen.queryByText("公司")).toBeNull();
    expect(screen.queryByText("我的")).toBeNull();
  });
});
