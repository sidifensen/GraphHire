'use client';

import UserLayout from '@/components/UserLayout';

export default function ManagePage() {
  return (
    <UserLayout contentClassName="flex flex-col h-full overflow-y-auto relative p-4 md:p-8">
      {/* Top App Bar (Mobile Fallback / Header extension) */}
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tighter">简历管理</h1>
          <p className="text-sm text-tertiary mt-2">管理您的数字资产，AI 将深度解析您的职业图谱。</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-medium text-sm hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.15)] transition-all duration-300">
          <span className="material-symbols-outlined">cloud_upload</span>
          上传新简历
        </button>
      </header>

      <div className="pb-12 max-w-5xl">
        {/* List Section */}
        <div className="flex flex-col gap-6">
          {/* Resume Card 1 (Default, Parsed) */}
          <div className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-surface-container-lowest rounded-xl hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] border border-surface-variant transition-all duration-300 gap-6">
            {/* Left: Info */}
            <div className="flex items-start gap-5 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-bold text-on-surface truncate font-headline">Senior_Product_Manager_Profile_2024.pdf</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-fixed text-on-primary-fixed shrink-0">默认简历</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    2024-10-15 14:30上传
                  </span>
                  <span className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    AI 解析完成 (匹配度极高)
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
              <button className="px-4 py-2 text-sm font-medium text-primary bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                预览
              </button>
              <button className="px-4 py-2 text-sm font-medium text-tertiary hover:text-primary bg-transparent hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">sync</span>
                更新
              </button>
              <button className="p-2 text-tertiary hover:text-error hover:bg-error-container/50 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>

          {/* Resume Card 2 (Parsing) */}
          <div className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-surface-container-lowest rounded-xl hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] border border-surface-variant transition-all duration-300 gap-6">
            {/* Left: Info */}
            <div className="flex items-start gap-5 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-2xl">description</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-bold text-on-surface truncate font-headline">Operations_Director_Resume_Draft.docx</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    2024-10-18 09:15上传
                  </span>
                  <span className="flex items-center gap-1 text-secondary">
                    <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span>
                    图谱节点构建中...
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
              <button className="px-4 py-2 text-sm font-medium text-tertiary hover:text-primary bg-transparent hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-1">
                设为默认
              </button>
              <button className="p-2 text-tertiary hover:text-error hover:bg-error-container/50 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}