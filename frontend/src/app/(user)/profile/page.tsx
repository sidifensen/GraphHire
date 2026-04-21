'use client';

import UserLayout from '@/components/UserLayout';

export default function ProfilePage() {
  return (
    <UserLayout>
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
    </UserLayout>
  );
}