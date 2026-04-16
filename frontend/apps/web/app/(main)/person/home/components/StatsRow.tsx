'use client';

import { Card } from '@/components/shared/ui/Card';
import { Statistic } from 'antd';

interface StatItem {
  title: string;
  value: number | string;
  suffix?: string;
  link?: string;
}

export function StatsRow() {
  const stats: StatItem[] = [
    { title: '简历数', value: 3, link: '/person/resume' },
    { title: '匹配职位', value: 12, link: '/person/jobs' },
    { title: '已投递', value: 5, link: '/person/applications' },
    { title: '浏览次数', value: 28, link: '/person/profile' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="text-center">
          <Statistic
            title={<span className="text-gray-500 text-sm">{stat.title}</span>}
            value={stat.value}
            suffix={stat.suffix}
          />
          {stat.link && (
            <a href={stat.link} className="text-xs text-primary mt-2 inline-block hover:underline">
              查看详情 →
            </a>
          )}
        </Card>
      ))}
    </div>
  );
}