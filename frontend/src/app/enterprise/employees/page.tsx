'use client';

import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';

export default function EmployeesPage() {
  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title="员工管理"
        description="管理企业内部账号、权限分配及登录状态。"
        action={
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm hover:shadow-md">
            <span className="material-symbols-outlined text-[18px]">add</span>
            添加员工
          </button>
        }
      />
      {/* Stats Overview (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-surface-container-low rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-tertiary text-sm font-medium">企业总人数</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </div>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface relative z-10">124</div>
          <div className="mt-2 text-xs text-tertiary flex items-center gap-1">
            <span className="text-emerald-600 flex items-center">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>+3
            </span>
            本月新增
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-surface-container-low rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-tertiary text-sm font-medium">管理员数量</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            </div>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface relative z-10">5</div>
          <div className="mt-2 text-xs text-tertiary">拥有最高系统配置权限</div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-surface-container-low rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-tertiary text-sm font-medium">普通 HR (招聘专员)</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">person_search</span>
            </div>
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface relative z-10">118</div>
          <div className="mt-2 text-xs text-tertiary">负责日常招聘及候选人管理</div>
        </div>
      </div>
      {/* Main Content Layout (Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Employee List (Left 75%) */}
        <div className="xl:col-span-3 bg-surface-container-lowest rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold font-headline text-on-surface">人员列表</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-surface-container text-primary rounded-md flex items-center gap-1 font-medium hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                筛选
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-medium text-tertiary uppercase tracking-wider bg-surface-container-low/50">
                  <th className="px-4 py-3 rounded-l-md">员工姓名</th>
                  <th className="px-4 py-3">部门 / 职位</th>
                  <th className="px-4 py-3">角色权限</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">最近登录</th>
                  <th className="px-4 py-3 rounded-r-md text-right">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRWf4puWQoqoPyD3f99o7jHPGn8H6iW_vzZnfP7zHA2QjFMLIEPj2ca6-0XtPjYzKxaddWCBx-P-6T9xRl_j6mj0_fSPq0Kg3AJcV2L6bbAnZmHdB9G0hkR3oBSF2Ri_kImQQD54wDVWmimH-SA6UHxjAdzbJEsZ0G1aRWHJmo2fpFW83F9iJs4GE-dyXb7Vy-vi27tEpZRaYH_KNxWKhim4lVy-gxM5upnumQEURUKwFlXNfxmQLd4HpRdaqQCV6tfezCZVlYDJ1q"
                      />
                      <div>
                        <div className="font-medium text-on-surface">张伟</div>
                        <div className="text-xs text-tertiary">138****1234</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="font-medium">管理层</div>
                    <div className="text-xs text-tertiary">CEO</div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">
                      企业主
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-tertiary">活跃</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30 text-xs text-tertiary">
                    今天 09:41
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2">
                      <button className="text-primary hover:text-primary-container" title="编辑">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA88Mo0i_QZaY2B85Y4t4iEc-h44VywYp_KokOAfWSt8Id128xQz9rA1Y0NZY6z51MKQ6matBP3TRlANyG8EV_YiIqZlclONzKZ4XOyMDkXzLwQmtzgNgXZAdYeMzeaKeK3Bzn9awWz8R8U8uk7Y1b5hWPgVkyWT_t2A3bEia__AHPmfy4mFCFInr5YcgnR-K9Y8knUxTwIItAWdajuEKW0QQbmmjQW50qeRWUF4V04lz8YlAQbQQ-U0W6igm6lUy_de1Ixxc73anFp"
                      />
                      <div>
                        <div className="font-medium text-on-surface">李娜</div>
                        <div className="text-xs text-tertiary">139****5678</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="font-medium">人力资源部</div>
                    <div className="text-xs text-tertiary">HR 总监</div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-fixed text-on-secondary-fixed">
                      管理员
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-tertiary">活跃</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30 text-xs text-tertiary">
                    昨天 14:20
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2">
                      <button className="text-primary hover:text-primary-container" title="编辑">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="text-tertiary hover:text-on-surface" title="重置密码">
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXLaH4avJ26pf2wvtdo4tX5v4P1uNZIKPG_4rbJ11TqOgYOxOM40JEItfNo6o5_StCBnf9rtg_AUcHB0DbhS7hvXhFeuVB3bsqWlIsgxNZkz5E6Fv278VlRR_T_tpucd8BwAeT1FeOjGEImoX36CndrsWzulR_71wipV03--MlHguBCZBGoAH18DRQjFlQXZXeBC8gEVxlnypjNxEVUsvNjmxnRKBKu0-p2zkwHUR4dy2_f8xoMGrr6HLzTbKcQbUQwggX-0WyxaHx"
                      />
                      <div>
                        <div className="font-medium text-on-surface">王强</div>
                        <div className="text-xs text-tertiary">137****9012</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="font-medium">招聘组</div>
                    <div className="text-xs text-tertiary">资深招聘专员</div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant">
                      招聘专员
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-tertiary">活跃</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30 text-xs text-tertiary">
                    今天 10:05
                  </td>
                  <td className="px-4 py-4 border-b border-surface-container-highest/30 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2">
                      <button className="text-primary hover:text-primary-container" title="编辑">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="text-tertiary hover:text-on-surface" title="重置密码">
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </button>
                      <button className="text-error hover:text-red-700" title="禁用">
                        <span className="material-symbols-outlined text-[18px]">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 4 - 已禁用 */}
                <tr className="hover:bg-surface-container-low/30 transition-colors group opacity-60">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover grayscale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6uskgiL9XOEs7ZmCeb8veq8K0gywUzBu5CCKTL2oy3BvtG1sdkixeWIq24hWDt2ADo2wa3ncyFdjVH6CqCMcbHzikUgTMR4Fl2VliiKEEmiXDTSCqxz50XFhRAixC_AyOXbRBEemrY_6EK8AxvFKpFVhrjDQmkXcxby1DrHMRMC4x0mh-pJ6JKs1ASES-CIYTscQrLQwpmDp9PbD44Gwq2MStPP1D2Gg5Syyu_DEO9UOOFyH_ubx_XDm9_OLi2RxkYSIGe1qGkSKm"
                      />
                      <div>
                        <div className="font-medium text-on-surface line-through">赵敏</div>
                        <div className="text-xs text-tertiary">159****3456</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium">招聘组</div>
                    <div className="text-xs text-tertiary">前招聘助理</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-variant text-on-surface-variant">
                      招聘专员
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                      <span className="text-xs text-tertiary">已禁用</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-tertiary">2023-10-15</td>
                  <td className="px-4 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-end gap-2">
                      <button className="text-primary hover:text-primary-container" title="恢复">
                        <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
                      </button>
                      <button className="text-error hover:text-red-700" title="删除">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center text-sm text-tertiary">
            <div>共 124 条记录</div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
        {/* Role Permissions Info (Right 25%) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 h-full border border-surface-container-low">
            <h3 className="text-lg font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">shield_person</span>
              角色权限说明
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-container before:to-transparent">
              {/* 企业主 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-primary-fixed text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="material-symbols-outlined text-[20px]">stars</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface-container-low border border-surface-container">
                  <div className="font-bold text-on-surface text-sm mb-1">企业主</div>
                  <p className="text-xs text-tertiary leading-relaxed">拥有系统最高权限。可管理企业信息、分配管理员、查看所有业务数据面板及财务信息。</p>
                </div>
              </div>
              {/* 管理员 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-secondary-fixed text-secondary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface">
                  <div className="font-bold text-on-surface text-sm mb-1">管理员</div>
                  <p className="text-xs text-tertiary leading-relaxed">可添加/编辑普通员工，管理部门架构，配置招聘流程规范，查看团队宏观招聘数据。</p>
                </div>
              </div>
              {/* 招聘专员 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-surface-variant text-tertiary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-surface">
                  <div className="font-bold text-on-surface text-sm mb-1">招聘专员</div>
                  <p className="text-xs text-tertiary leading-relaxed">执行日常招聘任务。发布职位、筛选简历、安排面试，仅能操作分配给自己的业务数据。</p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-primary-fixed/30 rounded-lg text-xs text-on-surface-variant border border-primary-fixed">
              <span className="font-medium text-primary block mb-1">AI 提示：</span>
              权限变更将实时生效，若修改了正在登录用户的权限，该用户将在下次操作时重新鉴权。
            </div>
          </div>
        </div>
      </div>
      <div className="h-12"></div>
    </EnterpriseContent>
  );
}
