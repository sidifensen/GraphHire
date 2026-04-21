'use client';

import { useEffect, useMemo, useState } from 'react';
import { authStore } from '@/lib/stores/auth-store';
import { personApi } from '@/lib/api/person';

function buildPositions(count: number) {
  const radius = 34;
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(count, 1);
    return {
      top: `${50 + Math.sin(angle) * radius}%`,
      left: `${50 + Math.cos(angle) * radius}%`,
    };
  });
}

export default function SkillGraphPage() {
  const user = authStore((state) => state.user);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError('');
      const graph = await personApi.getGraph();
      setSkills(graph.skills ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '图谱加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGraph();
  }, []);

  const positionedSkills = useMemo(() => {
    return skills.slice(0, 8).map((name, index) => ({
      id: `${name}-${index}`,
      name,
      ...buildPositions(Math.min(skills.length, 8))[index],
    }));
  }, [skills]);

  const dimensions = useMemo(() => {
    const total = skills.length;
    return [
      { name: '核心技能数量', percent: Math.min(total * 12, 100) },
      { name: '图谱覆盖度', percent: total > 0 ? Math.min(50 + total * 5, 100) : 0 },
      { name: '跨域延展性', percent: total > 2 ? Math.min(40 + total * 4, 100) : 20 },
    ];
  }, [skills]);

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-8 py-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-2 tracking-tight">认知导视体系</h1>
            <p className="text-on-surface-variant text-base">AI 深度解析您的真实技能网络，发现潜在关联与价值</p>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-xl">
            <span className="text-sm font-medium text-on-surface-variant">当前账号</span>
            <span className="text-xs text-primary font-bold ml-2">{user?.username ?? '未登录'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
          <section className="bg-surface-container-lowest rounded-[2rem] p-8 relative overflow-hidden flex flex-col min-h-[600px] shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)] group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-fixed-dim/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex justify-between items-center mb-4 z-10 relative">
              <h2 className="font-headline text-xl font-bold text-on-surface">核心技能图谱</h2>
              <div className="text-sm text-on-surface-variant">真实接口驱动</div>
            </div>

            <div className="flex-grow relative w-full h-full mt-4">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">图谱数据加载中...</div>
              ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <p className="text-error">{error}</p>
                  <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadGraph()}>重试</button>
                </div>
              ) : skills.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">暂无技能图谱数据，请先上传并解析简历。</div>
              ) : (
                <>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                    {positionedSkills.map((skill, index) => (
                      <line key={skill.id} stroke="var(--color-outline-variant)" strokeDasharray="4 4" strokeWidth="1.5" x1="50%" y1="50%" x2={skill.left} y2={skill.top} />
                    ))}
                  </svg>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-4 border-surface-container-lowest ring-4 ring-primary-fixed shadow-sm bg-primary text-white flex items-center justify-center text-2xl font-bold">
                      {(user?.username ?? 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <span className="mt-3 font-headline font-bold text-on-surface bg-surface-container-lowest/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">当前状态</span>
                  </div>

                  {positionedSkills.map((skill) => (
                    <div key={skill.id} className="absolute z-10 flex flex-col items-center" style={{ top: skill.top, left: skill.left, transform: 'translate(-50%, -50%)' }}>
                      <div className="rounded-full flex items-center justify-center shadow-sm bg-primary-fixed text-primary w-12 h-12">
                        <span className="material-symbols-outlined">hub</span>
                      </div>
                      <div className="mt-2 text-center max-w-24">
                        <span className="block text-on-surface text-xs">{skill.name}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-headline font-bold text-on-surface">AI 综合能力评估</h3>
                <span className="material-symbols-outlined text-primary">psychology</span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="font-headline text-6xl font-black text-primary tracking-tighter leading-none">{Math.min(skills.length * 10, 100)}</span>
                <span className="text-on-surface-variant font-medium pb-1">/ 100</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-2">当前图谱已识别 {skills.length} 项技能节点，后续会继续随着简历解析结果动态更新。</p>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-6 flex-grow">
              <h3 className="font-headline font-bold text-on-surface mb-6">核心维度重合度</h3>
              <div className="flex flex-col gap-5">
                {dimensions.map((dim) => (
                  <div key={dim.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-on-surface">{dim.name}</span>
                      <span className={dim.percent >= 90 ? 'text-primary font-bold' : 'text-on-surface-variant font-medium'}>{dim.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${dim.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
                <h3 className="font-headline font-bold text-on-surface">技能提升建议</h3>
              </div>
              <ul className="flex flex-col gap-4 text-sm text-on-surface-variant">
                {skills.length > 0 ? (
                  <>
                    <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span>优先围绕已识别技能继续补充项目案例，让图谱节点与真实经历更强绑定。</span></li>
                    <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span>上传最新简历或更新个人资料后，图谱会继续补充更多技能关联。</span></li>
                  </>
                ) : (
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span>当前暂无图谱数据，建议先上传简历并等待解析完成。</span></li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
