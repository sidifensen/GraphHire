'use client';

import MockUserShell from '@/app/(user)/_mock/components/MockUserShell';

export default function UserRouteLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MockUserShell>{children}</MockUserShell>;
}
