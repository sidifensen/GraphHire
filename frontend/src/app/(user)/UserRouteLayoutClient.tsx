'use client';

import MockUserShell from '@/app/(user)/_mock/components/MockUserShell';
import UserAuthGuard from '@/components/user/UserAuthGuard';

export default function UserRouteLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserAuthGuard>
      <MockUserShell>{children}</MockUserShell>
    </UserAuthGuard>
  );
}
