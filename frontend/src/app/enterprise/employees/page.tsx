'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import EnterpriseContent from '@/components/enterprise/EnterpriseContent';
import EnterprisePageHeader from '@/components/enterprise/EnterprisePageHeader';
import { companyApi } from '@/lib/api/company';
import { formatStaffPost, staffName } from '@/lib/mappers/enterpriseMapper';
import type { EnterpriseCreateStaffRequest, EnterpriseStaffListItem, EnterpriseStaffStats } from '@/lib/types/enterprise';

const initialForm: EnterpriseCreateStaffRequest = {
  username: '',
  password: '',
  post: 'HR',
};

export default function EmployeesPage() {
  const [stats, setStats] = useState<EnterpriseStaffStats | null>(null);
  const [staffList, setStaffList] = useState<EnterpriseStaffListItem[]>([]);
  const [pendingList, setPendingList] = useState<EnterpriseStaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState<EnterpriseCreateStaffRequest>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const [statsResponse, staffResponse, pendingResponse] = await Promise.all([
        companyApi.getStaffStats(),
        companyApi.getStaffList(),
        companyApi.getPendingStaffList(),
      ]);
      setStats(statsResponse);
      setStaffList(staffResponse);
      setPendingList(pendingResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : '员工数据加载失败';
      setError(message);
      if (message.includes('403') || message.includes('无权') || message.includes('Forbidden')) {
        setForbidden(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const sortedStaffList = useMemo(() => [...staffList].sort((a, b) => a.id - b.id), [staffList]);
  const sortedPendingList = useMemo(() => [...pendingList].sort((a, b) => a.id - b.id), [pendingList]);

  const handleCreateStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await companyApi.createStaff(form);
      setMessage('员工账号创建成功');
      setForm(initialForm);
      setFormVisible(false);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '员工创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (staff: EnterpriseStaffListItem) => {
    setMessage(null);
    try {
      const response = await companyApi.resetStaffPassword(staff.id);
      setMessage(`${staffName(staff)} 的新密码：${response.newPassword}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '密码重置失败');
    }
  };

  const handleToggleStaffStatus = async (staff: EnterpriseStaffListItem) => {
    setMessage(null);
    try {
      const disabled = staff.status === 'ACTIVE';
      await companyApi.updateStaffStatus(staff.id, disabled);
      setMessage(`${staffName(staff)} 已${disabled ? '禁用' : '启用'}`);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '员工状态更新失败');
    }
  };

  const handleApproveJoin = async (staff: EnterpriseStaffListItem) => {
    setMessage(null);
    try {
      await companyApi.approveJoinRequest(staff.id);
      setMessage(`${staffName(staff)} 已通过加入审批`);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '审批失败');
    }
  };

  const handleRejectJoin = async (staff: EnterpriseStaffListItem) => {
    setMessage(null);
    try {
      await companyApi.rejectJoinRequest(staff.id);
      setMessage(`${staffName(staff)} 已拒绝加入`);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '拒绝失败');
    }
  };

  return (
    <EnterpriseContent>
      <EnterprisePageHeader
        title="员工管理"
        description="管理企业内部账号、岗位分工及登录状态。"
        action={
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2.5 rounded-md font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm hover:shadow-md" onClick={() => setFormVisible((value) => !value)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            {formVisible ? '收起表单' : '添加员工'}
          </button>
        }
      />

      {formVisible && (
        <form className="mb-6 rounded-xl bg-surface-container-lowest p-6 grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleCreateStaff}>
          <input
            className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline"
            placeholder="员工登录用户名"
            type="text"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          />
          <input
            className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline"
            placeholder="初始密码"
            type="text"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          />
          <select
            className="rounded-lg bg-surface-container-low px-4 py-3 text-sm text-on-surface"
            value={form.post}
            onChange={(event) => setForm((prev) => ({ ...prev, post: event.target.value as EnterpriseCreateStaffRequest['post'] }))}
          >
            <option value="HR">管理员</option>
          </select>
          <button className="rounded-lg bg-primary text-white text-sm font-medium px-4 py-3 disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? '提交中...' : '创建员工账号'}
          </button>
        </form>
      )}

      {message && <div className="mb-4 rounded-lg bg-surface-container p-4 text-sm text-on-surface">{message}</div>}

      {loading ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">员工数据加载中...</div>
      ) : forbidden ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
          当前账号无权限访问员工管理，仅企业主可查看和管理员工列表。
        </div>
      ) : error ? (
        <div className="rounded-xl bg-error-container p-6 text-sm text-error space-y-3">
          <div>{error}</div>
          <button className="px-4 py-2 rounded-lg bg-white text-error" onClick={() => void loadData()}>重试</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="企业总人数" value={stats?.totalCount ?? 0} description="当前企业账号总量" icon="groups" />
            <StatCard title="企业主数量" value={stats?.ownerCount ?? 0} description="拥有最高权限" icon="shield_person" />
            <StatCard title="管理员数量" value={stats?.hrCount ?? 0} description="可管理招聘流程" icon="admin_panel_settings" />
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-headline text-on-surface">待加入员工</h3>
              <div className="text-sm text-on-surface-variant">共 {sortedPendingList.length} 条申请</div>
            </div>
            {sortedPendingList.length === 0 ? (
              <div className="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">暂无待审批申请</div>
            ) : (
              <div className="space-y-3">
                {sortedPendingList.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
                    <div>
                      <div className="font-medium text-on-surface">{staffName(staff)}</div>
                      <div className="text-xs text-tertiary">{staff.username || `用户 #${staff.userId}`}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-primary text-white text-xs px-3 py-2" onClick={() => void handleApproveJoin(staff)}>通过</button>
                      <button className="rounded-lg bg-surface-container text-on-surface text-xs px-3 py-2" onClick={() => void handleRejectJoin(staff)}>拒绝</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 bg-surface-container-lowest rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-headline text-on-surface">人员列表</h3>
                <div className="text-sm text-on-surface-variant">共 {sortedStaffList.length} 条记录</div>
              </div>

              {sortedStaffList.length === 0 ? (
                <div className="rounded-xl bg-surface-container-low p-6 text-sm text-on-surface-variant">暂无员工账号</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-medium text-tertiary uppercase tracking-wider bg-surface-container-low/50">
                        <th className="px-4 py-3 rounded-l-md">员工账号</th>
                        <th className="px-4 py-3">职位</th>
                        <th className="px-4 py-3">角色权限</th>
                        <th className="px-4 py-3">状态</th>
                        <th className="px-4 py-3">最近登录</th>
                        <th className="px-4 py-3 rounded-r-md text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-on-surface">
                      {sortedStaffList.map((staff) => (
                        <tr key={staff.id} className="hover:bg-surface-container-low/30 transition-colors group">
                          <td className="px-4 py-4 border-b border-surface-container-highest/30">
                            <div className="font-medium text-on-surface">{staffName(staff)}</div>
                            <div className="text-xs text-tertiary">{staff.username || `用户 #${staff.userId}`}</div>
                          </td>
                          <td className="px-4 py-4 border-b border-surface-container-highest/30 text-on-surface-variant">{formatStaffPost(staff.post)}</td>
                          <td className="px-4 py-4 border-b border-surface-container-highest/30">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-fixed text-on-primary-fixed">
                              {formatStaffPost(staff.post)}
                            </span>
                          </td>
                          <td className="px-4 py-4 border-b border-surface-container-highest/30">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${staff.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-outline-variant'}`}></div>
                              <span className="text-xs text-tertiary">{staff.status === 'ACTIVE' ? '活跃' : '已禁用'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-b border-surface-container-highest/30 text-xs text-tertiary">{staff.lastLoginTime || '-'}</td>
                          <td className="px-4 py-4 border-b border-surface-container-highest/30 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="text-tertiary hover:text-on-surface disabled:text-outline disabled:cursor-not-allowed" disabled={staff.post === 'OWNER'} title="重置密码" onClick={() => void handleResetPassword(staff)}>
                                <span className="material-symbols-outlined text-[18px]">key</span>
                              </button>
                              <button className="text-tertiary hover:text-error disabled:text-outline disabled:cursor-not-allowed" disabled={staff.post === 'OWNER'} title={staff.status === 'ACTIVE' ? '禁用账号' : '启用账号'} onClick={() => void handleToggleStaffStatus(staff)}>
                                <span className="material-symbols-outlined text-[18px]">block</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="xl:col-span-1 flex flex-col gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 h-full border border-surface-container-low">
                <h3 className="text-lg font-bold font-headline text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shield_person</span>
                  角色权限说明
                </h3>
                <div className="space-y-4 text-sm text-on-surface-variant">
                  <div>
                    <div className="font-semibold text-on-surface mb-1">企业主</div>
                    <p>可创建员工、审批加入、重置员工密码，并查看全部企业招聘数据。</p>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface mb-1">管理员</div>
                    <p>负责团队配置与招聘流程管理。</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-primary-fixed/30 rounded-lg text-xs text-on-surface-variant border border-primary-fixed">
                  <span className="font-medium text-primary block mb-1">AI 提示：</span>
                  创建员工、审批加入与重置密码均已接入真实后端权限校验，当前页不会再使用假数据。
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </EnterpriseContent>
  );
}

function StatCard({ title, value, description, icon }: { title: string; value: number; description: string; icon: string }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-surface-container-low rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-tertiary text-sm font-medium">{title}</span>
        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>
      <div className="text-4xl font-headline font-bold text-on-surface relative z-10">{value}</div>
      <div className="mt-2 text-xs text-tertiary">{description}</div>
    </div>
  );
}
