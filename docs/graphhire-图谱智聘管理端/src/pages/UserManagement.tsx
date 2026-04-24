import { Search, ChevronDown, MoreHorizontal } from 'lucide-react';
import DataTable from '../components/DataTable';
import Topbar from '../components/Topbar';
import { cn } from '../lib/utils';

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
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTm0n7uqHixniFcctOmHq67JWvkUlLmonzTvMjE-tQn73nYDfoVayhdCSdgjm_HvqQNQyxikc3fgKn97Ayz-lzJ-cPY_r8ggYBFX8ZkGZUw4AupGMLeCC3M4y5DlZAQN4hTbony-ewLqypB2nR3KQECGnzvssGA3MzKMbwkFYZeDPvjQrvdznfNbaJwhqGXeWnVc6khwZp4fsWG5ic8L22PqVNFDbn_6s9IAYRQKJqqp8F7Or4vfnwe7sYXv_nYGMctZ7uJlSZLNV2',
    name: '林晓云',
    role: '高级前端工程师',
    email: 'lin.xy@example.com',
    phone: '138****4567',
    type: '求职者',
    joinDate: '2023-10-12 14:30',
    status: '活跃'
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
    status: '禁用'
  },
  {
    id: '3',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhssddVYoCPaiNXMG1l7sjoUY1CA_YJOCa2XY_ZpvlZVkyV-Kec6YGfGDgq87zJBW4WREW0FyMhkagmn4Af9AcxRP6akT8ZaQO_VEWvgimeuGTQ2I03o70jPFscs6dhJP1Hkvs28ujONEfy6_NyoticOyIkpASBoUBB_1m0TcmECE7L5m-_cSZLG3zbOSq1FHVKfpyBHNHQgVh3Z-1d9CqxPEQdeC9mqjN5nAF9-PTc_X6p-3yMR2WqxAPJg4SX2HMNGnak5NJHm3e',
    name: '陈宇',
    role: '产品经理',
    email: 'chenyu@example.com',
    phone: '158****2341',
    type: '求职者',
    joinDate: '2023-10-15 11:45',
    status: '待激活'
  }
];

export default function UserManagement() {
  return (
    <div className="flex flex-col h-full">
      <Topbar />
      
      <main className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
        <div className="mb-4">
          <h2 className="text-2xl font-bold font-display text-on-surface">用户管理</h2>
          <p className="text-sm text-outline mt-1">管理系统注册用户及求职者资料</p>
        </div>

        {/* Management Controls */}
        <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl p-4 rounded-xl border border-outline-variant/30 dark:border-white/10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select className="appearance-none bg-surface dark:bg-slate-800 border-none rounded-lg py-2 pl-3 pr-8 text-sm font-medium focus:ring-1 focus:ring-primary cursor-pointer w-40 text-on-surface">
                <option>全部用户类型</option>
                <option>求职者</option>
                <option>企业HR</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
            </div>
            <div className="relative group">
              <select className="appearance-none bg-surface dark:bg-slate-800 border-none rounded-lg py-2 pl-3 pr-8 text-sm font-medium focus:ring-1 focus:ring-primary cursor-pointer w-32 text-on-surface">
                <option>全部状态</option>
                <option>活跃</option>
                <option>禁用</option>
                <option>待激活</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none w-4 h-4" />
            </div>
          </div>
          
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="搜索姓名、账号或联系方式"
              className="w-full bg-surface dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary transition-all placeholder-outline text-on-surface"
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={mockUsers}
          pagination={{ currentPage: 1, totalPages: 10, totalItems: 124592 }}
          columns={[
            {
              header: '头像',
              accessor: (u) => (
                <div className="w-10 h-10 rounded-full border border-outline-variant dark:border-slate-800 overflow-hidden">
                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                </div>
              ),
              className: 'w-20'
            },
            {
              header: '姓名/职位',
              accessor: (u) => (
                <div>
                  <p className="text-sm font-bold text-on-surface">{u.name}</p>
                  <p className="text-[11px] text-outline mt-0.5">{u.role}</p>
                </div>
              )
            },
            {
              header: '账号/联系方式',
              accessor: (u) => (
                <div>
                  <p className="text-sm text-on-surface">{u.email}</p>
                  <p className="text-[11px] text-outline mt-0.5">{u.phone}</p>
                </div>
              )
            },
            {
              header: '用户类型',
              accessor: (u) => (
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 ring-inset uppercase",
                  u.type === '求职者' ? "bg-blue-50 text-blue-600 ring-blue-100" : "bg-purple-50 text-purple-600 ring-purple-100"
                )}>
                  {u.type}
                </span>
              )
            },
            {
              header: '注册时间',
              accessor: (u) => <span className="text-sm font-display text-on-surface">{u.joinDate}</span>
            },
            {
              header: '状态',
              accessor: (u) => (
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    u.status === '活跃' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                    u.status === '禁用' ? "bg-slate-400" : "bg-amber-400"
                  )}></span>
                  <span className={cn(
                    "text-sm font-medium",
                    u.status === '活跃' ? "text-emerald-700" : 
                    u.status === '禁用' ? "text-outline" : "text-amber-700"
                  )}>{u.status}</span>
                </div>
              )
            },
            {
              header: '操作',
              className: 'text-right',
              accessor: (u) => (
                <div className="flex justify-end gap-4">
                  {u.status === '活跃' ? (
                    <button className="text-primary hover:text-blue-700 font-bold text-xs uppercase transition-colors">禁用</button>
                  ) : u.status === '禁用' ? (
                    <>
                      <button className="text-primary hover:text-blue-700 font-bold text-xs uppercase transition-colors">启用</button>
                      <button className="text-rose-600 hover:text-rose-700 font-bold text-xs uppercase transition-colors">解锁</button>
                    </>
                  ) : (
                    <button className="text-primary hover:text-blue-700 font-bold text-xs uppercase transition-colors">重新发送邮件</button>
                  )}
                  <button className="text-slate-400 hover:text-on-surface">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              )
            }
          ]}
        />
      </main>
    </div>
  );
}
