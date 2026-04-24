'use client';

import { Search, ChevronDown, MoreHorizontal } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  avatar: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  type: '求职者' | '企业HR';
  joinDate: string;
  status: '活跃' | '禁用' | '待激活';
}

const mockUsers: User[] = [
  {
    id: '1',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCTm0n7uqHixniFcctOmHq67JWvkUlLmonzTvMjE-tQn73nYDfoVayhdCSdgjm_HvqQNQyxikc3fgKn97Ayz-lzJ-cPY_r8ggYBFX8ZkGZUw4AupGMLeCC3M4y5DlZAQN4hTbony-ewLqypB2nR3KQECGnzvssGA3MzKMbwkFYZeDPvjQrvdznfNbaJwhqGXeWnVc6khwZp4fsWG5ic8L22PqVNFDbn_6s9IAYRQKJqqp8F7Or4vfnwe7sYXv_nYGMctZ7uJlSZLNV2',
    name: '林晓云',
    role: '高级前端工程师',
    email: 'lin.xy@example.com',
    phone: '138****4567',
    type: '求职者',
    joinDate: '2023-10-12 14:30',
    status: '活跃',
  },
  {
    id: '2',
    avatar: 'https://avatar.vercel.sh/zhang?text=张',
    name: '张建国',
    role: '招聘总监',
    email: 'zhangjg@techcorp.com',
    phone: '139****8899',
    type: '企业HR',
    joinDate: '2023-10-10 09:15',
    status: '禁用',
  },
  {
    id: '3',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhssddVYoCPaiNXMG1l7sjoUY1CA_YJOCa2XY_ZpvlZVkyV-Kec6YGfGDgq87zJBW4WREW0FyMhkagmn4Af9AcxRP6akT8ZaQO_VEWvgimeuGTQ2I03o70jPFscs6dhJP1Hkvs28ujONEfy6_NyoticOyIkpASBoUBB_1m0TcmECE7L5m-_cSZLG3zbOSq1FHVKfpyBHNHQgVh3Z-1d9CqxPEQdeC9mqjN5nAF9-PTc_X6p-3yMR2WqxAPJg4SX2HMNGnak5NJHm3e',
    name: '陈宇',
    role: '产品经理',
    email: 'chenyu@example.com',
    phone: '158****2341',
    type: '求职者',
    joinDate: '2023-10-15 11:45',
    status: '待激活',
  },
];

export default function AdminUsersPage() {
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
              <select className="w-40 appearance-none rounded-lg border-none bg-surface py-2 pl-3 pr-8 text-sm font-medium text-on-surface focus:ring-1 focus:ring-primary dark:bg-slate-800">
                <option>全部用户类型</option>
                <option>求职者</option>
                <option>企业HR</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
            </div>
            <div className="group relative">
              <select className="w-32 appearance-none rounded-lg border-none bg-surface py-2 pl-3 pr-8 text-sm font-medium text-on-surface focus:ring-1 focus:ring-primary dark:bg-slate-800">
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
              placeholder="搜索姓名、账号或联系方式"
              className="w-full rounded-lg border-none bg-surface py-2 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:ring-1 focus:ring-primary dark:bg-slate-800"
            />
          </div>
        </div>

        <AdminDataTable
          data={mockUsers}
          pagination={{ currentPage: 1, totalPages: 10, totalItems: 124592 }}
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
                    <button className="text-xs font-bold uppercase text-primary transition-colors hover:text-blue-700">禁用</button>
                  ) : user.status === '禁用' ? (
                    <>
                      <button className="text-xs font-bold uppercase text-primary transition-colors hover:text-blue-700">启用</button>
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
