'use client';

import React from 'react';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { RefreshCw, User, Code, Layout, Database, Group, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';
import { personApi, type AbilityAssessment } from '@/lib/api/person';

type SkillGraphPayload = {
  personId?: number;
  skills?: string[];
};

type NodePreset = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  top: string;
  left?: string;
  right?: string;
  color: string;
};

const NODE_PRESETS: NodePreset[] = [
  { icon: Code, label: '技术工程', top: '15%', left: '50%', color: 'bg-secondary-container' },
  { icon: Layout, label: '产品体验', top: '40%', left: '15%', color: 'bg-primary/10 text-primary' },
  { icon: Group, label: '团队协作', top: '80%', left: '20%', color: 'bg-surface-mid' },
  { icon: Database, label: '数据能力', top: '80%', right: '20%', color: 'bg-surface-mid' },
  { icon: TrendingUp, label: '成长潜力', top: '40%', right: '15%', color: 'bg-tertiary/10 text-tertiary' },
];

const LEVEL_TEXT: Record<string, string> = {
  HIGH: 'Top 5% 职场精英',
  MEDIUM: 'Top 30% 稳定进阶',
  LOW: '持续提升中',
};

function normalizeSkills(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const unique = new Set<string>();
  for (const item of input) {
    if (typeof item !== 'string') {
      continue;
    }
    const skill = item.trim();
    if (skill.length === 0) {
      continue;
    }
    unique.add(skill);
  }
  return Array.from(unique);
}

function safePercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeScore(assessment: AbilityAssessment | null): number {
  if (!assessment) {
    return 0;
  }
  return safePercent(assessment.totalScore);
}

function safeSkillCount(assessment: AbilityAssessment | null, skills: string[]): number {
  if (!assessment) {
    return skills.length;
  }
  const fromApi = Number.isFinite(assessment.skillCount) ? Math.max(0, Math.round(assessment.skillCount)) : 0;
  return fromApi > 0 ? fromApi : skills.length;
}

function resolveLevelText(level: string | undefined): string {
  if (!level) {
    return LEVEL_TEXT.LOW;
  }
  return LEVEL_TEXT[level] ?? LEVEL_TEXT.LOW;
}

function skillsForNode(skills: string[], index: number): string {
  if (skills.length === 0) {
    return NODE_PRESETS[index].label;
  }
  return skills[index % skills.length];
}

