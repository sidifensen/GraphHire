"use client";

import React, { useState } from 'react';
import { TopNav } from "../_components/TopNav";
import { Camera, MapPin, ChevronDown } from 'lucide-react';

export default function PersonalInfo() {
  const [formData, setFormData] = useState({
    name: '张伟',
    gender: 'male',
    phone: '13800138000',
    email: 'zhangwei@example.com',
    education: '本科',
    school: '北京大学',
    city: '北京市',
    jobIntent: '高级前端工程师',
    targetCity: '北京 / 上海',
    salary: '25k-35k'
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface-background">
      <TopNav title="个人资料" />

      <main className="pt-6 px-5 pb-32 flex flex-col gap-6 max-w-md mx-auto">
        <section className="bg-surface-lowest rounded-[24px] shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-lg font-black text-on-surface border-b border-surface-low pb-3">基本信息</h2>
          
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center overflow-hidden border border-surface-mid relative group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdRKMFooIv-D3T69ZqyzftXc-5_udxF1gl9Op4A2TRDa-EysYX03Jdw0pmoXgRla48UCCNYZOJQFrBxIv_nzoxCvk6Zj53sKjstj_R3YiXppR6py3zc-e7coQFNOuUcXgoYdIQevucHhlhr_PgJCq97Qc4UH112piVjL53Bl4S2RImzSIhDYV03hevXfGHRGpZwkillq6zu4QenC_gC-wxQEBOIZEJ3TFgj6pdLcbXu2ESYowrh6q3jYuJaTOZpa5M8CK3qwPlmt8" 
                className="w-full h-full object-cover" 
                alt="profile" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <button className="text-sm font-bold text-primary">更换头像</button>
          </div>

          <div className="space-y-4">
            <Input label="姓名" value={formData.name} />
            <div className="grid grid-cols-2 gap-4">
               <Select label="性别" options={['男', '女']} value={formData.gender === 'male' ? '男' : '女'} />
               <Input label="电话" value={formData.phone} type="tel" />
            </div>
            <Input label="邮箱" value={formData.email} type="email" />
            <div className="grid grid-cols-2 gap-4">
               <Select label="最高学历" options={['专科', '本科', '硕士', '博士']} value={formData.education} />
               <Input label="毕业学校" value={formData.school} />
            </div>
            <div className="relative">
              <Input label="所在城市" value={formData.city} icon={MapPin} />
            </div>
          </div>
        </section>

        <section className="bg-surface-lowest rounded-[24px] shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-lg font-black text-on-surface border-b border-surface-low pb-3">求职意向</h2>
          <div className="space-y-4">
            <Input label="期望岗位" value={formData.jobIntent} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="目标城市" value={formData.targetCity} />
              <Select label="期望薪资" options={['面议', '15k-25k', '25k-35k', '35k-50k']} value={formData.salary} />
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-surface-lowest border-t border-surface-mid px-5 py-4 pb-safe z-40 shadow-lg">
        <button className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
          保存修改
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, type = "text", icon: Icon }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />}
        <input 
          type={type} 
          defaultValue={value}
          className={`w-full h-12 ${Icon ? 'pl-11' : 'px-4'} bg-surface-low border border-surface-mid rounded-xl text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
        />
      </div>
    </div>
  );
}

function Select({ label, options, value }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</label>
      <div className="relative">
        <select 
          defaultValue={value}
          className="w-full h-12 px-4 appearance-none bg-surface-low border border-surface-mid rounded-xl text-sm font-medium focus:border-primary outline-none transition-all"
        >
          {options.map((opt: string) => <option key={opt}>{opt}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={16} />
      </div>
    </div>
  );
}


