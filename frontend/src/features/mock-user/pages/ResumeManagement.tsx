import React from 'react';
import { TopNav } from '../components/TopNav';
import { CheckCircle, Clock, Trash2, Eye, CloudUpload, XCircle } from 'lucide-react';
import { MOCK_RESUMES } from '../mockData';
import { motion } from 'framer-motion';

export default function ResumeManagement() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="简历管理" />

      <main className="flex-1 px-5 pt-6 pb-32 md:pt-12 md:pb-24 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {MOCK_RESUMES.map((resume) => (
            <div 
              key={resume.id}
              className={`bg-surface-lowest rounded-2xl md:rounded-3xl shadow-sm border border-surface-mid p-5 md:p-8 flex flex-col gap-4 md:gap-6 relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                resume.isDefault ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-outline-variant'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-on-surface truncate text-base md:text-lg">{resume.name}</h2>
                  {resume.isDefault && (
                    <span className="bg-primary text-white text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full">默认</span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant">{resume.date} • {resume.size}</p>
              </div>

              <div className="flex items-center">
                {resume.status === 'parsed' ? (
                  <span className="bg-green-500/10 text-green-500 text-xs md:text-sm font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-green-500/20">
                    <CheckCircle size={16} />
                    已成功解析
                  </span>
                ) : (
                  <span className="bg-tertiary/10 text-tertiary text-xs md:text-sm font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-tertiary/20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
                    >
                      <Clock size={16} />
                    </motion.div>
                    深度解析中...
                  </span>
                )}
              </div>

              <hr className="border-surface-mid" />

              <div className="flex justify-between items-center gap-4">
                {!resume.isDefault && resume.status === 'parsed' && (
                  <button className="text-xs md:text-sm font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                    <CheckCircle size={14} className="md:hidden" />
                    设为默认
                  </button>
                )}
                {resume.status === 'parsing' && (
                  <button className="text-xs md:text-sm font-bold text-outline hover:text-error transition-colors flex items-center gap-1">
                    <XCircle size={14} /> 取消
                  </button>
                )}
                <div className="flex gap-4 ml-auto">
                  <button className="text-xs md:text-sm font-bold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 group">
                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> 
                    <span className="md:inline hidden">删除</span>
                  </button>
                  <button className="text-xs md:text-sm font-bold text-primary flex items-center gap-2 group">
                    <Eye size={16} className="group-hover:scale-110 transition-transform" /> 
                    <span>预览解析</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full min-h-[80px] bg-surface-lowest/90 backdrop-blur-md border-t border-surface-mid z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe md:rounded-t-[32px]">
        <div className="max-w-7xl mx-auto w-full p-5 md:p-8 md:px-12 flex flex-col md:flex-row items-center justify-center">
          <button className="w-full md:max-w-[400px] bg-primary text-white font-bold py-4 md:h-16 md:text-lg rounded-2xl md:rounded-3xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary/90">
            <CloudUpload size={20} className="md:size-6" />
            上传新简历文件
          </button>
        </div>
      </div>
    </div>
  );
}
