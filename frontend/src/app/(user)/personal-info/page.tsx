'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { Camera, MapPin, ChevronDown, X } from 'lucide-react';
import { personApi, type PersonProfile } from '@/lib/api/person';
import { UPLOAD_ERRORS } from '@/lib/constants/upload-errors';
import { userAuthStore } from '@/lib/stores/auth-store';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';
import { publicApi, type PublicTreeNode } from '@/lib/api/public';
import PositionTypePickerModal from '@/components/user/PositionTypePickerModal';
import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectItem as ShadcnSelectItem,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '@/components/ui/select';

type FormState = {
  realName: string;
  gender: '' | '1' | '2';
  age: string;
  phone: string;
  email: string;
  education: string;
  school: string;
  city: string;
  targetCity: string;
  expectedSalary: string;
  expectedPositionTypeIds: number[];
  defaultPositionTypeId: string;
  avatarUrl: string;
};

const EMPTY_FORM: FormState = {
  realName: '',
  gender: '',
  age: '',
  phone: '',
  email: '',
  education: '',
  school: '',
  city: '',
  targetCity: '',
  expectedSalary: '',
  expectedPositionTypeIds: [],
  defaultPositionTypeId: '',
  avatarUrl: '',
};

const UNSET_DEFAULT_POSITION_VALUE = '__unset_default_position__';

function toFormState(profile: PersonProfile | null): FormState {
  if (!profile) {
    return { ...EMPTY_FORM };
  }
  return {
    realName: profile.realName ?? '',
    gender:
      profile.gender === 1 ? '1' : profile.gender === 2 ? '2' : '',
    age: profile.age == null ? '' : String(profile.age),
    phone: profile.phone ?? '',
    email: profile.email ?? '',
    education: profile.education ?? '',
    school: profile.school ?? '',
    city: profile.city ?? '',
    targetCity: profile.targetCity ?? '',
    expectedSalary: profile.expectedSalary == null ? '' : String(profile.expectedSalary),
    expectedPositionTypeIds: profile.expectedPositionTypeIds ?? [],
    defaultPositionTypeId: profile.defaultPositionTypeId == null ? '' : String(profile.defaultPositionTypeId),
    avatarUrl: profile.avatarUrl ?? '',
  };
}

function normalizeString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.trunc(parsed);
}

