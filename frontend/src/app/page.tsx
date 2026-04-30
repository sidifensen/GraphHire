'use client';

import MockUserShell from '@/app/(user)/_mock/components/MockUserShell';
import Home from '@/app/(user)/_mock/pages/Home';

export default function HomePage() {
  return (
    <MockUserShell>
      <Home />
    </MockUserShell>
  );
}
