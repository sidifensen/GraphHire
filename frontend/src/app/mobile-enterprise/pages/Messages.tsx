"use client";

import { TopNav } from "../components/TopNav";
import { mockNotifications } from "../lib/mockData";
import { useState } from "react";
import { cn } from "../lib/utils";

export default function Messages() {
  const [filter, setFilter] = useState("全部");
  const [notifications, setNotifications] = useState(mockNotifications);

  const filters = ["全部", "新推荐", "投递", "系统"];

  const filteredNotifs = notifications.filter(n => {
    if (filter === "全部") return true;
    if (filter === "新推荐") return n.type === "recommendation";
    if (filter === "投递") return n.type === "application";
    if (filter === "系统") return n.type === "system";
    return true;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({...n, unread: false})));
  };

  const markRead = (id: string) => {
     setNotifications(notifications.map(n => n.id === id ? {...n, unread: false} : n));
  };
  
  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased flex flex-col h-full items-center">
      <TopNav title="消息中心" showBack />

      {/* Actions & Insights Area (Glassmorphic pattern) */}
      <div className="w-full pt-stack-gap-md pb-stack-gap-xs z-30 bg-surface backdrop-blur-md sticky top-16 border-b border-surface-variant">
        <div className="flex justify-between items-center mb-stack-gap-sm">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && <div className="w-2 h-2 rounded-full bg-primary"></div>}
            <span className="font-label-md text-label-md text-on-surface-variant">{unreadCount} 条未读消息</span>
          </div>
          <div className="flex gap-4">
            <button onClick={markAllRead} className="font-label-md text-label-md text-primary flex items-center gap-1 hover:opacity-80 transition-opacity active:scale-95">
              <span className="material-symbols-outlined text-[16px]">done_all</span> 全部已读
            </button>
            <button onClick={clearAll} className="font-label-md text-label-md text-outline flex items-center gap-1 hover:opacity-80 transition-opacity active:scale-95">
              <span className="material-symbols-outlined text-[16px]">delete</span> 清空
            </button>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 font-label-md text-label-md rounded-full whitespace-nowrap border transition-colors",
                filter === f 
                  ? "bg-primary text-on-primary border-transparent shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <main className="w-full flex-1 py-stack-gap-md flex flex-col gap-stack-gap-sm overflow-y-auto pb-safe">
        {filteredNotifs.map(notif => (
          <div 
            key={notif.id}
            onClick={() => markRead(notif.id)}
            className={cn(
              "bg-surface-container-lowest rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant relative overflow-hidden group active:bg-surface-container-low transition-colors cursor-pointer",
              !notif.unread && "opacity-70 active:opacity-100"
            )}
          >
            {notif.type === 'recommendation' && notif.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
            {notif.unread && <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full shadow-[0_0_4px_rgba(0,102,255,0.5)]"></div>}
            
            <div className={cn("flex gap-3", notif.type === 'recommendation' ? "pl-2" : "")}>
              {notif.avatar ? (
                 <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-outline-variant">
                    <img src={notif.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
              ) : (
                 <div className={cn("w-10 h-10 shrink-0 rounded-full flex items-center justify-center", notif.iconBg, notif.iconColor)}>
                    <span className="material-symbols-outlined text-[20px]" style={notif.type === 'system' ? {} : { fontVariationSettings: "'FILL' 1" }}>{notif.icon}</span>
                 </div>
              )}

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface truncate pr-6">{notif.title}</h3>
                </div>
                {notif.type === 'team' ? (
                   <div className="bg-surface-container-low rounded-lg p-3 mt-2 mb-2 border border-surface-variant">
                     <p className="font-body-md text-body-md text-on-surface-variant">{notif.message}</p>
                   </div>
                ) : (
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-2">
                    {/* Basic parsing to highlight name for demo */}
                    {notif.message.split('张伟').length > 1 ? (
                       <>候选人 <span className="font-medium text-on-surface">张伟</span> 已接受您的面试邀请，面试时间定于周三下午 2:00。</>
                    ) : (
                      notif.message
                    )}
                  </p>
                )}
                <span className="font-label-sm text-label-sm text-outline">{notif.time}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
           <div className="py-20 text-center text-on-surface-variant font-body-md">暂无消息</div>
        )}

        {/* End of list spacer */}
        {filteredNotifs.length > 0 && <div className="h-6 flex items-center justify-center">
          <div className="w-12 h-1 bg-surface-variant rounded-full mt-4"></div>
        </div>}
      </main>
    </div>
  );
}
