'use client';

import Image from 'next/image';
import { HomeJobCard } from '@/lib/types/home';

interface JobCardProps {
  job: HomeJobCard;
}

export default function JobCard({ job }: JobCardProps) {
  const { title, companyName, city, district, salaryText, requiredSkills, hrName, hrTitle, hrAvatar, matchScore } = job;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 hover:ambient-shadow transition-all duration-300 group cursor-pointer border border-transparent hover:border-surface-container-high relative overflow-hidden">
      {/* Subtle gradient indicating high match */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-tertiary mt-1 flex items-center gap-2">
            <span>{companyName}</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span>{city}{district ? `·${district}` : ''}</span>
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-primary block">{salaryText}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {requiredSkills.map((skill) => (
          <span
            key={skill}
            className="bg-surface-variant text-on-surface-variant rounded-full px-3 py-1 text-xs"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
        <div className="flex items-center gap-3">
          {hrAvatar ? (
            <Image
              alt={hrName}
              src={hrAvatar}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-xs">
              HR
            </div>
          )}
          <span className="text-sm text-on-surface-variant">{hrName} · {hrTitle}</span>
        </div>

        {matchScore !== undefined ? (
          <div className="bg-primary-fixed text-on-primary-fixed rounded-full px-4 py-1.5 text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base icon-fill text-primary">robot_2</span>
            AI匹配度：{matchScore}%
          </div>
        ) : (
          <div className="bg-surface-container-highest text-on-surface rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">analytics</span>
            匹配度：{job.matchScore ?? 0}%
          </div>
        )}
      </div>
    </div>
  );
}
