'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronDown, MoreHorizontal } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';
import { adminApi } from '@/lib/api/admin';

interface User {
  id: number;
  avatar: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  type: '求职者' | '企业HR' | '管理员';
  joinDate: string;
  status: '活跃' | '禁用' | '待激活';
}

type UserItem = Awaited<ReturnType<typeof adminApi.getUserList>>['list'][number];

function mapUser(user: UserItem): User {
  const status = user.status === 'DISABLED' ? '禁用' : user.status === 'LOCKED' ? '待激活' : '活跃';
  const type = user.type === 'COMPANY' ? '企业HR' : user.type === 'ADMIN' ? '管理员' : '求职者';
  return {
    id: user.id,
    avatar: user.avatarUrl || `https://avatar.vercel.sh/${encodeURIComponent(user.username || String(user.id))}`,
    name: user.realName || user.username,
    role: type,
    email: user.email,
    phone: user.phone || '-',
    type,
    joinDate: user.createdAt || '-',
    status,
  };
}

function mapTypeLabelToApi(value: string): string | undefined {
  if (value === '求职者') return 'PERSON';
  if (value === '企业HR') return 'COMPANY';
  return undefined;
}

function mapStatusLabelToApi(value: string): string | undefined {
  if (value === '活跃') return 'ACTIVE';
  if (value === '禁用') return 'DISABLED';
  if (value === '待激活') return 'LOCKED';
  return undefined;
}

export default function AdminUsersPage() {
  const [type, setType] = useState('全部用户类型');
  const [status, setStatus] = useState('全部状态');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [users, setUsers] = useState<User[]>([]);

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
    setPageSize(response.pageSize);
  };

  useEffect(() => {
    void loadUsers();
  }, [type, status, keyword, page]);

  const handleToggleStatus = async (user: User) => {
    if (user.status === '活跃') {
      await adminApi.updateUserStatus(user.id, 'DISABLED');
    } else {
      await adminApi.updateUserStatus(user.id, 'ACTIVE');
    }
    await loadUsers();
  };

  return (
    <AdminShell>
      <div className="space-y-6 p-8">
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold text-on-surface">用户管理</h2>
          <p className="mt-1 text-sm text-outline">管理系统注册用户及求职者资料</p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/40 dark:backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="group relative">
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="w-40 appearance-none rounded-lg border-none bg-surface py-2 pl-3 pr-8 text-sm font-medium text-on-surface focus:ring-1 focus:ring-primary dark:bg-slate-800"
              >
                <option>全部用户类型</option>
                <option>求职者</option>
                <option>企业HR</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            </div>
            <div className="group relative">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-32 appearance-none rounded-lg border-none bg-surface py-2 pl-3 pr-8 text-sm font-medium text-on-surface focus:ring-1 focus:ring-primary dark:bg-slate-800"
              >
                <option>全部状态</option>
                <option>活跃</option>
                <option>禁用</option>
                <option>待激活</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            </div>
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
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                </div>
              ),
              className: 'w-20',
            },
            {
              header: '姓名/职位',
              accessor: (user) => (
                <div>
                  <p className="text-sm font-bold text-on-surface">{user.name}</p>
                  <p className="mt-0.5 text-[11px] text-outline">{user.role}</p>
                </div>
              ),
            },
            {
              header: '账号/联系方式',
              accessor: (user) => (
                <div>
                  <p className="text-sm text-on-surface">{user.email}</p>
                  <p className="mt-0.5 text-[11px] text-outline">{user.phone}</p>
                </div>
              ),
            },
            {
              header: '用户类型',
              accessor: (user) => (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ring-inset',
                    user.type === '求职者' ? 'bg-blue-50 text-blue-600 ring-blue-100' : 'bg-purple-50 text-purple-600 ring-purple-100'
                  )}
                >
                  {user.type}
                </span>
              ),
            },
            { header: '注册时间', accessor: (user) => <span className="font-display text-sm text-on-surface">{user.joinDate}</span> },
            {
              header: '状态',
              accessor: (user) => (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      user.status === '活跃'
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : user.status === '禁用'
                          ? 'bg-slate-400'
                          : 'bg-amber-400'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      user.status === '活跃' ? 'text-emerald-700' : user.status === '禁用' ? 'text-outline' : 'text-amber-700'
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
                  {user.status === '活跃' ? (
                    <button className="text-xs font-bold uppercase text-primary transition-colors hover:text-blue-700" onClick={() => void handleToggleStatus(user)}>
                      禁用
                    </button>
                  ) : user.status === '禁用' ? (
                    <>
                      <button className="text-xs font-bold uppercase text-primary transition-colors hover:text-blue-700" onClick={() => void handleToggleStatus(user)}>
                        启用
                      </button>
                      <button className="text-xs font-bold uppercase text-rose-600 transition-colors hover:text-rose-700">解锁</button>
                    </>
                  ) : (
                    <button className="text-xs font-bold uppercase text-primary transition-colors hover:text-blue-700">重新发送邮件</button>
                  )}
                  <button className="text-slate-400 hover:text-on-surface">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </AdminShell>
  );
}
