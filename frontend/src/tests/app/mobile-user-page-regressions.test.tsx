import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CompanyDetailPage from "@/app/mobile-user/companies/[id]/page";
import JobDetailPage from "@/app/mobile-user/jobs/[id]/page";
import ApplicationsPage from "@/app/mobile-user/applications/page";
import CompaniesPage from "@/app/mobile-user/companies/page";
import NotificationsPage from "@/app/mobile-user/notifications/page";
import { MOCK_COMPANIES } from "@/app/mobile-user/_data/mockData";

const useParamsMock = vi.fn();

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>(
    "next/navigation",
  );

  return {
    ...actual,
    useParams: () => useParamsMock(),
    usePathname: () => "/mobile-user",
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

describe("mobile user page regressions", () => {
  it("does not fall back to other companies' jobs on a company detail page", () => {
    useParamsMock.mockReturnValue({ id: "xingyao" });

    render(<CompanyDetailPage />);

    expect(screen.getByText("星耀科技")).toBeInTheDocument();
    expect(
      screen.queryByText("高级前端研发工程师 - 抖音电商"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("算法工程师 - 机器学习方向"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("高级产品经理 - 商业化"),
    ).not.toBeInTheDocument();
  });

  it("renders the company card subtitle from the current company mock metadata", () => {
    useParamsMock.mockReturnValue({ id: "1" });
    const currentCompany = MOCK_COMPANIES.find(
      (company) => company.name === "字节跳动",
    );

    expect(currentCompany).toBeDefined();

    render(<JobDetailPage />);

    expect(
      screen.getByText(
        `${currentCompany!.stage} · ${currentCompany!.size} · ${currentCompany!.industry}`,
      ),
    ).toBeInTheDocument();
  });

  it("keeps the applications page on theme surfaces instead of bg-white", () => {
    const { container } = render(<ApplicationsPage />);

    expect(container.querySelector(".bg-white")).toBeNull();
  });

  it("keeps the companies page on theme surfaces instead of bg-white", () => {
    const { container } = render(<CompaniesPage />);

    expect(container.querySelector(".bg-white")).toBeNull();
  });

  it("keeps the notifications page on theme surfaces instead of bg-white", () => {
    const { container } = render(<NotificationsPage />);

    expect(container.querySelector(".bg-white")).toBeNull();
  });
});
