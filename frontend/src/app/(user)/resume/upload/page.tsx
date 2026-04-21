'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UploadPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      <Header forceShowNotifications />

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-6xl mb-6">
          <a href="/resume/manage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-primary font-medium bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group">
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>返回</span>
          </a>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Upload & Processing Status */}
          <div className="col-span-1 lg:col-span-7 flex flex-col">
            <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">解析您的职业履历</h1>
            <p className="text-on-surface-variant mb-8 text-lg">AI 认知引擎正在为您构建多维度的能力图谱。</p>

            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] relative overflow-hidden">
              {/* Subtle AI Glow Background */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* File Info Card */}
              <div className="flex items-center bg-surface-container-low p-5 rounded-2xl mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mr-5">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-on-surface text-base">林晓_资深产品经理_简历_2024.pdf</h3>
                  <p className="text-on-surface-variant text-sm mt-0.5">2.8 MB • PDF 文档</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-medium text-primary bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] animate-spin">memory</span>
                    AI 认知引擎解析中...
                  </span>
                  <span className="text-4xl font-headline font-bold text-primary tracking-tighter">65%</span>
                </div>
                <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[65%] rounded-full transition-all duration-1000 ease-out relative">
                    <div className="absolute inset-0 bg-white/20 w-1/2 translate-x-[-100%] skew-x-[-20deg]"></div>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-0 pl-2">
                {/* Step 1: Success */}
                <div className="flex gap-6 relative">
                  <div className="w-0.5 bg-primary absolute left-[11px] top-7 bottom-[-16px]"></div>
                  <div className="relative z-10 flex flex-col items-center mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  </div>
                  <div className="pb-8">
                    <p className="text-on-surface font-medium text-base">文件上传成功</p>
                    <p className="text-on-surface-variant text-sm mt-1">已安全传输至 GraphHire 加密存储</p>
                  </div>
                </div>

                {/* Step 2: Active */}
                <div className="flex gap-6 relative">
                  <div className="w-0.5 bg-surface-container-highest absolute left-[11px] top-7 bottom-[-16px]"></div>
                  <div className="relative z-10 flex flex-col items-center mt-1">
                    <div className="w-6 h-6 rounded-full bg-surface-container-lowest outline outline-2 outline-primary flex items-center justify-center ring-4 ring-primary-fixed/50">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="pb-8">
                    <p className="text-primary font-medium text-base">文本结构化处理与语义抽取</p>
                    <p className="text-on-surface-variant text-sm mt-1">正在识别工作经历、项目角色与核心技能边界</p>
                  </div>
                </div>

                {/* Step 3: Pending */}
                <div className="flex gap-6">
                  <div className="relative z-10 flex flex-col items-center mt-1">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-tertiary rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-tertiary font-medium text-base">生成多维认知图谱</p>
                    <p className="text-outline text-sm mt-1">即将建立技能节点映射与行业对齐标量</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Extracted Summary Preview */}
          <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
            <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden relative h-full flex flex-col">
              {/* Decorative header area */}
              <div className="h-24 bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/10 text-[8rem] absolute -right-4 -bottom-4">hub</span>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest"></div>
                <p className="text-sm font-medium text-tertiary tracking-widest uppercase z-10">预览解析结果</p>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                {/* Extracted Profile Data */}
                <div className="mb-8">
                  <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">基本信息</div>
                  <div className="flex items-end gap-4">
                    <h2 className="text-3xl font-headline font-bold text-on-surface">林晓</h2>
                    <span className="text-lg text-primary font-medium pb-0.5">资深产品经理</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[18px]">work</span>
                    <span>最近就职：星汉智造科技有限公司</span>
                  </div>
                </div>

                {/* Extracted Skills (Chips) */}
                <div className="mb-auto">
                  <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">核心技能节点识别 (部分)</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1.5 rounded-full text-sm font-medium">B端产品架构</span>
                    <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1.5 rounded-full text-sm font-medium">AI原生应用</span>
                    <span className="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-full text-sm">用户增长策略</span>
                    <span className="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-full text-sm">数据分析</span>
                    <span className="bg-surface-container text-tertiary px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] animate-pulse">more_horiz</span>
                    </span>
                  </div>
                </div>

                {/* Action Area */}
                <div className="mt-10 pt-6 bg-surface-container-lowest relative z-20">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-outline-variant opacity-20"></div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 py-3.5 px-4 rounded-xl bg-surface-container-high text-primary font-medium hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">refresh</span>
                      重新上传
                    </button>
                    <button className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      继续完善履历
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-center text-xs text-on-surface-variant mt-4">解析完成后可手动核对并修改信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}