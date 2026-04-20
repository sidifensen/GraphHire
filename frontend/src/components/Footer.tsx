import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 full-width border-t border-slate-100 dark:border-slate-900 shadow-none mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full mt-20 max-w-[1440px] mx-auto border-t border-slate-100 dark:border-slate-800">
        <p className="text-tertiary font-body text-xs tracking-wide">
          © 2026 GraphHire 图谱智聘. 认知导视 AI 招聘系统
        </p>
        <nav className="flex gap-6 mt-4 md:mt-0">
          <Link className="text-slate-400 hover:text-primary font-body text-xs tracking-wide hover:underline underline-offset-4 transition-all" href="#">
            关于我们
          </Link>
          <Link className="text-slate-400 hover:text-primary font-body text-xs tracking-wide hover:underline underline-offset-4 transition-all" href="#">
            联系方式
          </Link>
          <Link className="text-slate-400 hover:text-primary font-body text-xs tracking-wide hover:underline underline-offset-4 transition-all" href="#">
            服务条款
          </Link>
          <Link className="text-slate-400 hover:text-primary font-body text-xs tracking-wide hover:underline underline-offset-4 transition-all" href="#">
            隐私政策
          </Link>
        </nav>
      </div>
    </footer>
  );
}
