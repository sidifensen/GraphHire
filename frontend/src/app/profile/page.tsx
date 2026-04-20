'use client';

export default function ProfilePage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="bg-[#F8F9FF] dark:bg-slate-950 backdrop-blur-xl docked full-width top-0 z-50 sticky no-line-rule shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)] shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-black tracking-tighter text-[#003DA6] dark:text-blue-500 font-['Manrope'] antialiased tracking-tight">图谱智聘</div>
            <nav className="hidden md:flex gap-6 font-['Manrope'] antialiased tracking-tight">
              <a className="text-[#394851] dark:text-slate-400 hover:text-[#0052D9] transition-colors" href="#">首页</a>
              <a className="text-[#394851] dark:text-slate-400 hover:text-[#0052D9] transition-colors" href="#">职位</a>
              <a className="text-[#394851] dark:text-slate-400 hover:text-[#0052D9] transition-colors" href="#">公司</a>
              <a className="text-[#394851] dark:text-slate-400 hover:text-[#0052D9] transition-colors" href="#">能力图谱</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#003DA6] dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-2 rounded-full Active: scale-95 opacity-80 transition-transform">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-[#003DA6] dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 p-2 rounded-full Active: scale-95 opacity-80 transition-transform">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden ml-2 border-2 border-surface-container-lowest shadow-sm">
              <img alt="用户头像" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9A8uQmwRiv1FFH_2ddaaHUCYmhTwTPxvwQyLPUa_6BGCa5fuio5OV6B7HBpYhCZ8_M70dk4Oc9T8KnxaYhYgmYbjKxfNnCzhWlWAU-WRsHxzPyGrLsuPREO1I90gnCpDRwViWAxDkNoq3A-NHLjhB7R8wtchL2qKSA4xSXxu07sQdvJ9BwZmT27Fp1XiY-_YORcaOYIaEKKmWxuFnCTVLHgf0jTH66odZIPjvZq0cklKXqU1dgLyaw5AZC0JrxAxO7dgVCU8P7ypN" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        {/* SideNavBar */}
        <aside className="hidden md:flex flex-col gap-2 w-64 h-screen p-4 bg-[#F8F9FF] dark:bg-slate-900 rounded-2xl my-4 ml-4 bg-slate-100/50 dark:bg-slate-800/50 border-none shadow-none sticky top-24 font-['Inter'] text-sm font-medium">
          <div className="flex items-center gap-3 mb-6 p-4">
            <div className="w-12 h-12 rounded-full bg-primary-container overflow-hidden">
              <img alt="用户头像" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRCzLBCfC87pehiueY8TPZuKuN3JAHxVoosCOsLCViKc-44vDTyUtmpleeUFvxq4NFTHAKvljXEuMkZVkrE1cziIdkxwv3OaMgBBCNzsj9Dvn5dX5KURhHAUX3hAOhbhfH1i0iDZnDzECjNh4Xx8-W268riVbTzDguhMYHCSPLr3JZiRA-fFRG7gXxzdDE-qo0LJmiw4wJrFr1b5yEf4hWNEq1_HnTTqp2nC4FUvEp6nQhOfz0fK0QsEwmYXYprh7FwOWZAFXiJMr8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#003DA6]">智聘空间</h3>
              <p className="text-xs text-tertiary">AI 驱动的职业导航</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            <a className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 text-[#003DA6] dark:text-blue-300 rounded-xl px-4 py-3 font-bold hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined icon-fill">account_circle</span>
              个人资料
            </a>
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined">description</span>
              简历管理
            </a>
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined">assignment_turned_in</span>
              投递记录
            </a>
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined">hub</span>
              我的图谱
            </a>
            <a className="flex items-center gap-3 text-[#394851] dark:text-slate-400 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl hover:translate-x-1 transition-transform duration-200" href="#">
              <span className="material-symbols-outlined">settings</span>
              账号设置
            </a>
          </nav>

          <button className="mt-auto bg-gradient-to-br from-primary to-primary-container text-white rounded-xl py-3 px-4 font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span>
            更新简历
          </button>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 p-8 md:p-12 pb-24">
          {/* Page Header */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">个人资料</h1>
              <p className="text-tertiary text-sm max-w-xl">完善您的个人档案，GraphHire 认知 AI 将为您构建专属职业图谱，实现精准人岗匹配。</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-surface-container-high text-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">visibility</span>
                预览图谱
              </button>
              <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-shadow flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">save</span>
                保存全部修改
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Core Info & Intentions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info Section */}
              <section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
                {/* AI Glow element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
                    基础资料
                  </h2>
                  <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    编辑
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-surface-container-highest border-4 border-surface-container-lowest shadow-sm relative group cursor-pointer overflow-hidden">
                      <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpY4viNdsP3TN9_5FrgxNJzntcBuiRG6h4jk9DkYgEbBCm3ocXFhZZn40nhYqu2DcSgkvQErYwpF5RCAcJhCbbxtO3sUgdRye_76pyhwj-k6qU-XRnBVrk3UHI9rADXDGKPjwBaZBl1X0RjMImetShwJOWQyro0Vmw5PZYJVWZctxsPprE63RFQBCcLzqJeILGkWAEtUjWLofrknKoRtszalMywMjTxFBQYKsSxFesj2R3ml-rPTm5R1nruuDCD5CXkKc2QxAJTZO-" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                      </div>
                    </div>
                    <span className="text-xs text-tertiary bg-surface-variant px-3 py-1 rounded-full">更换头像</span>
                  </div>

                  {/* Form Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-tertiary uppercase tracking-wider">真实姓名</label>
                      <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" placeholder="请输入您的姓名" type="text" defaultValue="林静宜" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-tertiary uppercase tracking-wider">性别</label>
                      <select className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none appearance-none">
                        <option selected value="女">女</option>
                        <option value="男">男</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-tertiary uppercase tracking-wider">联系电话</label>
                      <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" placeholder="您的手机号码" type="tel" defaultValue="138 0013 8000" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-tertiary uppercase tracking-wider">电子邮箱</label>
                      <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" placeholder="您的常用邮箱" type="email" defaultValue="jingyi.lin@example.com" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Education Background */}
              <section className="bg-surface-container-low rounded-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
                    教育背景
                  </h2>
                  <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>
                    添加经历
                  </button>
                </div>
                <div className="space-y-6">
                  {/* Education Item 1 */}
                  <div className="bg-surface-container-lowest p-5 rounded-lg border-l-4 border-primary/40 hover:border-primary transition-colors relative group">
                    <button className="absolute top-4 right-4 text-tertiary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-tertiary uppercase tracking-wider">学校名称</label>
                        <input className="w-full bg-transparent text-on-surface border-none p-0 focus:ring-0 text-base font-semibold outline-none" placeholder="学校名称" type="text" defaultValue="复旦大学" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-tertiary uppercase tracking-wider">专业</label>
                        <input className="w-full bg-transparent text-on-surface border-none p-0 focus:ring-0 text-base font-medium outline-none" placeholder="专业名称" type="text" defaultValue="人工智能与计算机科学" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-tertiary uppercase tracking-wider">学历层次</label>
                        <select className="w-full bg-transparent text-on-surface border-none p-0 focus:ring-0 text-sm appearance-none outline-none">
                          <option selected value="硕士">硕士研究生</option>
                          <option value="本科">本科</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-tertiary uppercase tracking-wider">在校时间</label>
                        <div className="flex items-center gap-2">
                          <input className="w-20 bg-transparent text-on-surface border-none p-0 focus:ring-0 text-sm text-center outline-none" type="text" defaultValue="2019.09" />
                          <span className="text-tertiary">-</span>
                          <input className="w-20 bg-transparent text-on-surface border-none p-0 focus:ring-0 text-sm text-center outline-none" type="text" defaultValue="2022.06" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Intentions & AI insights */}
            <div className="space-y-8">
              {/* Job Intentions */}
              <section className="bg-surface-container-low rounded-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                    <span className="w-1 h-5 bg-secondary rounded-full inline-block"></span>
                    求职意向
                  </h2>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-tertiary">期望职位</label>
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-secondary transition-colors text-sm font-medium outline-none" type="text" defaultValue="高级算法工程师 / AI 产品经理" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-tertiary">期望薪资 (月薪)</label>
                    <select className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-secondary transition-colors text-sm font-medium outline-none appearance-none">
                      <option value="20k-30k">20k - 30k</option>
                      <option selected value="30k-50k">30k - 50k</option>
                      <option value="50k+">50k 以上</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-tertiary">目标城市</label>
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-secondary transition-colors text-sm font-medium outline-none" type="text" defaultValue="上海, 杭州, 深圳" />
                    <p className="text-[10px] text-tertiary mt-1">支持多选，用逗号分隔</p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-tertiary mb-2 block">当前求职状态</label>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-primary text-on-primary px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer">积极找工作</span>
                      <span className="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-surface-dim transition-colors">随便看看</span>
                      <span className="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-surface-dim transition-colors">暂不考虑</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Cognitive Card */}
              <section className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-primary-fixed-dim opacity-20">
                  <span className="material-symbols-outlined text-9xl">psychology</span>
                </div>
                <h3 className="text-sm font-headline font-bold text-primary mb-2 flex items-center gap-1 relative z-10">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  图谱认知引擎就绪
                </h3>
                <p className="text-xs text-tertiary leading-relaxed relative z-10 mb-4">
                  您的资料完整度已达 85%。系统正在后台为您提取隐性技能节点，稍后将在「我的图谱」中展现完整的能力网络。
                </p>
                <div className="w-full bg-surface-variant rounded-full h-1.5 mb-1 relative z-10 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 full-width border-t border-slate-100 dark:border-slate-900 border-t border-slate-100 dark:border-slate-800 flat flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full mt-20">
        <div className="hidden text-lg font-bold text-[#003DA6]">图谱智聘</div>
        <div className="text-[#394851] dark:text-slate-500 font-['Inter'] text-xs tracking-wide">
          © 2024 GraphHire 图谱智聘. 认知导视 AI 招聘系统
        </div>
        <nav className="flex gap-6 mt-4 md:mt-0 font-['Inter'] text-xs tracking-wide">
          <a className="text-slate-400 hover:text-[#003DA6] hover:underline underline-offset-4" href="#">关于我们</a>
          <a className="text-slate-400 hover:text-[#003DA6] hover:underline underline-offset-4" href="#">联系方式</a>
          <a className="text-slate-400 hover:text-[#003DA6] hover:underline underline-offset-4" href="#">服务条款</a>
          <a className="text-slate-400 hover:text-[#003DA6] hover:underline underline-offset-4" href="#">隐私政策</a>
        </nav>
      </footer>
    </div>
  );
}