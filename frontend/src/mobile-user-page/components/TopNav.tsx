"use client";

import React from 'react';
import { useNavigate } from '@/mobile-user-page/router';
import { ArrowLeft, Share2 } from 'lucide-react';

interface TopNavProps {
  title: string;
  showBack?: boolean;
  showShare?: boolean;
  rightAction?: React.ReactNode;
}

export function TopNav({ title, showBack = true, showShare = false, rightAction }: TopNavProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/90 backdrop-blur-md border-b border-surface-mid flex items-center justify-between px-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2">
        {showBack && (
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-low transition-colors text-on-surface"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      
      <h1 className="font-h3 text-h3 text-on-surface absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
        {title}
      </h1>
      
      <div className="flex items-center gap-1">
        {showShare && (
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-low transition-colors text-on-surface">
            <Share2 size={24} />
          </button>
        )}
        {rightAction}
      </div>
    </header>
  );
}

