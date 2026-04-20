'use client';

export default function ManagePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden antialiased font-body">
      {/* Top App Bar */}
      <header className="h-16 bg-surface-container-lowest border-b border-surface-variant flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-8">
          <a className="flex items-center gap-2" href="#">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-xl">hub</span>
            </div>
            <span className="text-xl font-bold font-headline text-primary">图谱智聘</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors" href="#">首页</a>
            <a className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors" href="#">职位</a>
            <a className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors" href="#">公司</a>
            <a className="text-on-surface-variant hover:text-primary font-medium text-sm transition-colors" href="#">能力图谱</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container border border-surface-variant ml-2">
            <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfVIw5oTTPWj85oSl7dTVFqavoGs_gyt1tU55rezZ5stuVX_OefYvkHl1MKcHEkCFOI4dYkuVhF49pvRD88-9qTecJ0ELWY7H3oygWVfBa8BUW7VA3B1-_8o9IUL9dDp7dG4Qur5EwxvxALu0o7eLUlhilmTrVb8TnK4L-m9z4m6_tV6AUlx0KTbZovSY8oRMrG6l0CFCzQR0DlJc6w76160XDAXIOv64I3ShspCeGt9s92QX6FEpWurSgEodOvWCwpA-FwljDRvb0" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SideNavBar Component */}
        <aside className="hidden md:flex flex-col bg-[#F8F9FF] dark:bg-slate-900 rounded-2xl my-4 ml-4 flex flex-col gap-2 w-64 h-[calc(100vh-6rem)] p-4 shadow-none shrink-0 border border-surface-variant/50">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-6 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden">
              <img alt="用户头像" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfVIw5oTTPWj85oSl7dTVFqavoGs_gyt1tU55rezZ5stuVX_OefYvkHl1MKcHEkCFOI4dYkuVhF49pvRD88-9qTecJ0ELWY7H3oygWVfBa8BUW7VA3B1-_8o9IUL9dDp7dG4Qur5EwxvxALu0o7eLUlhilmTrVb8TnK4L-m9z4m6_tV6AUlx0KTbZovSY8oRMrG6l0CFCzQR0DlJc6w76160XDAXIOv64I3ShspCeGt9s92QX6FEpWurSgEodOvWCwpA-FwljDRvb0" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#003DA6] font-headline tracking-tight">智聘空间</h2>
              <p className="text-xs text-tertiary mt-0.5">AI 驱动的职业导航</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 font-['Inter'] text-sm font-medium text-[#003DA6] dark:text-blue-400">
            {/* 个人资料 */}
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined text-xl">account_circle</span>
              <span>个人资料</span>
            </a>
            {/* 简历管理 (Active) */}
            <a className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 text-[#003DA6] dark:text-blue-300 rounded-xl px-4 py-3 font-bold hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <span>简历管理</span>
            </a>
            {/* 投递记录 */}
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined text-xl">assignment_turned_in</span>
              <span>投递记录</span>
            </a>
            {/* 我的图谱 */}
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined text-xl">hub</span>
              <span>我的图谱</span>
            </a>
            {/* 账号设置 */}
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined text-xl">settings</span>
              <span>账号设置</span>
            </a>
          </nav>

          {/* CTA Button */}
          <div className="mt-auto pt-4 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl">
            <button className="w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">upload</span>
              更新简历
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto relative p-4 md:p-8">
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
        </main>
      </div>
    </div>
  );
}