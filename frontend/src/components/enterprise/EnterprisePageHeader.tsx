'use client';

interface EnterprisePageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EnterprisePageHeader({ title, description, action }: EnterprisePageHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">企业管理</span>
        </div>
        <h2 className="text-3xl font-bold font-headline text-on-surface tracking-tight">{title}</h2>
        {description && <p className="text-on-surface-variant mt-1 text-sm">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
