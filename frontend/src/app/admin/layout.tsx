export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* TopAppBar - Admin Theme (using tertiary color as accent) */}
      <header className="flex justify-between items-center w-full px-8 py-3 bg-[#243142] border-b border-inverse-surface shadow-md z-10 sticky top-0 min-h-[64px]">
        <div className="flex items-center gap-12">
          {/* Brand */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-black text-white font-headline tracking-tight">GraphHire</h1>
            <span className="text-sm text-surface-dim font-medium">管理后台</span>
          </div>
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-['Manrope'] antialiased tracking-tight text-sm">
            <a className="text-white font-bold border-b-2 border-surface-dim pb-1 hover:text-primary-fixed transition-all duration-300" href="#">概览</a>
            <a className="text-surface-dim hover:text-white transition-colors pb-1 border-b-2 border-transparent duration-300" href="#">用户管理</a>
            <a className="text-surface-dim hover:text-white transition-colors pb-1 border-b-2 border-transparent duration-300" href="#">企业审核</a>
            <a className="text-surface-dim hover:text-white transition-colors pb-1 border-b-2 border-transparent duration-300" href="#">数据统计</a>
            <a className="text-surface-dim hover:text-white transition-colors pb-1 border-b-2 border-transparent duration-300" href="#">系统设置</a>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-white">
          <button className="hover:bg-inverse-surface p-2 rounded-full transition-colors opacity-80 scale-[0.98]">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:bg-inverse-surface p-2 rounded-full transition-colors opacity-80 scale-[0.98]">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}