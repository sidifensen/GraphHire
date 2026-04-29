"use client";

import React from 'react';
import { TopNav } from "../_components/TopNav";
import { CheckCircle, Clock, Trash2, Eye, CloudUpload, XCircle } from 'lucide-react';
import { MOCK_RESUMES } from "../_data/mockData";
import { motion } from 'framer-motion';

export default function ResumeManagement() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="简历管理" />

      <main className="flex-1 px-5 pt-6 pb-32 flex flex-col gap-6">
        {MOCK_RESUMES.map((resume) => (
          <div 
            key={resume.id}
          className={`bg-surface-lowest rounded-2xl shadow-sm border border-surface-mid p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md ${
              resume.isDefault ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-outline-variant'
            }`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-on-surface truncate max-w-[200px]">{resume.name}</h2>
                {resume.isDefault && (
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">默认</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">{resume.date} • {resume.size}</p>
            </div>

            <div className="flex items-center">
              {resume.status === 'parsed' ? (
                <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <CheckCircle size={14} />
                  已解析
                </span>
              ) : (
                <span className="bg-tertiary/10 text-tertiary text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock size={14} />
                  </motion.div>
                  解析中...
                </span>
              )}
            </div>

            <hr className="border-surface-mid" />

            <div className="flex justify-between items-center">
              {!resume.isDefault && resume.status === 'parsed' && (
                <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                  设为默认
                </button>
              )}
              {resume.status === 'parsing' && (
                <button className="text-xs font-bold text-outline hover:text-error transition-colors flex items-center gap-1">
                  <XCircle size={16} /> 取消
                </button>
              )}
              <div className="flex gap-4 ml-auto">
                <button className="text-xs font-bold text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
                  <Trash2 size={16} /> 删除
                </button>
                <button className="text-xs font-bold text-primary flex items-center gap-1">
                  <Eye size={16} /> 预览
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 w-full p-5 bg-surface-lowest border-t border-surface-mid z-50 shadow-lg pb-safe">
        <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
          <CloudUpload size={20} />
          上传新简历
        </button>
      </div>
    </div>
  );
}


