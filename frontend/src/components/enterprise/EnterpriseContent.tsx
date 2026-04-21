'use client';

interface EnterpriseContentProps {
  children: React.ReactNode;
}

export default function EnterpriseContent({ children }: EnterpriseContentProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-20 max-w-[1440px] mx-auto w-full">
      {children}
    </div>
  );
}
