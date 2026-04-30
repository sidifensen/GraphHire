'use client';

import MockUserShell from '@/features/mock-user/components/MockUserShell';

export default function UserRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MockUserShell>{children}</MockUserShell>;
}
