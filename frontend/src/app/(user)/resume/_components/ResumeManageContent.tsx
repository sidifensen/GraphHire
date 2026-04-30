'use client';

import React, { useMemo, useRef, useState } from 'react';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { CheckCircle, Clock, Trash2, Eye, CloudUpload, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { resumeApi, type Resume } from '@/lib/api/resume';

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
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>({});
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

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

  const handlePreview = async (resumeId: number) => {
    setActionState((prev) => ({ ...prev, previewingId: resumeId }));
    try {
      const previewData = await resumeApi.preview(resumeId);
      const url = window.URL.createObjectURL(previewData.blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);
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
      <TopNav title="简历管理" />

      <main className="flex-1 px-5 pt-6 pb-32 md:pt-12 md:pb-24 max-w-7xl mx-auto w-full">
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>
        ) : null}

        {loading ? (
          <div className="text-sm text-on-surface-variant">简历加载中...</div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {sortedResumes.map((resume) => {
            const meta = statusMeta(resume.status);
            const parsing = actionState.parsingId === resume.id;
            const settingDefault = actionState.settingDefaultId === resume.id;
            const deleting = actionState.deletingId === resume.id;
            const previewing = actionState.previewingId === resume.id;

            return (
              <div
                key={resume.id}
                className={`bg-surface-lowest rounded-2xl md:rounded-3xl shadow-sm border border-surface-mid p-5 md:p-8 flex flex-col gap-4 md:gap-6 relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                  resume.isDefault ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-outline-variant'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-on-surface truncate text-base md:text-lg">{resume.fileName}</h2>
                    {resume.isDefault ? (
                      <span className="bg-primary text-white text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full">默认</span>
                    ) : null}
                  </div>
                  <p className="text-xs md:text-sm text-on-surface-variant">{formatDate(resume.createdAt)}</p>
                </div>

                <div className="flex items-center">
                  <span className={`text-xs md:text-sm font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 ${meta.className}`}>
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

                <hr className="border-surface-mid" />

                <div className="flex flex-wrap justify-between items-center gap-3">
                  {!resume.isDefault && resume.status === 'COMPLETED' ? (
                    <button
                      aria-label={`设为默认-${resume.id}`}
                      onClick={() => void handleSetDefault(resume.id)}
                      disabled={settingDefault}
                      className="text-xs md:text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-60"
                    >
                      <CheckCircle size={14} className="md:hidden" />
                      {settingDefault ? '设置中...' : '设为默认'}
                    </button>
                  ) : null}

                  <button
                    aria-label={`重新解析-${resume.id}`}
                    onClick={() => void handleParse(resume.id)}
                    disabled={resume.status === 'PROCESSING' || parsing}
                    className="text-xs md:text-sm font-bold text-outline hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-60"
                  >
                    <Clock size={14} />
                    {parsing ? '解析中...' : '重新解析'}
                  </button>

                  <div className="flex gap-4 ml-auto">
                    <button
                      onClick={() => void handleDelete(resume.id)}
                      disabled={deleting}
                      className="text-xs md:text-sm font-bold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 group disabled:opacity-60"
                    >
                      <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      <span>{deleting ? '删除中...' : '删除'}</span>
                    </button>
                    <button
                      onClick={() => void handlePreview(resume.id)}
                      disabled={previewing}
                      className="text-xs md:text-sm font-bold text-primary flex items-center gap-2 group disabled:opacity-60"
                    >
                      <Eye size={16} className="group-hover:scale-110 transition-transform" />
                      <span>{previewing ? '打开中...' : '预览解析'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full min-h-[80px] bg-surface-lowest/90 backdrop-blur-md border-t border-surface-mid z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe md:rounded-t-[32px]">
        <div className="max-w-7xl mx-auto w-full p-5 md:p-8 md:px-12 flex flex-col md:flex-row items-center justify-center gap-3">
          <input
            ref={uploadInputRef}
            data-testid="resume-upload-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploading}
            className="w-full md:max-w-[400px] bg-primary text-white font-bold py-4 md:h-16 md:text-lg rounded-2xl md:rounded-3xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            <CloudUpload size={20} className="md:size-6" />
            {uploading ? `上传中 ${uploadPercent}%` : '上传新简历文件'}
          </button>
        </div>
      </div>
    </div>
  );
}
