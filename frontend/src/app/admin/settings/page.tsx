'use client';

import { useState } from 'react';

interface LocalSettings {
  allowRegister: boolean;
  maintenanceMode: boolean;
  maxUploadSizeMb: number;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<LocalSettings>({
    allowRegister: true,
    maintenanceMode: false,
    maxUploadSizeMb: 20,
  });
  const [message, setMessage] = useState<string | null>(null);

  return (
          <div className="mx-auto w-full max-w-2xl space-y-4 p-8">
        <h1 className="font-display text-2xl font-bold text-on-surface">系统设置（演示）</h1>
        {message ? <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">{message}</div> : null}
        <div className="space-y-4 rounded-xl border border-outline-variant/30 bg-white p-6 dark:border-white/10 dark:bg-black/40">
          <label className="flex items-center justify-between">
            <span>允许注册</span>
            <input
              type="checkbox"
              checked={settings.allowRegister}
              onChange={(event) => setSettings((prev) => ({ ...prev, allowRegister: event.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>维护模式</span>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(event) => setSettings((prev) => ({ ...prev, maintenanceMode: event.target.checked }))}
            />
          </label>
          <label className="flex items-center justify-between">
            <span>最大上传大小(MB)</span>
            <input
              className="w-24 rounded border px-2 py-1"
              type="number"
              min={1}
              value={settings.maxUploadSizeMb}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, maxUploadSizeMb: Number(event.target.value) || 1 }))
              }
            />
          </label>
          <button
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white"
            onClick={() => setMessage('演示模式：设置已保存（仅本地状态）')}
          >
            保存
          </button>
        </div>
      </div>
  );
}
