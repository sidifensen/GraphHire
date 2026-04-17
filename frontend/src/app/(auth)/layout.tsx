import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 登录注册',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-surface">
      {children}
    </div>
  );
}