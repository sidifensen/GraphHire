import type { Metadata } from 'next';
import UserLayoutClient from './UserLayoutClient';

export const metadata: Metadata = {
  title: 'GraphHire 图谱智聘 - 用户端',
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}