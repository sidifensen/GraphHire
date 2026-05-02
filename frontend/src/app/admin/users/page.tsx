'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';
import { adminApi } from '@/lib/api/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: number;
  avatar: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  type: '求职者' | '企业HR' | '管理员';
  joinDate: string;
  lastLoginAt: string;
  status: '正常' | '禁用';
}

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23e2e8f0"/><circle cx="40" cy="30" r="14" fill="%2394a3b8"/><rect x="18" y="50" width="44" height="18" rx="9" fill="%2394a3b8"/></svg>';

type UserItem = Awaited<ReturnType<typeof adminApi.getUserList>>['list'][number];

function mapUser(user: UserItem): User {
  const status = user.status === 'DISABLED' || user.status === 'LOCKED' ? '禁用' : '正常';
  const type = user.type === 'COMPANY' ? '企业HR' : user.type === 'ADMIN' ? '管理员' : '求职者';
  return {
    id: user.id,
    avatar: user.avatarUrl || DEFAULT_AVATAR,
    name: user.realName || user.username,
    username: user.username,
    email: user.email,
    phone: user.phone || '-',
    type,
    joinDate: user.createdAt || '-',
    lastLoginAt: user.lastLoginAt || '-',
    status,
  };
}

function mapTypeLabelToApi(value: string): string | undefined {
  if (value === '求职者') return 'PERSON';
  if (value === '企业HR') return 'COMPANY';
  return undefined;
}

function mapStatusLabelToApi(value: string): string | undefined {
  if (value === '正常') return 'ACTIVE';
  if (value === '禁用') return 'DISABLED';
  return undefined;
}

