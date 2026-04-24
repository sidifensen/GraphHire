'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { adminApi, type AdminSettings } from '@/lib/api/admin';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setMessage(null);
    try {
      const data = await adminApi.updateSettings(settings);
      setSettings(data);
      setMessage('设置已保存');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '保存设置失败');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar activeItem="settings" />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 bg-surface space-y-4">
          <h1 className="text-2xl font-bold">系统设置</h1>
          {message && <div className="bg-surface-container rounded-xl p-4 text-sm">{message}</div>}
          {loading || !settings ? (
            <div className="bg-surface-container-low rounded-xl p-6 text-on-surface-variant">加载中...</div>
          ) : (
            <div className="bg-surface-container-low rounded-xl p-6 space-y-4 max-w-xl">
              <label className="flex items-center justify-between">
                <span>允许注册</span>
                <input type="checkbox" checked={settings.allowRegister} onChange={(e) => setSettings({ ...settings, allowRegister: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between">
                <span>维护模式</span>
                <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
              </label>
              <label className="flex items-center justify-between">
                <span>最大上传大小(MB)</span>
                <input className="w-24 border rounded px-2 py-1" type="number" min={1} value={settings.maxUploadSizeMb} onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: Number(e.target.value) || 1 })} />
              </label>
              <button className="px-4 py-2 rounded bg-primary text-white" onClick={() => void saveSettings()}>保存</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
