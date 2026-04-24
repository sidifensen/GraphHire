import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  trendLabel: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'indigo' | 'purple' | 'amber';
  subValue?: string;
  subLabel?: string;
}

export default function StatCard({ 
  title, 
  value, 
  trend, 
  trendLabel, 
  icon: Icon, 
  variant = 'primary',
  subValue,
  subLabel
}: StatCardProps) {
  const variants = {
    primary: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    secondary: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-black/40 dark:backdrop-blur-xl p-6 rounded-xl border border-outline-variant/50 dark:border-white/10 shadow-sm hover:shadow-soft transition-all duration-300 group relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-outline font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold font-display">{value}</h3>
        </div>
        <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", variants[variant])}>
          <Icon size={24} />
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center text-xs">
          <span className={cn(
            "font-bold flex items-center gap-0.5",
            trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-outline ml-2">{trendLabel}</span>
        </div>
        
        {subValue && (
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs">
            <span className="text-slate-500">{subLabel}</span>
            <span className={cn("font-medium", variant === 'primary' ? 'text-slate-700 dark:text-slate-300' : 'text-amber-600 dark:text-amber-400')}>
              {subValue}
            </span>
          </div>
        )}
      </div>
      
      <div className={cn(
        "absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 bg-current opacity-30",
        variants[variant].split(' ')[1]
      )}></div>
    </div>
  );
}
