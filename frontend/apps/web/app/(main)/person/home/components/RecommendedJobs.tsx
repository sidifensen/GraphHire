'use client';

import { Card } from '@/components/shared/ui/Card';
import { Tag } from '@/components/shared/ui/Tag';
import { Progress } from 'antd';
import { personApi } from '@/lib/api/person';
import { useEffect, useState } from 'react';

interface Job {
  id: string;
  title: string;
  companyName: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  education: string;
  skills: string[];
  matchScore?: number;
}

export function RecommendedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personApi.getRecommendJobs({ page: 1, size: 5 }).then((res) => {
      setJobs(res.list);
      setLoading(false);
    });
  }, []);

  return (
    <Card
      title="推荐职位"
      extra={<a href="/person/jobs" className="text-sm text-primary">查看全部 →</a>}
    >
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-8">加载中...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-400 py-8">暂无推荐职位</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:shadow-hover transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{job.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {job.companyName} · {job.city} · {job.salaryMin}K-{job.salaryMax}K
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {job.skills.slice(0, 3).map((skill) => (
                      <Tag key={skill} variant="skill">{skill}</Tag>
                    ))}
                    {job.skills.length > 3 && (
                      <Tag variant="default">+{job.skills.length - 3}</Tag>
                    )}
                  </div>
                </div>
                {job.matchScore && (
                  <div className="text-right ml-4">
                    <span className="text-sm text-gray-500">匹配度</span>
                    <Progress
                      percent={job.matchScore}
                      size="small"
                      strokeColor="#10B981"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}