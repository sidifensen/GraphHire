import type { Metadata } from 'next';
import UserLayout from '@/components/layout/UserLayout';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 用户端',
};

export default function UserRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}
