import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileEnterpriseShell from "@/app/mobile-enterprise/_components/MobileEnterpriseShell";
import { Link, NavLink, useLocation } from "@/app/mobile-enterprise/_lib/router";

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
    useParams: () => ({ id: "1" }),
  };
});

describe("MobileEnterpriseShell", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("shows bottom navigation on the mobile enterprise home route", () => {
    usePathnameMock.mockReturnValue("/mobile-enterprise");
    const { container } = render(
      <MobileEnterpriseShell>
        <div>content</div>
      </MobileEnterpriseShell>,
    );

    expect(screen.getByText("工作台")).toBeInTheDocument();
    expect(screen.getByText("职位")).toBeInTheDocument();
    expect(screen.getByText("推荐")).toBeInTheDocument();
    expect(screen.getByText("团队")).toBeInTheDocument();
    const nav = container.querySelector("nav");
    expect(nav?.className).toContain("max-w-[375px]");
    expect(nav?.className).toContain("mx-auto");
  });

  it("hides bottom navigation on enterprise create route", () => {
    usePathnameMock.mockReturnValue("/mobile-enterprise/jobs/create");
    render(
      <MobileEnterpriseShell>
        <div>content</div>
      </MobileEnterpriseShell>,
    );

    expect(screen.queryByText("工作台")).toBeNull();
    expect(screen.queryByText("职位")).toBeNull();
    expect(screen.queryByText("推荐")).toBeNull();
    expect(screen.queryByText("团队")).toBeNull();
  });

  it("uses a full-width mobile shell without the centered 375px frame", () => {
    usePathnameMock.mockReturnValue("/mobile-enterprise");
    const { container } = render(
      <MobileEnterpriseShell>
        <div>content</div>
      </MobileEnterpriseShell>,
    );

    const shellRoot = container.firstElementChild;
    const shellBody = shellRoot?.firstElementChild;

    expect(shellRoot?.className).not.toContain("bg-surface-dim");
    expect(shellBody?.className).not.toContain("max-w-[375px]");
    expect(shellBody?.className).toContain("w-full");
  });
});

describe("mobile enterprise router adapter", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("restores internal paths to public enterprise hrefs", () => {
    usePathnameMock.mockReturnValue("/mobile-enterprise/team");
    render(
      <div>
        <Link to="/mobile-enterprise/team">团队</Link>
        <NavLink to="/mobile-enterprise/team">
          {({ isActive }) => (isActive ? "当前团队" : "团队")}
        </NavLink>
      </div>,
    );

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/enterprise/employees");
    expect(links[1]).toHaveAttribute("href", "/enterprise/employees");
    expect(screen.getByText("当前团队")).toBeInTheDocument();
  });

  it("returns the public enterprise pathname from useLocation", () => {
    usePathnameMock.mockReturnValue("/mobile-enterprise/messages");

    function Probe() {
      const location = useLocation();
      return <span>{location.pathname}</span>;
    }

    render(<Probe />);
    expect(screen.getByText("/enterprise/notifications")).toBeInTheDocument();
  });
});
