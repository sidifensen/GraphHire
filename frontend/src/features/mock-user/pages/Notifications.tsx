import React, { useState } from 'react';
import { TopNav } from '../components/TopNav';
import { CheckCircle, Bell, FileText, Briefcase, Eye, Megaphone, XCircle, Clock, Check, CheckCheck } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../mockData';
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

      <main className="max-w-7xl mx-auto w-full pt-4 md:pt-12 pb-12 px-5 md:px-8">
        <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 md:px-8 md:py-3.5 rounded-full md:rounded-2xl text-xs md:text-sm font-bold border transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-white border-transparent shadow-md' 
                    : 'bg-surface-lowest text-on-surface border-surface-mid hover:bg-surface-low'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <button 
            onClick={markAllRead}
            className="md:flex hidden text-primary hover:bg-primary/5 px-6 py-3 rounded-2xl text-sm font-bold items-center gap-2 transition-colors border border-primary/20 bg-primary/5"
          >
            <CheckCheck size={20} />
            全部标记已读
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-surface-lowest rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-surface-mid relative flex gap-4 cursor-pointer hover:bg-surface-low transition-colors ${!notif.isRead ? '' : 'opacity-70 grayscale-[0.3]'}`}
                onClick={() => markRead(notif.id)}
              >
                {!notif.isRead && (
                  <div className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/40 animate-pulse" />
                )}
                
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[20px] flex-shrink-0 flex items-center justify-center transition-colors shadow-sm ${
                  notif.type === 'system' ? 'bg-primary/10 text-primary' : 'bg-secondary-container/30 text-primary'
                }`}>
                  <NotifIcon name={notif.icon} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className={`text-sm md:text-base font-bold truncate pr-6 ${notif.isRead ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                      {notif.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-on-surface-variant line-clamp-2 md:line-clamp-3 leading-relaxed mb-4">
                    {notif.content}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-outline">
                    <Clock size={12} />
                    {notif.time}
                  </div>
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
