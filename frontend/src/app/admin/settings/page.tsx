'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
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
    <AdminShell activeItem="settings">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">系统设置</h1>
          <p className="mt-1 text-sm text-slate-500">管理平台基础开关与上传限制配置</p>
        </section>

        {message ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">{message}</div> : null}

        {loading || !settings ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">加载中...</div>
        ) : (
          <div className="max-w-xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
            <label className="flex items-center justify-between text-sm text-slate-700">
              <span>允许注册</span>
              <input type="checkbox" checked={settings.allowRegister} onChange={(e) => setSettings({ ...settings, allowRegister: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-700">
              <span>维护模式</span>
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-700">
              <span>最大上传大小(MB)</span>
              <input
                className="w-24 rounded border border-slate-200 px-2 py-1"
                type="number"
                min={1}
                value={settings.maxUploadSizeMb}
                onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: Number(e.target.value) || 1 })}
              />
            </label>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => void saveSettings()}>
              保存
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
