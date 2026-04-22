'use client';

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <main className="flex-grow">{children}</main>
    </div>
  );
}