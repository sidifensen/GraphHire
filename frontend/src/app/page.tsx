'use client';

import MockUserShell from '@/features/mock-user/components/MockUserShell';
import Home from '@/features/mock-user/pages/Home';

export default function HomePage() {
  return (
    <MockUserShell>
      <Home />
    </MockUserShell>
  );
}
