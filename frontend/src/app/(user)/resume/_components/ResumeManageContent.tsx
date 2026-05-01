'use client';

import React, { useMemo, useRef, useState } from 'react';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { CheckCircle, Clock, Trash2, Eye, CloudUpload, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { resumeApi, type Resume } from '@/lib/api/resume';
import { UPLOAD_ERRORS } from '@/lib/constants/upload-errors';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';

function formatDate(value?: string) {
  if (!value) {
    return '时间未知';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('zh-CN', { hour12: false });
}

type ActionState = {
  settingDefaultId?: number;
  parsingId?: number;
  deletingId?: number;
  previewingId?: number;
};

function statusMeta(status: Resume['status']) {
  if (status === 'COMPLETED') {
    return {
      text: '已成功解析',
      className: 'bg-green-500/10 text-green-500 border border-green-500/20',
      isParsing: false,
      isFailed: false,
    };
  }
  if (status === 'FAILED') {
    return {
      text: '解析失败',
      className: 'bg-red-500/10 text-red-500 border border-red-500/20',
      isParsing: false,
      isFailed: true,
    };
  }
  if (status === 'PROCESSING') {
    return {
      text: '深度解析中...',
      className: 'bg-tertiary/10 text-tertiary border border-tertiary/20',
      isParsing: true,
      isFailed: false,
    };
  }
  return {
    text: '待解析',
    className: 'bg-surface-mid text-on-surface-variant border border-surface-mid',
    isParsing: false,
    isFailed: false,
  };
}

export default function ResumeManageContent() {
  const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_RESUME_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);
  const ALLOWED_RESUME_EXTENSIONS = new Set(['pdf', 'doc', 'docx']);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({});
  const [previewModal, setPreviewModal] = useState<{
    fileName: string;
    url: string;
  } | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const closePreviewModal = React.useCallback(() => {
    setPreviewModal((prev) => {
      if (prev?.url) {
        window.URL.revokeObjectURL(prev.url);
      }
      return null;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (previewModal?.url) {
        window.URL.revokeObjectURL(previewModal.url);
      }
    };
  }, [previewModal]);

  const loadResumes = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await resumeApi.getMyResumes();
      setResumes(list);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '加载简历失败';
      setError(errorMessage || '加载简历失败');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadResumes();
  }, [loadResumes]);

  const sortedResumes = useMemo(() => {
    return [...resumes].sort((a, b) => {
      if (a.isDefault && !b.isDefault) {
        return -1;
      }
      if (!a.isDefault && b.isDefault) {
        return 1;
      }
      const bTime = Number.isNaN(new Date(b.createdAt).getTime()) ? 0 : new Date(b.createdAt).getTime();
      const aTime = Number.isNaN(new Date(a.createdAt).getTime()) ? 0 : new Date(a.createdAt).getTime();
      return bTime - aTime;
    });
  }, [resumes]);

  const runAction = async (runner: () => Promise<void>) => {
    setError(null);
    setMessage(null);
    try {
      await runner();
      await loadResumes();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '操作失败，请稍后重试';
      setError(errorMessage || '操作失败，请稍后重试');
    }
  };

  const handleSetDefault = async (resumeId: number) => {
    setActionState((prev) => ({ ...prev, settingDefaultId: resumeId }));
    await runAction(async () => {
      await resumeApi.setDefault(resumeId);
      setMessage('默认简历已更新');
    });
    setActionState((prev) => ({ ...prev, settingDefaultId: undefined }));
  };

  const handleParse = async (resumeId: number) => {
    setActionState((prev) => ({ ...prev, parsingId: resumeId }));
    await runAction(async () => {
      await resumeApi.parse(resumeId);
      setMessage('已触发重新解析');
    });
    setActionState((prev) => ({ ...prev, parsingId: undefined }));
  };

  const handleDelete = async (resumeId: number) => {
    setActionState((prev) => ({ ...prev, deletingId: resumeId }));
    await runAction(async () => {
      await resumeApi.delete(resumeId);
      setMessage('简历已删除');
    });
    setActionState((prev) => ({ ...prev, deletingId: undefined }));
  };

  const handlePreview = async (resume: Resume) => {
    setActionState((prev) => ({ ...prev, previewingId: resume.id }));
    try {
      const previewData = await resumeApi.preview(resume.id);
      const url = window.URL.createObjectURL(previewData.blob);
      setPreviewModal((prev) => {
        if (prev?.url) {
          window.URL.revokeObjectURL(prev.url);
        }
        return {
          fileName: resume.fileName,
          url,
        };
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '预览失败';
      setError(errorMessage || '预览失败');
    } finally {
      setActionState((prev) => ({ ...prev, previewingId: undefined }));
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_RESUME_EXTENSIONS.has(extension) || !ALLOWED_RESUME_MIME_TYPES.has(mimeType)) {
      setError(UPLOAD_ERRORS.resumeInvalidType);
      setMessage(null);
      event.target.value = '';
      return;
    }
    if (file.size > MAX_RESUME_FILE_SIZE) {
      setError(UPLOAD_ERRORS.resumeTooLarge);
      setMessage(null);
      event.target.value = '';
      return;
    }

    setUploading(true);
    setUploadPercent(0);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await resumeApi.uploadWithProgress(formData, (percent) => {
        setUploadPercent(percent);
      });
      setMessage('简历上传成功');
      await loadResumes();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '上传失败';
      setError(errorMessage || '上传失败');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="md:hidden">
        <TopNav title="简历管理" />
      </div>

      <main className="flex-1 px-5 pt-6 pb-16 md:pt-12 md:pb-16 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex gap-6 lg:gap-8">
          <UserWorkbenchSidebar />
          <section className="flex-1">
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
            ) : null}
            {message ? (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>
            ) : null}

            {loading ? (
              <div className="text-sm text-on-surface-variant">简历加载中...</div>
            ) : null}

            <div className="divide-y divide-surface-mid overflow-hidden rounded-2xl border border-surface-mid bg-surface-lowest">
              {sortedResumes.map((resume) => {
                const meta = statusMeta(resume.status);
                const parsing = actionState.parsingId === resume.id;
                const settingDefault = actionState.settingDefaultId === resume.id;
                const deleting = actionState.deletingId === resume.id;
                const previewing = actionState.previewingId === resume.id;

                return (
                  <div
                    key={resume.id}
                    data-testid="resume-row"
                    className={`flex flex-col gap-4 px-4 py-4 md:px-6 lg:grid lg:grid-cols-[2.1fr_1.1fr_1fr] lg:items-center lg:gap-6 ${
                      resume.isDefault ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="truncate text-base font-bold text-on-surface md:text-lg">{resume.fileName}</h2>
                        {resume.isDefault ? (
                          <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white md:text-xs">默认</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-on-surface-variant md:text-sm">{formatDate(resume.createdAt)}</p>
                    </div>

                    <div className="flex items-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold md:text-sm ${meta.className}`}>
                        {meta.isParsing || parsing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
                          >
                            <Clock size={16} />
                          </motion.div>
                        ) : meta.isFailed ? (
                          <XCircle size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        {parsing ? '触发解析中...' : meta.text}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                      {!resume.isDefault && resume.status === 'COMPLETED' ? (
                        <button
                          aria-label={`设为默认-${resume.id}`}
                          onClick={() => void handleSetDefault(resume.id)}
                          disabled={settingDefault}
                          className="flex items-center gap-1 text-xs font-bold text-on-surface-variant transition-colors hover:text-primary disabled:opacity-60 md:text-sm"
                        >
                          <CheckCircle size={14} className="md:hidden" />
                          {settingDefault ? '设置中...' : '设为默认'}
                        </button>
                      ) : null}

                      <button
                        aria-label={`重新解析-${resume.id}`}
                        onClick={() => void handleParse(resume.id)}
                        disabled={resume.status === 'PROCESSING' || parsing}
                        className="flex items-center gap-1 text-xs font-bold text-outline transition-colors hover:text-primary disabled:opacity-60 md:text-sm"
                      >
                        <Clock size={14} />
                        {parsing ? '解析中...' : '重新解析'}
                      </button>

                      <button
                        onClick={() => void handleDelete(resume.id)}
                        disabled={deleting}
                        className="group flex items-center gap-1 text-xs font-bold text-on-surface-variant transition-colors hover:text-error disabled:opacity-60 md:text-sm"
                      >
                        <Trash2 size={16} className="transition-transform group-hover:scale-110" />
                        <span>{deleting ? '删除中...' : '删除'}</span>
                      </button>
                      <button
                        onClick={() => void handlePreview(resume)}
                        disabled={previewing}
                        className="group flex items-center gap-2 text-xs font-bold text-primary disabled:opacity-60 md:text-sm"
                      >
                        <Eye size={16} className="transition-transform group-hover:scale-110" />
                        <span>{previewing ? '打开中...' : '预览解析'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="mt-6 rounded-2xl border border-surface-mid bg-surface-lowest p-5 md:p-6">
              <div className="flex items-center justify-center">
                <input
                  ref={uploadInputRef}
                  data-testid="resume-upload-input"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleUpload}
                />
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 hover:bg-primary/90 disabled:opacity-60 md:h-16 md:max-w-[400px] md:rounded-3xl md:text-lg"
                >
                  <CloudUpload size={20} className="md:size-6" />
                  {uploading ? `上传中 ${uploadPercent}%` : '上传新简历文件'}
                </button>
              </div>
            </section>
          </section>
        </div>
      </main>

      {previewModal ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="关闭简历预览"
            className="absolute inset-0 bg-black/45"
            onClick={closePreviewModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="简历预览弹窗"
            className="relative w-full max-w-5xl rounded-2xl bg-surface-lowest border border-surface-mid shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-mid">
              <p className="text-sm md:text-base font-bold text-on-surface truncate pr-3">{previewModal.fileName}</p>
              <button
                type="button"
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={closePreviewModal}
              >
                关闭
              </button>
            </div>
            <div className="h-[70vh] bg-surface">
              <iframe
                title="简历预览内容"
                src={previewModal.url}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