export default function AdminUsersPage() {
  const pageSize = 10;
  const [type, setType] = useState('全部用户类型');
  const [status, setStatus] = useState('全部状态');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof adminApi.getUserDetail>> | null>(null);

  const loadUsers = async () => {
    const response = await adminApi.getUserList({
      type: mapTypeLabelToApi(type),
      status: mapStatusLabelToApi(status),
      keyword: keyword || undefined,
      page,
      pageSize,
    });

    setUsers(response.list.map(mapUser));
    setTotal(response.total);
  };

  useEffect(() => {
    void loadUsers();
  }, [type, status, keyword, page]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, pageSize, total]);

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.status === '正常') {
        await adminApi.updateUserStatus(user.id, 'DISABLED');
      } else {
        await adminApi.updateUserStatus(user.id, 'ACTIVE');
      }
      await loadUsers();
    } catch (error: any) {
      console.error('Toggle status error:', error);
      const message = error?.response?.data?.message || error?.message || error || '操作失败';
      alert(message);
    }
  };

  const handleOpenDetail = async (userId: number) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const response = await adminApi.getUserDetail(userId);
      setDetail(response);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
          <div className="space-y-6 p-8">
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-on-surface">用户管理</h2>
          <p className="mt-1 text-sm text-outline">管理系统注册用户及求职者资料</p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40 border-none bg-surface py-2 text-sm font-medium text-on-surface dark:bg-slate-800">
                <SelectValue placeholder="全部用户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部用户类型">全部用户类型</SelectItem>
                <SelectItem value="求职者">求职者</SelectItem>
                <SelectItem value="企业HR">企业HR</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32 border-none bg-surface py-2 text-sm font-medium text-on-surface dark:bg-slate-800">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部状态">全部状态</SelectItem>
                <SelectItem value="正常">正常</SelectItem>
                <SelectItem value="禁用">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="搜索姓名、账号或联系方式"
              className="w-full rounded-lg border-none bg-surface py-2 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:ring-1 focus:ring-primary dark:bg-slate-800"
            />
          </div>
        </div>

        <AdminDataTable
          data={users}
          pagination={{
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(total / Math.max(pageSize, 1))),
            totalItems: total,
            pageSize: Math.max(pageSize, 1),
            onPageChange: (nextPage) => setPage(nextPage),
          }}
          columns={[
            {
              header: '头像',
              accessor: (user) => (
                <div className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant dark:border-slate-800">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
              ),
              className: 'w-20',
            },
            {
              header: '姓名',
              accessor: (user) => (
                <div className="w-[108px]">
                  <p className="line-clamp-2 break-all text-sm font-bold leading-5 text-on-surface">{user.name}</p>
                </div>
              ),
              className: 'w-[124px]',
            },
            {
              header: '账号',
              accessor: (user) => (
                <span className="block w-[150px] line-clamp-2 break-all text-sm leading-5 text-on-surface">{user.username}</span>
              ),
              className: 'w-[166px]',
            },
            { header: '联系方式', accessor: (user) => <span className="text-sm text-on-surface">{user.phone}</span> },
            {
              header: '用户类型',
              accessor: (user) => (
                <span
                  className={cn(
                    'whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset',
                    user.type === '求职者' ? 'bg-blue-50 text-blue-600 ring-blue-100' : 'bg-purple-50 text-purple-600 ring-purple-100'
                  )}
                >
                  {user.type}
                </span>
              ),
              className: 'w-[98px]',
            },
            { header: '注册时间', accessor: (user) => <span className="font-display text-sm text-on-surface">{user.joinDate}</span> },
            {
              header: '上次登录',
              accessor: (user) => <span className="whitespace-nowrap font-display text-sm text-on-surface">{user.lastLoginAt}</span>,
              className: 'w-[176px]',
            },
            {
              header: '状态',
              accessor: (user) => (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      user.status === '正常'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : user.status === '禁用'
                          ? 'bg-slate-400'
                          : 'bg-amber-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      user.status === '正常' ? 'text-emerald-700' : 'text-outline'
                    )}
                  >
                    {user.status}
                  </span>
                </div>
              ),
            },
            {
              header: '操作',
              className: 'text-right',
              accessor: (user) => (
                <div className="flex justify-end gap-4">
                  <button className="whitespace-nowrap text-xs font-bold uppercase text-slate-700 transition-colors hover:text-slate-900" onClick={() => void handleOpenDetail(user.id)}>
                    详情
                  </button>
                  {user.status === '正常' ? (
                    <button className="text-xs font-bold uppercase text-primary transition-colors hover:text-blue-700" onClick={() => void handleToggleStatus(user)}>
                      禁用
                    </button>
                  ) : (
                    <button className="whitespace-nowrap text-xs font-bold uppercase text-primary transition-colors hover:text-blue-700" onClick={() => void handleToggleStatus(user)}>
                      启用
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />

        {detailOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-surface">用户详情</h3>
                <button className="text-sm text-outline hover:text-on-surface" onClick={() => setDetailOpen(false)}>
                  关闭
                </button>
              </div>
              {detailLoading ? (
                <p className="text-sm text-outline">加载中...</p>
              ) : detail ? (
                <div className="space-y-4 text-sm text-on-surface">
                  <div className="grid grid-cols-2 gap-3">
                    <div>用户ID：{detail.user.id}</div>
                    <div>用户名：{detail.user.username || '-'}</div>
                    <div>姓名：{detail.user.realName || '-'}</div>
                    <div>邮箱：{detail.user.email || '-'}</div>
                    <div>手机号：{detail.user.phone || '-'}</div>
                    <div>用户类型：{detail.user.type || '-'}</div>
                    <div>状态：{detail.user.status || '-'}</div>
                    <div>注册时间：{detail.user.createdAt || '-'}</div>
                    <div>上次登录：{detail.user.lastLoginAt || '-'}</div>
                  </div>
                  {detail.personInfo && (
                    <div>
                      <h4 className="mb-2 font-bold">求职者信息（person_info）</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>person_info ID：{detail.personInfo.id}</div>
                        <div>user_id：{detail.personInfo.userId}</div>
                        <div>姓名：{detail.personInfo.realName || '-'}</div>
                        <div>性别：{detail.personInfo.gender ?? '-'}</div>
                        <div>年龄：{detail.personInfo.age ?? '-'}</div>
                        <div>电话：{detail.personInfo.phone || '-'}</div>
                        <div>邮箱：{detail.personInfo.email || '-'}</div>
                        <div>教育：{detail.personInfo.education || '-'}</div>
                        <div>城市：{detail.personInfo.city || '-'}</div>
                        <div>目标城市：{detail.personInfo.targetCity || '-'}</div>
                        <div>期望薪资：{detail.personInfo.expectedSalary ?? '-'}</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-outline">暂无数据</p>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