export default function KnowledgeGraph() {
  const [skills, setSkills] = React.useState<string[]>([]);
  const [assessment, setAssessment] = React.useState<AbilityAssessment | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [graphResponse, assessmentResponse] = await Promise.all([
          personApi.getGraph(),
          personApi.getAbilityAssessment(),
        ]);

        if (!active) {
          return;
        }

        const graph = (graphResponse ?? {}) as SkillGraphPayload;
        setSkills(normalizeSkills(graph.skills));
        setAssessment(assessmentResponse);
      } catch (err) {
        if (!active) {
          return;
        }
        const message = err instanceof Error ? err.message : '能力图谱加载失败';
        setError(message || '能力图谱加载失败');
        setSkills([]);
        setAssessment(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const totalScore = safeScore(assessment);
  const skillCount = safeSkillCount(assessment, skills);
  const levelText = resolveLevelText(assessment?.level);
  const progressWidth = `${totalScore}%`;

  return (
    <div className="flex flex-col min-h-screen md:min-h-[calc(100vh-4rem)]">
      <div className="md:hidden">
        <TopNav title="我的图谱" />
      </div>

      <main className="flex-1 px-5 pb-28 pt-5 md:px-8 md:py-12 md:pb-32">
        <div className="mx-auto flex w-full max-w-7xl gap-6 lg:gap-8">
          <UserWorkbenchSidebar />
          <div className="flex-1 grid gap-6 md:grid-cols-12 md:gap-8">
            <section className="md:col-span-8 bg-surface-lowest rounded-2xl border border-surface-mid h-[400px] md:h-[600px] relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface-lowest to-surface-lowest" />

              <div className="absolute top-6 left-8 z-20">
                <h2 className="text-xl md:text-3xl font-black text-on-surface flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  全景图谱
                </h2>
                <p className="text-xs md:text-sm text-outline font-bold mt-1">
                  {loading ? '正在同步能力图谱...' : `基于您的 ${skillCount} 个技能点位生成`}
                </p>
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                <g stroke="var(--color-primary)" strokeDasharray="4 4" strokeWidth="1">
                  <line x1="50%" y1="50%" x2="50%" y2="15%" />
                  <line x1="50%" y1="50%" x2="85%" y2="40%" />
                  <line x1="50%" y1="50%" x2="80%" y2="80%" />
                  <line x1="50%" y1="50%" x2="20%" y2="80%" />
                  <line x1="50%" y1="50%" x2="15%" y2="40%" />
                </g>
              </svg>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="z-10 w-24 h-24 md:w-32 md:h-32 bg-primary text-white rounded-full flex flex-col items-center justify-center shadow-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-surface-lowest"
              >
                <User size={32} className="md:size-48" />
              </motion.div>

              {NODE_PRESETS.map((preset, index) => (
                <Node
                  key={`${preset.label}-${index}`}
                  icon={preset.icon}
                  label={skillsForNode(skills, index)}
                  top={preset.top}
                  left={preset.left}
                  right={preset.right}
                  delay={0.1 * (index + 1)}
                  color={preset.color}
                />
              ))}

              {skills.length === 0 && !loading && !error ? (
                <div className="absolute bottom-8 left-8 rounded-xl border border-surface-mid bg-surface-lowest/90 px-4 py-3 text-xs text-on-surface-variant">
                  暂无技能图谱数据
                  <div className="mt-1 text-[11px]">请先上传并解析简历，然后重试。</div>
                </div>
              ) : null}

              <div className="md:flex hidden absolute bottom-10 right-10 flex-col gap-3">
                <button className="w-12 h-12 rounded-2xl bg-surface-lowest border border-surface-mid flex items-center justify-center shadow-sm" disabled>
                  <RefreshCw size={20} className="text-on-surface-variant" />
                </button>
              </div>
            </section>

            <section className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-lowest rounded-2xl p-6 md:p-7 border border-surface-mid flex flex-col gap-4">
                <div className="flex items-center gap-3 text-primary">
                  <Award size={24} />
                  <span className="text-sm font-black text-on-surface uppercase tracking-widest">能力概览</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black text-primary">{totalScore}</span>
                  <span className="text-sm text-outline font-bold">综合分</span>
                </div>
                <div className="mt-6 pt-6 border-t border-surface-low">
                  <div className="w-full h-3 bg-surface-low rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: progressWidth }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                    />
                  </div>
                  <div className="flex justify-between mt-4 text-xs font-black">
                    <span className="text-outline uppercase tracking-wider">{levelText}</span>
                    <span className="text-green-500 flex items-center gap-1 font-black">
                      <TrendingUp size={14} />
                      {loading ? '同步中' : `${totalScore}%`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-lowest rounded-2xl p-6 md:p-7 border border-surface-mid flex flex-col gap-4">
                <div className="flex items-center gap-3 text-tertiary">
                  <div className="w-6 h-6 rounded-lg bg-tertiary/10 flex items-center justify-center">
                    <RefreshCw size={14} className="text-tertiary" />
                  </div>
                  <span className="text-sm font-black text-on-surface uppercase tracking-widest">知识节点</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-black text-on-surface">{skillCount}</span>
                  <span className="text-sm text-outline font-bold">已同步</span>
                </div>
                <div className="mt-6">
                  {error ? (
                    <p className="text-xs text-red-500 leading-relaxed mb-6">{error}</p>
                  ) : (
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      {loading ? '正在加载您的能力图谱，请稍候。' : '您的知识图谱会随着简历解析结果持续更新。'}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.slice(0, 8).map((tag) => (
                        <span key={tag} className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black rounded-xl border border-primary/10">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="px-4 py-1.5 bg-surface-mid text-on-surface-variant text-[10px] font-black rounded-xl">
                        暂无技能标签
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Node({
  icon: Icon,
  label,
  top,
  left,
  right,
  delay,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  top: string;
  left?: string;
  right?: string;
  delay: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay }}
      className="absolute flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2"
      style={{ top, left, right }}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md border-4 border-surface-lowest ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">{label}</span>
    </motion.div>
  );
}
