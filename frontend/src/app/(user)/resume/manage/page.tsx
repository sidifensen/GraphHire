'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { resumeApi, type Resume } from '@/lib/api/resume';

function getStatusText(status: Resume['status']) {
  switch (status) {
    case 'COMPLETED':
      return '解析成功';
    case 'PROCESSING':
      return '解析中';
    case 'FAILED':
      return '解析失败';
    default:
      return '待解析';
  }
}

function getStatusColor(status: Resume['status']) {
  switch (status) {
    case 'COMPLETED':
      return 'text-primary';
    case 'PROCESSING':
      return 'text-secondary';
    case 'FAILED':
      return 'text-error';
    default:
      return 'text-tertiary';
  }
}

function formatResumeTime(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return '-';
  }
  return new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
}

export default function ManagePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await resumeApi.getMyResumes();
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '简历加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadResumes();
  }, []);

  const handleDelete = async (id: number) => {
    await resumeApi.delete(id);
    await loadResumes();
  };

  const handleSetDefault = async (id: number) => {
    await resumeApi.setDefault(id);
    await loadResumes();
  };

  const handleReparse = async (resume: Resume) => {
    if (resume.status === 'PROCESSING') {
      return;
    }
    await resumeApi.parse(resume.id);
    await loadResumes();
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewOpen(false);
    setPreviewLoading(false);
    setPreviewError('');
    setPreviewFileName('');
    setPreviewType('');
    setPreviewUrl('');
  };

  const handlePreview = async (resume: Resume) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewFileName(resume.fileName);

    try {
      const previewData = await resumeApi.preview(resume.id);
      const url = URL.createObjectURL(previewData.blob);
      setPreviewUrl(url);
      setPreviewType(previewData.contentType.toLowerCase());
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : '预览加载失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col h-full overflow-y-auto relative p-4 md:p-8">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tighter">简历管理</h1>
          <p className="text-sm text-tertiary mt-2">管理您的数字资产，AI 将深度解析您的职业图谱。</p>
        </div>
        <Link href="/resume/upload" className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-medium text-sm hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.15)] transition-all duration-300">
          <span className="material-symbols-outlined">cloud_upload</span>
          上传新简历
        </Link>
      </header>

      <div className="pb-12 max-w-5xl">
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant">简历数据加载中...</div>
          ) : error ? (
            <div className="text-center py-16 flex flex-col items-center gap-4">
              <p className="text-error">{error}</p>
              <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadResumes()}>重试</button>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">暂无简历，请先上传真实简历文件。</div>
          ) : (
            resumes.map((resume) => (
              <div key={resume.id} className="group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-surface-container-lowest rounded-xl hover:shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] border border-surface-variant transition-all duration-300 gap-6">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-2xl">description</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-on-surface truncate font-headline">{resume.fileName}</h3>
                      {resume.isDefault && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary-fixed text-on-primary-fixed shrink-0">默认简历</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-tertiary flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {formatResumeTime(resume.createdAt)}
                      </span>
                      <span className={`flex items-center gap-1 ${getStatusColor(resume.status)}`}>
                        <span className="material-symbols-outlined text-[16px]">{resume.status === 'PROCESSING' ? 'autorenew' : resume.status === 'FAILED' ? 'error' : resume.status === 'PENDING' ? 'hourglass' : 'check_circle'}</span>
                        {getStatusText(resume.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 flex-wrap">
                  {!resume.isDefault && (
                    <button className="px-4 py-2 text-sm font-medium text-tertiary hover:text-primary bg-transparent hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-1" onClick={() => void handleSetDefault(resume.id)}>
                      设为默认
                    </button>
                  )}
                  {['FAILED', 'COMPLETED', 'PROCESSING'].includes(resume.status) && (
                    <button
                      className="px-4 py-2 text-sm font-medium text-primary bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1 disabled:text-tertiary disabled:cursor-not-allowed"
                      disabled={resume.status === 'PROCESSING'}
                      onClick={() => void handleReparse(resume)}
                    >
                      重新解析
                    </button>
                  )}
                  <button className="px-4 py-2 text-sm font-medium text-primary bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1" onClick={() => void handlePreview(resume)}>
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    预览
                  </button>
                  <button className="p-2 text-tertiary hover:text-error hover:bg-error-container/50 rounded-lg transition-colors" onClick={() => void handleDelete(resume.id)}>
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 px-5 border-b border-surface-variant flex items-center justify-between shrink-0">
              <div className="font-medium text-on-surface truncate pr-4">简历预览 · {previewFileName}</div>
              <button
                className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center text-tertiary"
                onClick={closePreview}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 bg-surface p-4 md:p-6 overflow-auto">
              {(() => {
                const isPdfPreview = previewType.includes('pdf') || previewFileName.toLowerCase().endsWith('.pdf');
                return (
                  <>
              {previewLoading && (
                <div className="h-full flex items-center justify-center text-tertiary">预览加载中...</div>
              )}

              {!previewLoading && previewError && (
                <div className="h-full flex items-center justify-center flex-col gap-4">
                  <p className="text-error">{previewError}</p>
                  <button
                    className="px-5 py-2 rounded-lg bg-primary text-white"
                    onClick={closePreview}
                  >
                    关闭
                  </button>
                </div>
              )}

              {!previewLoading && !previewError && previewUrl && isPdfPreview && (
                <iframe
                  src={previewUrl}
                  title="简历预览"
                  className="w-full h-full rounded-xl border border-surface-variant bg-white"
                />
              )}

              {!previewLoading && !previewError && previewUrl && !isPdfPreview && (
                <div className="h-full flex items-center justify-center flex-col gap-4 text-center">
                  <p className="text-on-surface">当前文件类型暂不支持内嵌预览</p>
                  <a
                    className="px-5 py-2 rounded-lg bg-primary text-white inline-flex items-center gap-2"
                    href={previewUrl}
                    download={previewFileName}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    下载查看
                  </a>
                </div>
              )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
