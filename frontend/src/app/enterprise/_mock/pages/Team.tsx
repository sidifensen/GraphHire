import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "../lib/utils";

const EMPLOYEES = [
  {
    id: "e1",
    name: "陈建国",
    title: "高级产品经理 · 产品部",
    role: "管理员",
    status: "正常",
    lastLogin: "2小时前",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgsQ4xxAKfAG9rJ3wsoQaVzJF-keDBQleQQdRSMjeW5ob7e65qZmrdh1mZRNcl6tD2fSvUM9rfrAf6W3ehtccYTJ_cTKJRuYZm4g4v1JLDDLKDJBEi-YdE8V6volWAa8oLLEGJSWRNiTjUY8dRCiXrCnyArvvkNfa1437tvLd4L0trM-298LbZIgQfIe-xqaFrG8Lb4UvyZDfjT1eRJ89La4tMpKrr_8JgorjWIeA-t0npxnXVqSqsSjSVD6JWHMedDSGMUQ4HuiYw"
  },
  {
    id: "e2",
    name: "王小凡",
    title: "UI设计师 · 设计部",
    status: "正常",
    lastLogin: "昨天",
    initials: "W"
  },
  {
    id: "e3",
    name: "李思思",
    title: "前端工程师 · 技术部",
    status: "已禁用",
    lastLogin: "2周前",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDr6VNv6ebYsLSL4xZJbyqchjQ5rx3Phq_r4HPrTRfFtTIA9Cxj6LRwJr0tO9JvxAgn4R-f2pHj4iowOWSnGqguWVmPGOmUFoy46UJNj2CInjtNpyBtTzKdGGnZCE3cENE4xndtuYVzv_8Lgtx8jz8uVajt0e8b-jWLOwEpEpQ1hgDt0DvUZDVBTNHoM-weSz030osBwznCgcEG-YVZ-oaIrktx7ygwC_WKfn6NWyIr5wq1g4JkXBEB6dR6BROtB6mapxId5lVgJQju"
  }
];

