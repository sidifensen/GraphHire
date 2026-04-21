export default function EnterpriseDashboardPage() {
  return (
    <div className="p-8 max-w-[1440px] mx-auto w-full space-y-8">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-bold font-headline text-on-surface">欢迎回来，GraphHire 企业管理中心</h2>
        <p className="text-on-surface-variant mt-2 text-sm max-w-2xl">您的AI智能招聘助手已就绪。正在为您实时分析人才图谱与职位匹配度。</p>
      </div>
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Stats (Left 8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-sm text-on-surface-variant font-medium mb-2">待处理投递</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-headline font-bold text-primary">24</span>
                <span className="text-xs text-secondary-container mb-1">+3 今日</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-sm text-on-surface-variant font-medium mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                新匹配候选人
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-headline font-bold text-primary">156</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-fixed rounded-full opacity-30 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-sm text-on-surface-variant font-medium mb-2">在招职位</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-headline font-bold text-on-surface">8</span>
              </div>
            </div>
          </div>
          {/* Trend Chart Area */}
          <div className="bg-surface-container-lowest rounded-xl p-6 h-80 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-semibold text-lg">职位浏览与转化趋势</h3>
              <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">近 7 天</span>
            </div>
            {/* Bar Chart */}
            <div className="flex-1 bg-surface-container-low rounded-lg relative flex items-end p-4 gap-4">
              <div className="w-full bg-primary-fixed/50 rounded-t-sm h-[40%] hover:bg-primary-fixed transition-colors"></div>
              <div className="w-full bg-primary-fixed/50 rounded-t-sm h-[60%] hover:bg-primary-fixed transition-colors"></div>
              <div className="w-full bg-primary-fixed/50 rounded-t-sm h-[30%] hover:bg-primary-fixed transition-colors"></div>
              <div className="w-full bg-primary-container/80 rounded-t-sm h-[85%] hover:bg-primary-container transition-colors relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-xs px-2 py-1 rounded">峰值</div>
              </div>
              <div className="w-full bg-primary-fixed/50 rounded-t-sm h-[50%] hover:bg-primary-fixed transition-colors"></div>
              <div className="w-full bg-primary-fixed/50 rounded-t-sm h-[70%] hover:bg-primary-fixed transition-colors"></div>
              <div className="w-full bg-primary-fixed/50 rounded-t-sm h-[45%] hover:bg-primary-fixed transition-colors"></div>
            </div>
          </div>
        </div>
        {/* Quick Actions (Right 4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col">
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex-shrink-0">
            <div className="absolute right-0 bottom-0 opacity-10">
              <span className="material-symbols-outlined text-[120px] leading-none">add_circle</span>
            </div>
            <h3 className="font-headline font-semibold text-xl mb-2 relative z-10">启动新招聘</h3>
            <p className="text-primary-fixed-dim text-sm mb-6 relative z-10 max-w-[80%]">使用AI图谱技术，一键生成岗位描述并精准匹配人才池。</p>
            <button className="bg-white text-primary px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-surface-bright transition-colors relative z-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              发布新职位
            </button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 flex-1 flex flex-col gap-4">
            <h3 className="font-headline font-semibold text-lg">快捷操作</h3>
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">hub</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">查看智能推荐</p>
                  <p className="text-xs text-on-surface-variant">AI图谱每日推送优质候选</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary">chevron_right</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-on-surface">邀请面试</p>
                  <p className="text-xs text-on-surface-variant">批量安排并同步日历</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary">chevron_right</span>
            </button>
          </div>
        </div>
        {/* Recent Jobs Table (Full Width) */}
        <div className="col-span-12">
          <div className="bg-surface-container-lowest rounded-xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-semibold text-lg">近期发布职位</h3>
              <button className="text-primary text-sm font-medium hover:underline">查看全部</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-on-surface-variant border-b-0">
                    <th className="pb-4 font-medium pl-2">职位名称</th>
                    <th className="pb-4 font-medium">发布部门</th>
                    <th className="pb-4 font-medium text-right">投递数</th>
                    <th className="pb-4 font-medium text-right">AI匹配候选人</th>
                    <th className="pb-4 font-medium text-right pr-2">状态</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {/* Row 1 */}
                  <tr className="group">
                    <td className="py-4 pl-2">
                      <div className="font-medium text-on-surface group-hover:text-primary transition-colors">高级前端工程师 (React)</div>
                      <div className="text-xs text-on-surface-variant mt-1">2天前发布</div>
                    </td>
                    <td className="py-4 text-on-surface-variant">研发中心</td>
                    <td className="py-4 text-right font-medium">45</td>
                    <td className="py-4 text-right">
                      <span className="bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded-full text-xs font-medium">12 人极度匹配</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <span className="inline-flex items-center gap-1.5 text-secondary">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>招聘中
                      </span>
                    </td>
                  </tr>
                  {/* Row 2 */}
                  <tr className="group">
                    <td className="py-4 pl-2">
                      <div className="font-medium text-on-surface group-hover:text-primary transition-colors">数据分析专家</div>
                      <div className="text-xs text-on-surface-variant mt-1">5天前发布</div>
                    </td>
                    <td className="py-4 text-on-surface-variant">商业智能部</td>
                    <td className="py-4 text-right font-medium">128</td>
                    <td className="py-4 text-right">
                      <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded-full text-xs font-medium">34 人匹配</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <span className="inline-flex items-center gap-1.5 text-secondary">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>招聘中
                      </span>
                    </td>
                  </tr>
                  {/* Row 3 */}
                  <tr className="group opacity-60">
                    <td className="py-4 pl-2">
                      <div className="font-medium text-on-surface">产品运营经理</div>
                      <div className="text-xs text-on-surface-variant mt-1">上周发布</div>
                    </td>
                    <td className="py-4 text-on-surface-variant">运营部</td>
                    <td className="py-4 text-right font-medium">210</td>
                    <td className="py-4 text-right">
                      <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded-full text-xs font-medium">89 人匹配</span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <span className="inline-flex items-center gap-1.5 text-tertiary">
                        <span className="w-2 h-2 rounded-full bg-outline-variant"></span>已结束
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}