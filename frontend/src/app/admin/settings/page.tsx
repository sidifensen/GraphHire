'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminSettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="settings" />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 bg-surface space-y-4">
          <h1 className="text-2xl font-bold">系统设置</h1>

          <div className="bg-surface-container-low rounded-xl p-6">
            <p className="text-on-surface-variant">系统设置功能正在开发中...</p>
          </div>
        </main>
      </div>
    </div>
  );
}