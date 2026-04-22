'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { resumeApi, Resume } from '@/lib/api/resume';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

interface ParsedResult {
  name: string;
  title: string;
  company?: string;
  skills: string[];
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const [resumeId, setResumeId] = useState<number | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('请上传 PDF 或 Word 格式的简历文件');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setError(null);

    // Start upload
    uploadFile(file);
  }, []);

  const uploadFile = async (file: File) => {
    setStatus('uploading');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use axios onUploadProgress for real upload progress
      const result = await resumeApi.uploadWithProgress(formData, (percent: number) => {
        setProgress(Math.min(percent, 90)); // Reserve 10% for processing phase
      });

      setProgress(95);
      setResumeId(result.id);

      setStatus('processing');

      // Poll for real parsing progress from backend
      await pollParseStatus(result.id);
    } catch (err: any) {
      setStatus('failed');
      const message = err.response?.data?.message || err.message || '上传失败，请重试';
      setError(message);
    }
  };

  const pollParseStatus = async (id: number) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const progress = await resumeApi.getParseProgress(id);

        if (progress.status === 'SUCCESS') {
          setStatus('completed');
          setProgress(100);
          setParsedResult({
            name: progress.step || '解析完成',
            title: '简历解析完成',
            skills: [],
          });
          return;
        }

        if (progress.status === 'FAILED') {
          setStatus('failed');
          setError(progress.errorMessage || '简历解析失败，请尝试重新上传');
          return;
        }

        if (progress.status === 'RUNNING') {
          setStatus('processing');
          setProgress(progress.progress);
        }

        if (progress.status === 'PENDING') {
          setStatus('processing');
          setProgress(progress.progress);
        }

        if (attempts >= maxAttempts) {
          setStatus('failed');
          setError('解析超时，请稍后刷新页面查看结果');
          return;
        }

        attempts++;
        setTimeout(poll, 2000);
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          setStatus('failed');
          setError('查询解析进度失败，请稍后刷新页面');
          return;
        }
        setTimeout(poll, 3000);
      }
    };

    await poll();
  };

  const handleReupload = () => {
    setStatus('idle');
    setFileName('');
    setFileSize(0);
    setProgress(0);
    setError(null);
    setParsedResult(null);
    setResumeId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    router.push('/resume/manage');
  };

  // Idle state - file selection area
  if (status === 'idle') {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-8">
          <div className="w-full max-w-6xl mb-6">
            <a href="/resume/manage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-primary font-medium bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              <span>返回</span>
            </a>
          </div>

          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-1 lg:col-span-7 flex flex-col">
              <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">解析您的职业履历</h1>
              <p className="text-on-surface-variant mb-8 text-lg">AI 认知引擎正在为您构建多维度的能力图谱。</p>

              <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-outline-variant rounded-2xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                  </div>
                  <h3 className="text-xl font-medium text-on-surface mb-2">点击选择简历文件</h3>
                  <p className="text-on-surface-variant">支持 PDF、Word 格式，最大 10MB</p>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-error-container rounded-xl text-error text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Right column - tips */}
            <div className="col-span-1 lg:col-span-5 flex flex-col justify-start">
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] p-8">
                <h3 className="text-lg font-medium text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                  上传须知
                </h3>
                <ul className="space-y-4 text-on-surface-variant">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                    <span>支持 PDF、DOC、DOCX 格式简历</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                    <span>文件大小不超过 10MB</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                    <span>AI 将提取工作经历、技能和教育背景</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                    <span>解析完成后可手动核对修改</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Uploading/Processing state
  if (status === 'uploading' || status === 'processing') {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-8">
          <div className="w-full max-w-6xl mb-6">
            <a href="/resume/manage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-primary font-medium bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              <span>返回</span>
            </a>
          </div>

          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-1 lg:col-span-7 flex flex-col">
              <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">解析您的职业履历</h1>
              <p className="text-on-surface-variant mb-8 text-lg">AI 认知引擎正在为您构建多维度的能力图谱。</p>

              <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* File Info Card */}
                <div className="flex items-center bg-surface-container-low p-5 rounded-2xl mb-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mr-5">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-on-surface text-base">{fileName}</h3>
                    <p className="text-on-surface-variant text-sm mt-0.5">{formatFileSize(fileSize)} • PDF 文档</p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center text-primary">
                    {status === 'uploading' ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">check_circle</span>
                    )}
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-medium text-primary bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] animate-spin">memory</span>
                      {status === 'uploading' ? '正在上传...' : 'AI 认知引擎解析中...'}
                    </span>
                    <span className="text-4xl font-headline font-bold text-primary tracking-tighter">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                      <div className="absolute inset-0 bg-white/20 w-1/2 translate-x-[-100%] skew-x-[-20deg]"></div>
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-0 pl-2">
                  {/* Step 1: Success */}
                  <div className="flex gap-6 relative">
                    <div className="w-0.5 bg-primary absolute left-[11px] top-7 bottom-[-16px]"></div>
                    <div className="relative z-10 flex flex-col items-center mt-1">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[14px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      </div>
                    </div>
                    <div className="pb-8">
                      <p className="text-on-surface font-medium text-base">文件上传成功</p>
                      <p className="text-on-surface-variant text-sm mt-1">已安全传输至 GraphHire 加密存储</p>
                    </div>
                  </div>

                  {/* Step 2: Active */}
                  <div className="flex gap-6 relative">
                    <div className={`w-0.5 absolute left-[11px] top-7 bottom-[-16px] ${status === 'processing' ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>
                    <div className="relative z-10 flex flex-col items-center mt-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 ${status === 'processing' ? 'bg-surface-container-lowest outline-2 outline-primary ring-primary-fixed/50' : 'bg-surface-container-high'}`}>
                        {status === 'processing' ? (
                          <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-tertiary rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="pb-8">
                      <p className={`font-medium text-base ${status === 'processing' ? 'text-primary' : 'text-on-surface'}`}>文本结构化处理与语义抽取</p>
                      <p className="text-on-surface-variant text-sm mt-1">正在识别工作经历、项目角色与核心技能边界</p>
                    </div>
                  </div>

                  {/* Step 3: Pending */}
                  <div className="flex gap-6">
                    <div className="relative z-10 flex flex-col items-center mt-1">
                      <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-tertiary rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-tertiary font-medium text-base">生成多维认知图谱</p>
                      <p className="text-outline text-sm mt-1">即将建立技能节点映射与行业对齐标量</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - processing preview */}
            <div className="col-span-1 lg:col-span-5 flex flex-col justify-start">
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden relative h-full flex flex-col">
                <div className="h-24 bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/10 text-[8rem] absolute -right-4 -bottom-4">hub</span>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest"></div>
                  <p className="text-sm font-medium text-tertiary tracking-widest uppercase z-10">解析进行中</p>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-8">
                    <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">正在分析</div>
                    <div className="flex items-end gap-4">
                      <h2 className="text-3xl font-headline font-bold text-on-surface">{fileName}</h2>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-[18px]">hourglass</span>
                      <span>AI 正在解析中，请稍候...</span>
                    </div>
                  </div>

                  <div className="mb-auto">
                    <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">解析进度</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                        <span className="text-on-surface">文件格式验证</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`material-symbols-outlined text-[16px] ${status === 'processing' ? 'text-primary animate-spin' : 'text-outline'}`}>
                          {status === 'processing' ? 'progress_activity' : 'pending'}
                        </span>
                        <span className={status === 'processing' ? 'text-on-surface' : 'text-outline'}>文本结构提取</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-outline">
                        <span className="material-symbols-outlined text-[16px]">pending</span>
                        <span>技能图谱构建</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
        <main className="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-8">
          <div className="w-full max-w-6xl mb-6">
            <a href="/resume/manage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-primary font-medium bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              <span>返回</span>
            </a>
          </div>

          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-1 lg:col-span-7 flex flex-col">
              <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">解析您的职业履历</h1>
              <p className="text-on-surface-variant mb-8 text-lg">AI 认知引擎正在为您构建多维度的能力图谱。</p>

              <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-error/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Error Card */}
                <div className="flex items-center bg-error-container p-5 rounded-2xl mb-6">
                  <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center text-error mr-5">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-on-surface text-base">上传失败</h3>
                    <p className="text-error text-sm mt-0.5">{error || '未知错误'}</p>
                  </div>
                </div>

                {/* Retry Upload Area */}
                <div
                  className="border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={handleReupload}
                >
                  <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-on-surface-variant text-2xl">refresh</span>
                  </div>
                  <h3 className="text-lg font-medium text-on-surface mb-1">重新上传</h3>
                  <p className="text-on-surface-variant text-sm">点击重新选择简历文件</p>
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-5 flex flex-col justify-start">
              <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] p-8">
                <h3 className="text-lg font-medium text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">info</span>
                  常见问题
                </h3>
                <ul className="space-y-3 text-on-surface-variant text-sm">
                  <li>• 文件格式不支持，请上传 PDF 或 Word 文档</li>
                  <li>• 文件过大，请确保文件小于 10MB</li>
                  <li>• 网络连接不稳定，请检查网络后重试</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Completed state
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased">
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-8">
        <div className="w-full max-w-6xl mb-6">
          <a href="/resume/manage" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-primary font-medium bg-surface-container-low hover:bg-surface-container-high transition-all active:scale-95 group">
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>返回</span>
          </a>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-1 lg:col-span-7 flex flex-col">
            <h1 className="text-4xl font-headline font-bold text-on-surface mb-2">解析您的职业履历</h1>
            <p className="text-on-surface-variant mb-8 text-lg">AI 认知引擎正在为您构建多维度的能力图谱。</p>

            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* File Info Card */}
              <div className="flex items-center bg-surface-container-low p-5 rounded-2xl mb-10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mr-5">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-on-surface text-base">{fileName}</h3>
                  <p className="text-on-surface-variant text-sm mt-0.5">{formatFileSize(fileSize)} • PDF 文档</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
              </div>

              {/* Progress Section - Completed */}
              <div className="mb-10">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-medium text-primary bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    解析完成
                  </span>
                  <span className="text-4xl font-headline font-bold text-primary tracking-tighter">100%</span>
                </div>
                <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-container w-full rounded-full"></div>
                </div>
              </div>

              {/* Status Timeline - All completed */}
              <div className="space-y-0 pl-2">
                <div className="flex gap-6 relative">
                  <div className="w-0.5 bg-primary absolute left-[11px] top-7 bottom-[-16px]"></div>
                  <div className="relative z-10 flex flex-col items-center mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  </div>
                  <div className="pb-8">
                    <p className="text-on-surface font-medium text-base">文件上传成功</p>
                    <p className="text-on-surface-variant text-sm mt-1">已安全传输至 GraphHire 加密存储</p>
                  </div>
                </div>

                <div className="flex gap-6 relative">
                  <div className="w-0.5 bg-primary absolute left-[11px] top-7 bottom-[-16px]"></div>
                  <div className="relative z-10 flex flex-col items-center mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  </div>
                  <div className="pb-8">
                    <p className="text-on-surface font-medium text-base">文本结构化处理与语义抽取</p>
                    <p className="text-on-surface-variant text-sm mt-1">已完成工作经历与技能识别</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="relative z-10 flex flex-col items-center mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface font-medium text-base">生成多维认知图谱</p>
                    <p className="text-on-surface-variant text-sm mt-1">技能节点映射已完成</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Extracted Summary Preview */}
          <div className="col-span-1 lg:col-span-5 flex flex-col justify-start">
            <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] overflow-hidden relative h-full flex flex-col">
              <div className="h-24 bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/10 text-[8rem] absolute -right-4 -bottom-4">hub</span>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-lowest"></div>
                <p className="text-sm font-medium text-tertiary tracking-widest uppercase z-10">解析结果预览</p>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">基本信息</div>
                  <div className="flex items-end gap-4">
                    <h2 className="text-3xl font-headline font-bold text-on-surface">简历解析完成</h2>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>简历 ID: {resumeId}</span>
                  </div>
                </div>

                <div className="mb-auto">
                  <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">识别技能 (部分)</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1.5 rounded-full text-sm font-medium">AI 解析技能</span>
                    <span className="bg-surface-variant text-on-surface-variant px-3 py-1.5 rounded-full text-sm">待人工确认</span>
                  </div>
                </div>

                <div className="mt-10 pt-6 bg-surface-container-lowest relative z-20">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-outline-variant opacity-20"></div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleReupload}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-surface-container-high text-primary font-medium hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">refresh</span>
                      重新上传
                    </button>
                    <button
                      onClick={handleContinue}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-medium shadow-md shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      查看简历
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                  <p className="text-center text-xs text-on-surface-variant mt-4">解析完成后可手动核对并修改信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