export default function PersonalInfo() {
  const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;
  const [formData, setFormData] = useState<FormState>({ ...EMPTY_FORM });
  const [positionTree, setPositionTree] = useState<PublicTreeNode[]>([]);
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    personApi
      .getProfile()
      .then((profile) => {
        if (!active) {
          return;
        }
        setFormData(toFormState(profile));
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        const errorMessage = err instanceof Error ? err.message : '加载个人资料失败';
        setError(errorMessage || '加载个人资料失败');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    publicApi.jobs
      .getPositionTypeTree()
      .then((tree) => {
        if (!active) return;
        setPositionTree(tree);
      })
      .catch(() => {
        if (!active) return;
        setPositionTree([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const setField = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const leafIdNameMap = React.useMemo(() => {
    const map = new Map<number, string>();
    const stack = [...positionTree];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (!node.children || node.children.length === 0) {
        map.set(node.id, node.name);
      } else {
        stack.push(...node.children);
      }
    }
    return map;
  }, [positionTree]);

  const selectedExpectedPositionNames = React.useMemo(
    () =>
      formData.expectedPositionTypeIds
        .map((id) => leafIdNameMap.get(id))
        .filter((name): name is string => Boolean(name)),
    [formData.expectedPositionTypeIds, leafIdNameMap],
  );

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await personApi.updateProfile({
        realName: normalizeString(formData.realName),
        gender: formData.gender ? Number(formData.gender) : null,
        age: normalizeInt(formData.age),
        phone: normalizeString(formData.phone),
        email: normalizeString(formData.email),
        education: normalizeString(formData.education),
        school: normalizeString(formData.school),
        city: normalizeString(formData.city),
        targetCity: normalizeString(formData.targetCity),
        expectedSalary: normalizeInt(formData.expectedSalary),
        expectedPositionTypeIds: formData.expectedPositionTypeIds,
        defaultPositionTypeId: formData.defaultPositionTypeId ? Number(formData.defaultPositionTypeId) : null,
      });

      const authState = userAuthStore.getState();
      if (authState.user) {
        authState.updateUser({
          displayName: formData.realName.trim() || authState.user.displayName,
          email: formData.email.trim() || authState.user.email,
          avatarUrl: formData.avatarUrl || authState.user.avatarUrl,
        });
      }

      setMessage('保存成功');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '保存失败，请稍后重试';
      setError(errorMessage || '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const isImage = file.type.toLowerCase().startsWith('image/');
    if (!isImage) {
      setError(UPLOAD_ERRORS.avatarInvalidType);
      setMessage(null);
      event.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setError(UPLOAD_ERRORS.avatarTooLarge);
      setMessage(null);
      event.target.value = '';
      return;
    }

    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      const nextAvatar = await personApi.uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatarUrl: nextAvatar }));
      const authState = userAuthStore.getState();
      if (authState.user) {
        authState.updateUser({ avatarUrl: nextAvatar });
      }
      setMessage('头像上传成功');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '头像上传失败';
      setError(errorMessage || '头像上传失败');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex min-h-screen md:min-h-[calc(100vh-4rem)] flex-col bg-surface-background px-5 md:px-8">
      <div className="md:hidden">
        <TopNav title="个人资料" />
      </div>

      <main className="mx-auto w-full max-w-7xl pb-16 pt-6 md:pt-12">
        <div className="flex gap-6 lg:gap-8">
          <UserWorkbenchSidebar />
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm font-semibold">{error}</div>
            ) : null}
            {message ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm font-semibold">{message}</div>
            ) : null}

            <section className="bg-surface-lowest rounded-2xl border border-surface-mid p-6 md:p-8 flex flex-col gap-6">
              <h2 className="text-lg md:text-2xl font-black text-on-surface border-b border-surface-low pb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                基本信息
              </h2>

              <div className="flex items-center gap-5 md:gap-8">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-surface-low flex items-center justify-center overflow-hidden border-4 border-surface-background shadow-sm relative group">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    className="w-full h-full object-cover"
                    alt="个人头像"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <Camera size={28} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={uploadInputRef}
                  data-testid="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {uploading ? '上传中...' : '更换头像'}
                </button>
                <p className="text-[10px] text-outline font-bold text-center">支持 JPG, PNG 格式</p>
              </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="姓名"
                    value={formData.realName}
                    onChange={(value) => setField('realName', value)}
                    disabled={loading}
                  />
                </div>
                <FormSelect
                  label="性别"
                  options={[
                    { label: '未设置', value: '' },
                    { label: '男', value: '1' },
                    { label: '女', value: '2' },
                  ]}
                  value={formData.gender}
                  onChange={(value) => setField('gender', value)}
                  disabled={loading}
                />
                <Input
                  label="年龄"
                  value={formData.age}
                  type="number"
                  onChange={(value) => setField('age', value)}
                  disabled={loading}
                />
                <Input
                  label="电话"
                  value={formData.phone}
                  type="tel"
                  onChange={(value) => setField('phone', value)}
                  disabled={loading}
                />
                <Input
                  label="邮箱"
                  value={formData.email}
                  type="email"
                  onChange={(value) => setField('email', value)}
                  disabled={loading}
                />
                <Input
                  label="所在城市"
                  value={formData.city}
                  icon={MapPin}
                  onChange={(value) => setField('city', value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 border-t border-surface-mid pt-6">
                <Input
                  label="最高学历"
                  value={formData.education}
                  onChange={(value) => setField('education', value)}
                  disabled={loading}
                />
                <Input
                  label="毕业学校"
                  value={formData.school}
                  onChange={(value) => setField('school', value)}
                  disabled={loading}
                />
              </div>
            </section>

            <section className="bg-surface-lowest rounded-2xl border border-surface-mid p-6 md:p-8 flex flex-col gap-6">
              <h2 className="text-lg md:text-2xl font-black text-on-surface border-b border-surface-low pb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                求职意向
              </h2>
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                <Input
                  label="目标城市"
                  value={formData.targetCity}
                  onChange={(value) => setField('targetCity', value)}
                  disabled={loading}
                />
                <Input
                  label="期望薪资"
                  value={formData.expectedSalary}
                  type="number"
                  onChange={(value) => setField('expectedSalary', value)}
                  disabled={loading}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">期望职位</span>
                  <div className="rounded-xl border border-surface-mid bg-surface-low p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-on-surface">
                        {selectedExpectedPositionNames.length > 0 ? `已选择 ${selectedExpectedPositionNames.length} 个职位` : '未选择期望职位'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPositionPicker(true)}
                        className="px-3 h-8 rounded-full border border-primary/30 text-primary text-xs font-bold hover:bg-primary/10"
                        disabled={loading}
                      >
                        选择职位
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedExpectedPositionNames.length === 0 ? (
                        <span className="text-xs text-on-surface-variant">暂无</span>
                      ) : (
                        selectedExpectedPositionNames.map((name) => (
                          <span
                            key={name}
                            className="inline-flex h-7 items-center gap-1 rounded-full border border-primary/30 bg-white px-3 text-xs text-primary"
                          >
                            {name}
                            <button
                              type="button"
                              aria-label={`移除${name}`}
                              onClick={() => {
                                const idToRemove = Array.from(leafIdNameMap.entries()).find((entry) => entry[1] === name)?.[0];
                                if (!idToRemove) return;
                                setFormData((prev) => {
                                  const nextIds = prev.expectedPositionTypeIds.filter((id) => id !== idToRemove);
                                  const keepDefault = prev.defaultPositionTypeId && nextIds.includes(Number(prev.defaultPositionTypeId));
                                  return {
                                    ...prev,
                                    expectedPositionTypeIds: nextIds,
                                    defaultPositionTypeId: keepDefault ? prev.defaultPositionTypeId : '',
                                  };
                                });
                              }}
                              className="text-primary/70 hover:text-primary"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="default-position-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    默认职位
                  </label>
                  <ShadcnSelect
                    value={formData.defaultPositionTypeId || UNSET_DEFAULT_POSITION_VALUE}
                    onValueChange={(value) => setField('defaultPositionTypeId', value === UNSET_DEFAULT_POSITION_VALUE ? '' : value)}
                    disabled={loading || formData.expectedPositionTypeIds.length === 0}
                  >
                    <ShadcnSelectTrigger
                      id="default-position-select"
                      aria-label="默认职位"
                      className="h-12 rounded-xl border border-surface-mid bg-surface-low px-4 text-sm font-medium text-on-surface focus:ring-primary/40 disabled:opacity-60"
                    >
                      <ShadcnSelectValue placeholder="未设置" />
                    </ShadcnSelectTrigger>
                    <ShadcnSelectContent>
                      <ShadcnSelectItem value={UNSET_DEFAULT_POSITION_VALUE}>未设置</ShadcnSelectItem>
                      {formData.expectedPositionTypeIds
                        .map((id) => ({ label: leafIdNameMap.get(id), value: String(id) }))
                        .filter((item): item is { label: string; value: string } => Boolean(item.label))
                        .map((item) => (
                          <ShadcnSelectItem key={item.value} value={item.value}>
                            {item.label}
                          </ShadcnSelectItem>
                        ))}
                    </ShadcnSelectContent>
                  </ShadcnSelect>
                </div>

                <div className="mt-2 rounded-2xl border border-primary/10 bg-primary/5 p-5">
                  <h4 className="mb-2 text-sm font-black uppercase tracking-wider text-primary">智能推荐优化</h4>
                  <p className="text-xs font-medium leading-relaxed text-on-surface-variant">
                    完善资料可提升职位匹配准确度，建议保持个人信息与默认简历一致。
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-surface-mid bg-surface-lowest p-5 md:p-6">
              <div className="flex items-center justify-center">
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="h-14 w-full rounded-2xl bg-primary font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60 md:max-w-[400px]"
                >
                  {saving ? '保存中...' : '保存修改'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
      <PositionTypePickerModal
        open={showPositionPicker}
        tree={positionTree}
        value={selectedExpectedPositionNames}
        onClose={() => setShowPositionPicker(false)}
        onConfirm={(selectedNames) => {
          const nextIds = selectedNames
            .map((name) => Array.from(leafIdNameMap.entries()).find((entry) => entry[1] === name)?.[0])
            .filter((id): id is number => typeof id === 'number');
          setFormData((prev) => {
            const keepDefault = prev.defaultPositionTypeId && nextIds.includes(Number(prev.defaultPositionTypeId));
            return {
              ...prev,
              expectedPositionTypeIds: nextIds,
              defaultPositionTypeId: keepDefault ? prev.defaultPositionTypeId : nextIds[0] ? String(nextIds[0]) : '',
            };
          });
          setShowPositionPicker(false);
        }}
        title="选择期望职位"
        selectedLabel="已选"
        containerTestId="personal-expected-position-modal"
        selectedTagsTestId="personal-expected-position-selected-tags"
        clearButtonText="清空"
      />
    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  type?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function Input({ label, value, type = 'text', icon: Icon, onChange, disabled = false }: InputProps) {
  const id = `input-${label}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />}
        <input
          id={id}
          aria-label={label}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full h-12 ${Icon ? 'pl-11' : 'px-4'} bg-surface-low border border-surface-mid rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-60`}
        />
      </div>
    </div>
  );
}

type SelectProps = {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function FormSelect({ label, options, value, onChange, disabled = false }: SelectProps) {
  const id = `select-${label}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full h-12 px-4 appearance-none bg-surface-low border border-surface-mid rounded-xl text-sm font-medium focus:border-primary outline-none transition-all disabled:opacity-60"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={16} />
      </div>
    </div>
  );
}