export default function Team() {
  const [search, setSearch] = useState("");

  const filtered = EMPLOYEES.filter(emp => emp.name.includes(search) || emp.title.includes(search));

  return (
    <div className="bg-surface text-on-surface antialiased pb-[140px] md:pb-8 flex flex-col h-full">
      
      <main className="w-full max-w-7xl mx-auto flex-1 overflow-y-auto px-container-margin md:px-8 py-stack-gap-md flex flex-col gap-stack-gap-lg pb-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-end border-b border-surface-variant pb-4 sticky top-0 bg-surface z-10 pt-8">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">团队管理</h1>
          <button className="bg-primary text-on-primary h-10 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span className="font-label-md text-label-md font-semibold">添加新成员</span>
          </button>
        </div>

        {/* Mobile Title */}
        <h1 className="text-headline-lg font-headline-lg text-on-surface md:hidden">团队管理</h1>

        <div className="flex flex-col md:flex-row gap-stack-gap-lg items-start">
          {/* Main Content (Left on Desktop) */}
          <div className="flex-1 w-full flex flex-col gap-stack-gap-lg">
            {/* Employee List Section */}
            <section className="flex flex-col gap-stack-gap-sm">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-headline-sm font-headline-sm text-on-surface">员工列表</h2>
                <div className="relative w-48 md:w-64">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
                  <input 
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-body-md font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant shadow-sm" 
                    placeholder="搜索姓名/职位" 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-gap-sm">
                {filtered.map(emp => (
                  <div key={emp.id} className={cn("bg-surface-container-lowest border border-outline-variant rounded-lg p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm hover:shadow-md transition-shadow", emp.status === '已禁用' && "opacity-70 grayscale-[30%]")}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-stack-gap-sm max-w-[85%]">
                        {emp.avatar ? (
                            <img src={emp.avatar} alt={emp.name} className="w-12 h-12 rounded-full object-cover border border-outline-variant shrink-0" />
                        ) : (
                            <div className="w-12 h-12 shrink-0 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-headline-lg font-headline-lg border border-outline-variant">{emp.initials}</div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-body-lg font-body-lg font-semibold text-on-surface truncate">{emp.name}</h3>
                            {emp.role && <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">{emp.role}</span>}
                          </div>
                          <p className="text-label-md font-label-md text-on-surface-variant truncate">{emp.title}</p>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-full transition-colors shrink-0">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-label-md font-label-md text-on-surface-variant mt-1">
                      {emp.status === '正常' ? (
                         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 正常</span>
                      ) : (
                         <span className="flex items-center gap-1 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-outline-variant"></span> 已禁用</span>
                      )}
                      <span>最后登录: {emp.lastLogin}</span>
                    </div>
                    <div className="flex gap-stack-gap-sm pt-3 mt-1 border-t border-surface-variant">
                      <button className="flex-1 h-8 border border-outline-variant text-on-surface-variant rounded flex items-center justify-center text-label-md font-label-md hover:bg-surface-container-low transition-colors">重置密码</button>
                      {emp.status === '正常' ? (
                        <button className="flex-1 h-8 border border-outline-variant text-error rounded flex items-center justify-center text-label-md font-label-md hover:bg-error-container transition-colors">禁用</button>
                      ) : (
                         <button className="flex-1 h-8 border border-primary text-primary rounded flex items-center justify-center text-label-md font-label-md hover:bg-primary/10 transition-colors">启用</button>
                      )}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-10 col-span-full text-on-surface-variant font-body-md flex flex-col items-center">
                      <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">group_off</span>
                      暂无相关员工
                    </div>
                )}
              </div>
              {filtered.length > 0 && <button className="w-full py-3 mt-2 text-label-md font-label-md text-primary font-medium hover:bg-surface-container-low rounded border-dashed border transition-colors border-transparent hover:border-primary/30">加载更多员工</button>}
            </section>
          </div>

          {/* Sidebar (Right on Desktop) */}
          <div className="w-full md:w-80 flex flex-col gap-stack-gap-lg shrink-0">
            {/* Stats Bento Grid */}
            <section className="grid grid-cols-2 gap-stack-gap-sm">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-sm flex flex-col gap-stack-gap-xs hover:shadow-md transition-shadow">
                <span className="text-label-md font-label-md text-on-surface-variant">企业总人数</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-headline-lg font-headline-lg text-primary">124</span>
                  <span className="text-label-md font-label-md text-on-surface-variant">人</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-inline-padding-md shadow-sm flex flex-col gap-stack-gap-xs hover:shadow-md transition-shadow">
                <span className="text-label-md font-label-md text-on-surface-variant">管理员数</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-headline-lg font-headline-lg text-primary">8</span>
                  <span className="text-label-md font-label-md text-on-surface-variant">人</span>
                </div>
              </div>
            </section>

            {/* Pending Approvals Section */}
            <section className="flex flex-col gap-stack-gap-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-headline-sm font-headline-sm text-on-surface">
                  待审批加入 <span className="bg-error text-on-error text-[10px] px-1.5 py-0.5 rounded-full ml-1 align-middle">2</span>
                </h2>
              </div>
              <div className="flex flex-col gap-stack-gap-sm">
                {/* Approval Card 1 */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-stack-gap-sm">
                    <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-sm text-headline-sm">张</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-md font-body-md font-semibold text-on-surface truncate">张明远</h3>
                      <p className="text-label-md font-label-md text-on-surface-variant truncate">申请部门：技术部</p>
                    </div>
                    <span className="text-label-sm font-label-sm text-on-surface-variant flex-shrink-0">10分钟前</span>
                  </div>
                  <div className="flex gap-stack-gap-sm pt-2 border-t border-surface-variant">
                    <button className="flex-1 h-9 border border-outline-variant text-on-surface rounded flex items-center justify-center text-body-md font-body-md hover:bg-surface-container-low transition-colors">拒绝</button>
                    <button className="flex-1 h-9 bg-primary text-on-primary rounded flex items-center justify-center text-body-md font-body-md hover:opacity-90 transition-opacity shadow-sm">通过</button>
                  </div>
                </div>
                {/* Approval Card 2 */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-inline-padding-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-stack-gap-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-stack-gap-sm">
                    <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-headline-sm text-headline-sm">L</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-md font-body-md font-semibold text-on-surface truncate">Liya Chen</h3>
                      <p className="text-label-md font-label-md text-on-surface-variant truncate">申请部门：设计部</p>
                    </div>
                    <span className="text-label-sm font-label-sm text-on-surface-variant flex-shrink-0">2小时前</span>
                  </div>
                  <div className="flex gap-stack-gap-sm pt-2 border-t border-surface-variant">
                    <button className="flex-1 h-9 border border-outline-variant text-on-surface rounded flex items-center justify-center text-body-md font-body-md hover:bg-surface-container-low transition-colors">拒绝</button>
                    <button className="flex-1 h-9 bg-primary text-on-primary rounded flex items-center justify-center text-body-md font-body-md hover:opacity-90 transition-opacity shadow-sm">通过</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Add Button (Mobile) */}
      <div className="fixed bottom-[80px] left-0 right-0 px-container-margin md:hidden z-30">
        <button className="w-full h-12 bg-primary text-on-primary rounded-lg shadow-[0_4px_12px_rgba(0,102,255,0.2)] flex items-center justify-center text-body-lg font-body-lg font-semibold active:opacity-80 transition-opacity">
          <span className="material-symbols-outlined mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>add</span> 添加新成员
        </button>
      </div>

    </div>
  );
}
