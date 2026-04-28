"use client";

import React from 'react';
import { Edit2, MessageSquare, Briefcase, Heart, ChevronRight, User, FileText, Send, Network, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from "../_lib/router";

export default function Profile() {
  const menuItems = [
    { name: '个人资料', icon: User, path: '/personal-info' },
    { name: '简历管理', icon: FileText, path: '/resume' },
    { name: '投递记录', icon: Send, path: '/applications' },
    { name: '我的图谱', icon: Network, path: '/graph' },
    { name: '账号设置', icon: Settings, path: '#', divider: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-background p-5">
      {/* Profile Card */}
      <section className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,82,255,0.05)] mb-6 relative overflow-hidden pt-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8"></div>
        
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface-background bg-surface-mid shadow-sm">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnus9w6DjRzKduWO6OdWsQ5CrAHYTuOA4N0nIS2qm3U0bcXewIH_VWXSKG79WP9TY_Zo71TQQxA3Mz-EkJN5_RUN2B1E2SUvEMDEERGWtO9CL8xXP6kxDiq9egkABG41l8DsPnw26HDF1NhmpLCR-sw88FwbGXMlepsG5ha2wo8sXbgEFm7oc-60MHHMRKpPtr5EnGNsgG0AwGqmD6TIdkyAfqFz4xeGH_Pd34fXSxdjmVK4SV4dHRqtl4JWmOk1l-AIROvjeQdl4" 
              className="w-full h-full object-cover" 
              alt="avatar" 
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-on-surface mb-1">陈智图</h2>
            <p className="text-body-md text-on-surface-variant mb-4">138****8888</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container/30 text-primary text-xs font-bold">
                离职-随时到岗
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-mid text-on-surface-variant text-[10px] font-bold">
                资料完整度 85%
              </span>
            </div>
          </div>
          <button className="text-outline hover:text-primary transition-colors mt-2">
            <Edit2 size={20} />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-mid flex justify-between items-center px-4">
          <div className="text-center group cursor-pointer">
            <div className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">12</div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">沟通过</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">5</div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">面试</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">28</div>
            <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">收藏</div>
          </div>
        </div>
      </section>

      {/* Menu List */}
      <section className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,82,255,0.05)] overflow-hidden">
        <div className="flex flex-col">
          {menuItems.map((item, idx) => (
            <React.Fragment key={item.name}>
              {item.divider && <div className="h-2 bg-surface-background"></div>}
              <Link 
                to={item.path}
                className="flex items-center justify-between p-5 hover:bg-surface-low transition-colors border-b border-surface-background last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.divider ? 'bg-surface-mid text-on-surface-variant' : 'bg-primary/10 text-primary'}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-body-lg font-bold text-on-surface">{item.name}</span>
                </div>
                <ChevronRight className="text-outline" size={20} />
              </Link>
            </React.Fragment>
          ))}
          <Link 
            to="/login"
            className="flex items-center justify-between p-5 hover:bg-surface-low transition-colors text-red-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-500">
                <Settings size={20} />
              </div>
              <span className="text-body-lg font-bold">退出登录</span>
            </div>
          </Link>
        </div>
      </section>
      
      <div className="h-24"></div>
    </div>
  );
}


