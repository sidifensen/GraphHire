import React, { useState } from 'react';
import { TopNav } from '../components/TopNav';
import { Camera, MapPin, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

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

      <main className="pt-6 px-5 pb-32 flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          <section className="bg-surface-lowest rounded-[24px] md:rounded-[32px] shadow-sm p-6 md:p-10 flex flex-col gap-6 md:gap-8 border border-transparent md:border-surface-mid">
            <h2 className="text-lg md:text-2xl font-black text-on-surface border-b border-surface-low pb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              基本信息
            </h2>
            
            <div className="flex items-center gap-5 md:gap-8">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-surface-low flex items-center justify-center overflow-hidden border-4 border-surface-background shadow-sm relative group">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdRKMFooIv-D3T69ZqyzftXc-5_udxF1gl9Op4A2TRDa-EysYX03Jdw0pmoXgRla48UCCNYZOJQFrBxIv_nzoxCvk6Zj53sKjstj_R3YiXppR6py3zc-e7coQFNOuUcXgoYdIQevucHhlhr_PgJCq97Qc4UH112piVjL53Bl4S2RImzSIhDYV03hevXfGHRGpZwkillq6zu4QenC_gC-wxQEBOIZEJ3TFgj6pdLcbXu2ESYowrh6q3jYuJaTOZpa5M8CK3qwPlmt8" 
                  className="w-full h-full object-cover" 
                  alt="profile" 
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button className="px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors">更换头像</button>
                <p className="text-[10px] text-outline font-bold text-center">支持 JPG, PNG 格式</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <Input label="姓名" value={formData.name} />
              </div>
              <Select label="性别" options={['男', '女']} value={formData.gender === 'male' ? '男' : '女'} />
              <Input label="电话" value={formData.phone} type="tel" />
              <Input label="邮箱" value={formData.email} type="email" />
              <div className="relative">
                <Input label="所在城市" value={formData.city} icon={MapPin} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Select label="最高学历" options={['专科', '本科', '硕士', '博士']} value={formData.education} />
              <Input label="毕业学校" value={formData.school} />
            </div>
          </section>

          <section className="bg-surface-lowest rounded-[24px] md:rounded-[32px] shadow-sm p-6 md:p-10 flex flex-col gap-6 md:gap-8 border border-transparent md:border-surface-mid">
            <h2 className="text-lg md:text-2xl font-black text-on-surface border-b border-surface-low pb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
              求职意向
            </h2>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <Input label="期望岗位" value={formData.jobIntent} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Input label="目标城市" value={formData.targetCity} />
                <Select label="期望薪资" options={['面议', '15k-25k', '25k-35k', '35k-50k']} value={formData.salary} />
              </div>
              
              <div className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <h4 className="font-black text-sm text-primary mb-2 uppercase tracking-wider">智能推荐优化</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                  基于您的图谱数据，目前北京地区的“高级前端工程师”岗位与您的匹配度平均为 <span className="font-black text-primary">88%</span>。完善以上信息将帮助 AI 更好地为您定向匹配高薪职位。
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full min-h-[80px] bg-surface-lowest/90 backdrop-blur-md border-t border-surface-mid pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:rounded-t-[32px]">
        <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-4 md:py-6 flex items-center justify-center">
          <button className="w-full md:max-w-[400px] h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            保存修改
          </button>
        </div>
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
