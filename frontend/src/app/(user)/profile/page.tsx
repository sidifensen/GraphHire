'use client';

import { useEffect, useMemo, useState } from 'react';
import { authStore } from '@/lib/stores/auth-store';
import { personApi, type PersonProfile } from '@/lib/api/person';

const defaultProfile: PersonProfile = {
  id: 0,
  userId: 0,
  realName: '',
  gender: null,
  age: null,
  phone: '',
  education: '',
  city: '',
  targetCity: '',
  expectedSalary: null,
};

export default function ProfilePage() {
  const authUser = authStore((state) => state.user);
  const [profile, setProfile] = useState<PersonProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const completeness = useMemo(() => {
    const values = [profile.realName, profile.phone, profile.education, profile.city, profile.targetCity, profile.expectedSalary];
    const filled = values.filter((item) => item !== null && item !== undefined && String(item).trim() !== '').length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await personApi.getProfile();
      setProfile(data ?? defaultProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : '个人资料加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const updateField = <K extends keyof PersonProfile>(key: K, value: PersonProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      setError('');
      await personApi.updateProfile({
        realName: profile.realName ?? '',
        gender: profile.gender === 0 ? null : (profile.gender ?? null),
        age: profile.age ?? null,
        phone: profile.phone ?? '',
        education: profile.education ?? '',
        city: profile.city ?? '',
        targetCity: profile.targetCity ?? '',
        expectedSalary: profile.expectedSalary ?? null,
      });
      setMessage('个人资料已保存');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">个人资料</h1>
          <p className="text-tertiary text-sm max-w-xl">完善您的个人档案，GraphHire 认知 AI 将为您构建专属职业图谱，实现精准人岗匹配。</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-high text-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">visibility</span>
            预览图谱
          </button>
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-shadow flex items-center gap-2" onClick={() => void handleSave()} disabled={saving}>
            <span className="material-symbols-outlined text-sm">save</span>
            {saving ? '保存中...' : '保存全部修改'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">个人资料加载中...</div>
      ) : error ? (
        <div className="py-16 text-center flex flex-col items-center gap-4">
          <p className="text-error">{error}</p>
          <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadProfile()}>重试</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full inline-block"></span>
                  基础资料
                </h2>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-surface-container-highest border-4 border-surface-container-lowest shadow-sm relative overflow-hidden flex items-center justify-center text-2xl font-bold text-primary">
                    {(profile.realName || authUser?.username || 'U').slice(0, 1)}
                  </div>
                  <span className="text-xs text-tertiary bg-surface-variant px-3 py-1 rounded-full">真实账户资料</span>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="真实姓名">
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" value={profile.realName ?? ''} onChange={(e) => updateField('realName', e.target.value)} placeholder="请输入您的姓名" />
                  </Field>
                  <Field label="性别">
                    <select className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none appearance-none" value={profile.gender ?? 0} onChange={(e) => updateField('gender', Number(e.target.value))}>
                      <option value={0}>未设置</option>
                      <option value={1}>男</option>
                      <option value={2}>女</option>
                    </select>
                  </Field>
                  <Field label="联系电话">
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" value={profile.phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="您的手机号码" />
                  </Field>
                  <Field label="年龄">
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" type="number" value={profile.age ?? ''} onChange={(e) => updateField('age', e.target.value ? Number(e.target.value) : null)} placeholder="例如：28" />
                  </Field>
                  <Field label="电子邮箱">
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" value={authUser?.username ?? ''} readOnly placeholder="登录邮箱" />
                  </Field>
                  <Field label="学历">
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" value={profile.education ?? ''} onChange={(e) => updateField('education', e.target.value)} placeholder="最高学历" />
                  </Field>
                  <Field label="所在城市">
                    <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-primary transition-colors text-sm font-medium outline-none" value={profile.city ?? ''} onChange={(e) => updateField('city', e.target.value)} placeholder="当前所在城市" />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8">
              <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2 mb-6">
                <span className="w-1 h-5 bg-secondary rounded-full inline-block"></span>
                求职意向
              </h2>
              <div className="space-y-5">
                <Field label="目标城市">
                  <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-secondary transition-colors text-sm font-medium outline-none" value={profile.targetCity ?? ''} onChange={(e) => updateField('targetCity', e.target.value)} placeholder="例如：上海, 杭州" />
                </Field>
                <Field label="期望薪资 (月薪)">
                  <input className="w-full bg-surface-container-lowest text-on-surface p-3 rounded border-b-2 border-transparent focus:border-secondary transition-colors text-sm font-medium outline-none" type="number" value={profile.expectedSalary ?? ''} onChange={(e) => updateField('expectedSalary', e.target.value ? Number(e.target.value) : null)} placeholder="例如：30000" />
                </Field>
                {message && <p className="text-sm text-primary">{message}</p>}
              </div>
            </section>

            <section className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-primary-fixed-dim opacity-20">
                <span className="material-symbols-outlined text-9xl">psychology</span>
              </div>
              <h3 className="text-sm font-headline font-bold text-primary mb-2 flex items-center gap-1 relative z-10">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                图谱认知引擎就绪
              </h3>
              <p className="text-xs text-tertiary leading-relaxed relative z-10 mb-4">
                您的资料完整度已达 {completeness}%。系统会基于真实个人资料和简历数据继续完善能力网络。
              </p>
              <div className="w-full bg-surface-variant rounded-full h-1.5 mb-1 relative z-10 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${completeness}%` }}></div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-tertiary uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
