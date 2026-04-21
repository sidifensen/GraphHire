'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="dashboard" />

      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-8 pb-16 bg-surface">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            <div>
              <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">数据总览</h1>
              <p className="text-on-surface-variant font-body">系统运行状态与核心业务指标监控。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 flex flex-col gap-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">用户总数</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">group</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">12,480</div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>+4.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">企业总数</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">domain</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">856</div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>+1.8%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">简历总数</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">description</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">45,210</div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-secondary">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>+8.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]" style={{ boxShadow: '0 12px 32px -4px rgba(14, 28, 44, 0.06)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-body font-medium text-on-surface-variant">在招职位</span>
                      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">work</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-headline font-bold text-on-surface mb-1">3,200</div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-tertiary">
                        <span className="material-symbols-outlined text-[14px]">trending_flat</span>
                        <span>-0.5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 h-[400px] flex flex-col relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h3 className="text-lg font-headline font-semibold text-on-surface">近 30 天趋势图</h3>
                      <p className="text-sm text-on-surface-variant mt-1">日活用户与新增数据对比分析</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-xs text-on-surface-variant">日活用户</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-secondary-fixed"></div>
                        <span className="text-xs text-on-surface-variant">新增数据</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 relative w-full opacity-80 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#E5EEFF_1px,transparent_1px)] bg-[size:100%_40px]"></div>
                    <svg className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 1000 200">
                      <defs>
                        <linearGradient id="lineGrad1" x1="0%" x2="100%" y1="0%" y2="0%">
                          <stop offset="0%" stopColor="#0052D9" stopOpacity="0.2"></stop>
                          <stop offset="50%" stopColor="#003DA6" stopOpacity="1"></stop>
                          <stop offset="100%" stopColor="#0052D9" stopOpacity="0.8"></stop>
                        </linearGradient>
                        <linearGradient id="areaGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#003DA6" stopOpacity="0.1"></stop>
                          <stop offset="100%" stopColor="#003DA6" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <path d="M0,180 Q100,120 200,140 T400,90 T600,110 T800,40 T1000,60 L1000,200 L0,200 Z" fill="url(#areaGrad)"></path>
                      <path d="M0,180 Q100,120 200,140 T400,90 T600,110 T800,40 T1000,60" fill="none" stroke="url(#lineGrad1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"></path>
                      <path d="M0,190 Q150,160 300,170 T500,140 T700,150 T900,100 T1000,110" fill="none" stroke="#dde1ff" strokeDasharray="8 4" strokeLinecap="round" strokeWidth="3"></path>
                    </svg>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-headline font-bold text-on-surface-variant tracking-wider uppercase mb-4 ml-1">快捷入口</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="bg-surface-container-low hover:bg-surface-container text-primary font-medium rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-[0_4px_12px_-2px_rgba(14,28,44,0.04)] group border-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined">fact_check</span>
                      </div>
                      <span>企业审核</span>
                    </button>
                    <button className="bg-surface-container-low hover:bg-surface-container text-primary font-medium rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-[0_4px_12px_-2px_rgba(14,28,44,0.04)] group border-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined">refresh</span>
                      </div>
                      <span>失败任务重试</span>
                    </button>
                    <button className="bg-surface-container-low hover:bg-surface-container text-primary font-medium rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:shadow-[0_4px_12px_-2px_rgba(14,28,44,0.04)] group border-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                        <span className="material-symbols-outlined">label_important</span>
                      </div>
                      <span>标签治理</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col gap-8">
                <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-8 text-white relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 min-h-[220px] flex flex-col justify-between" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%), linear-gradient(to bottom right, #003DA6, #0052D9)' }}>
                  <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[180px] text-white/5 pointer-events-none icon-fill">hub</span>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-primary-fixed-dim font-medium mb-2">
                      <span className="material-symbols-outlined text-[20px] icon-fill">psychology</span>
                      <span>AI 匹配总数</span>
                    </div>
                    <div className="text-5xl font-headline font-extrabold tracking-tight mt-2 mb-4">128,400</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                      <span>本月计算量激增 24%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:shadow-lg">
                  <h3 className="text-sm font-headline font-bold text-on-surface-variant tracking-wider uppercase mb-5">运营指标</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-on-surface font-medium">任务成功率</span>
                        <span className="text-primary font-bold">98.5%</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '98.5%' }}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                          <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <span className="text-sm font-medium text-on-surface">企业周新增数</span>
                      </div>
                      <span className="text-xl font-headline font-bold text-primary">42</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:shadow-lg flex-1">
                  <h3 className="text-sm font-headline font-bold text-on-surface-variant tracking-wider uppercase mb-5 flex items-center justify-between">
                    待办事项
                    <span className="material-symbols-outlined text-primary text-[20px] icon-fill">assignment_late</span>
                  </h3>
                  <div className="space-y-3">
                    <a className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg group" href="#">
                      <div className="flex items-center gap-3 text-sm font-medium text-on-surface">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">domain_verification</span>
                        待审核企业
                      </div>
                      <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">12</span>
                    </a>
                    <a className="flex items-center justify-between p-4 bg-error-container/30 hover:bg-error-container/50 transition-colors rounded-lg group" href="#">
                      <div className="flex items-center gap-3 text-sm font-medium text-on-surface">
                        <span className="material-symbols-outlined text-error">error</span>
                        失败解析任务
                      </div>
                      <span className="bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full">5</span>
                    </a>
                    <a className="flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container transition-colors rounded-lg group" href="#">
                      <div className="flex items-center gap-3 text-sm font-medium text-on-surface">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">new_releases</span>
                        待处理标签建议
                      </div>
                      <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-bold px-2.5 py-1 rounded-full">24</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
