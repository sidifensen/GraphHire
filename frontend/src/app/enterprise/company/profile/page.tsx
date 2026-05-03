'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { companyApi, type CompanyProfileUpdateRequest, type IndustryOption } from '@/lib/api/company';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EnterpriseCompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<CompanyProfileUpdateRequest>({
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    description: '',
    website: '',
    industryId: 0,
    scale: '',
    address: '',
  });

  const canSubmit = useMemo(() => form.industryId > 0 && !saving, [form.industryId, saving]);

  const load = async () => {
    setLoading(true);
    try {
      const [info, options] = await Promise.all([companyApi.getInfo(), companyApi.listIndustryOptions()]);
      const enabledTree = options.filter((item) => item.enabled === 1);
      setIndustries(enabledTree);
      const fallbackParentId = enabledTree[0]?.id ?? 0;
      const fallbackChildId = enabledTree[0]?.children?.[0]?.id ?? 0;
      const currentIndustryId = info.industryId ?? fallbackChildId;
      const currentParent = enabledTree.find((p) => (p.children ?? []).some((c) => c.id === currentIndustryId));
      const currentParentId = currentParent?.id ?? fallbackParentId;
      setSelectedParentId(currentParentId);
      setForm({
        name: info.name ?? '',
        contactName: info.contactName ?? '',
        contactPhone: info.contactPhone ?? '',
        contactEmail: info.contactEmail ?? '',
        description: info.description ?? '',
        website: info.website ?? '',
        industryId: currentIndustryId,
        scale: info.scale ?? '',
        address: info.address ?? '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setMessage(null);
    try {
      await companyApi.updateProfile(form);
      setMessage('保存成功');
    } catch (error) {
      const text = error instanceof Error ? error.message : '保存失败';
      setMessage(text);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-outline">加载中...</div>;
  }

  const selectedParent = industries.find((item) => item.id === selectedParentId) ?? null;
  const childOptions = selectedParent?.children?.filter((item) => item.enabled === 1) ?? [];

  return (
    <main className="w-full max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <h1 className="text-2xl font-bold text-on-surface mb-2">公司资料</h1>
      <p className="text-sm text-on-surface-variant mb-6">仅企业主可编辑公司资料。</p>

      <form onSubmit={(event) => void onSubmit(event)} className="rounded-xl border border-outline-variant/40 bg-surface p-5 md:p-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">公司名称</span>
          <input value={form.name ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">所属行业</span>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Select
              value={String(selectedParentId)}
              onValueChange={(value) => {
                const nextParentId = Number(value);
                setSelectedParentId(nextParentId);
                const nextParent = industries.find((item) => item.id === nextParentId);
                const firstChild = nextParent?.children?.find((child) => child.enabled === 1);
                setForm((prev) => ({ ...prev, industryId: firstChild?.id ?? 0 }));
              }}
            >
              <SelectTrigger className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm">
                <SelectValue placeholder="选择一级行业" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.id} value={String(industry.id)}>{industry.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(form.industryId)}
              onValueChange={(value) => setForm((prev) => ({ ...prev, industryId: Number(value) }))}
            >
              <SelectTrigger className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm">
                <SelectValue placeholder="选择二级行业" />
              </SelectTrigger>
              <SelectContent>
                {childOptions.map((industry) => (
                  <SelectItem key={industry.id} value={String(industry.id)}>{industry.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">企业规模</span>
          <input value={form.scale ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, scale: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">联系人</span>
          <input value={form.contactName ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">联系电话</span>
          <input value={form.contactPhone ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">联系邮箱</span>
          <input value={form.contactEmail ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">公司官网</span>
          <input value={form.website ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">公司地址</span>
          <input value={form.address ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-on-surface-variant">公司简介</span>
          <textarea value={form.description ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="w-full min-h-[120px] rounded-lg border border-outline-variant/40 px-3 py-2 text-sm" />
        </label>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-on-surface-variant">{message ?? ''}</span>
          <button type="submit" disabled={!canSubmit} className="rounded-lg bg-primary text-white px-5 py-2 text-sm font-semibold disabled:opacity-60">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </main>
  );
}
