"use client";

import React, { useState } from 'react';
import { TopNav } from "../_components/TopNav";
import { Bell, FileText, Briefcase, Eye, Megaphone, XCircle, CheckCheck } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from "../_data/mockData";
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const tabs = ['全部', '投递反馈', '系统消息'];
  const [activeTab, setActiveTab] = useState('全部');

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav 
        title="通知" 
        rightAction={
          <button 
            onClick={markAllRead}
            className="text-primary hover:bg-primary-container/10 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <CheckCheck size={18} />
            全部标记已读
          </button>
        }
      />

      <main className="max-w-md mx-auto w-full pt-4 pb-12 px-5">
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                activeTab === tab 
                  ? 'bg-primary-container text-white border-transparent shadow-md' 
                  : 'bg-surface-lowest text-on-surface border-surface-mid hover:bg-surface-low'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-surface-lowest rounded-2xl p-4 shadow-sm relative flex gap-4 cursor-pointer hover:bg-surface-low transition-colors ${!notif.isRead ? '' : 'opacity-70'}`}
                onClick={() => markRead(notif.id)}
              >
                {!notif.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                )}
                
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                  notif.type === 'system' ? 'bg-primary/10 text-primary' : 'bg-secondary-container/50 text-primary'
                }`}>
                  <NotifIcon name={notif.icon} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm font-bold truncate pr-6 ${notif.isRead ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-outline flex-shrink-0 ml-2 mt-0.5">{notif.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {notif.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NotifIcon({ name }: { name: string }) {
  switch (name) {
    case 'description': return <FileText size={20} />;
    case 'work': return <Briefcase size={20} />;
    case 'visibility': return <Eye size={20} />;
    case 'campaign': return <Megaphone size={20} />;
    case 'cancel': return <XCircle size={20} />;
    default: return <Bell size={20} />;
  }
}


