export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-8 py-3 bg-[#F8F9FF] border-b border-gray-200 shadow-sm z-10 sticky top-0 min-h-[64px]">
        <div className="flex items-center gap-12">
          {/* Brand */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-black text-[#003DA6] font-headline tracking-tight">GraphHire</h1>
            <span className="text-sm text-tertiary font-medium">企业管理中心</span>
          </div>
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-['Manrope'] antialiased tracking-tight text-sm">
            <a className="text-[#003DA6] font-bold border-b-2 border-[#003DA6] pb-1 hover:text-[#0052D9] transition-all duration-300" href="/enterprise/dashboard">Dashboard</a>
            <a className="text-[#394851] hover:text-[#0052D9] transition-colors pb-1 border-b-2 border-transparent duration-300" href="/enterprise/jobs">职位管理</a>
            <a className="text-[#394851] hover:text-[#0052D9] transition-colors pb-1 border-b-2 border-transparent duration-300" href="#">候选人推荐</a>
            <a className="text-[#394851] hover:text-[#0052D9] transition-colors pb-1 border-b-2 border-transparent duration-300" href="#">员工管理</a>
            <a className="text-[#394851] hover:text-[#0052D9] transition-colors pb-1 border-b-2 border-transparent duration-300" href="#">设置</a>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[#003DA6]">
          <button className="hover:bg-blue-50 p-2 rounded-full transition-colors opacity-80 scale-[0.98]">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:bg-blue-50 p-2 rounded-full transition-colors opacity-80 scale-[0.98]">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}