import type { Metadata } from 'next';
import UserRouteLayoutClient from '@/app/(user)/UserRouteLayoutClient';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 用户端',
};

export default function UserRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserRouteLayoutClient>{children}</UserRouteLayoutClient>;
}
