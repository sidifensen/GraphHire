'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { authStore } from '@/lib/stores/auth-store';
import { personApi } from '@/lib/api/person';

type GraphNode = {
  id: string;
  name: string;
  kind: 'user' | 'skill';
  val: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
};

type GraphLink = {
  source: string;
  target: string;
  strength: number;
};

const TWO_PI = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function buildSkillGraphData(
  skills: string[],
  username: string | undefined,
  viewport: { width: number; height: number },
): { nodes: GraphNode[]; links: GraphLink[] } {
  const userNode: GraphNode = {
    id: 'user-center',
    name: username ?? '当前用户',
    kind: 'user',
    val: 26,
    x: 0,
    y: 0,
  };

  const minSide = Math.min(viewport.width, viewport.height);
  const outerRadius = Math.max(340, Math.floor(minSide * 0.56));
  const innerRadius = Math.max(180, Math.floor(outerRadius * 0.56));

  const skillNodes: GraphNode[] = skills.map((skill, index) => {
    const progress = (index + 1) / (skills.length + 1);
    const distance = innerRadius + (outerRadius - innerRadius) * Math.sqrt(progress);
    const spiralAngle = index * GOLDEN_ANGLE;
    const angle = (spiralAngle % TWO_PI) + (index % 3) * 0.06;

    return {
      id: `skill-${index}`,
      name: skill,
      kind: 'skill',
      val: Math.max(10, 16 - Math.min(index, 6)),
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      fx: Math.cos(angle) * distance,
      fy: Math.sin(angle) * distance,
    };
  });

  const links: GraphLink[] = skillNodes.map((node) => ({
    source: userNode.id,
    target: node.id,
    strength: 1,
  }));

  return { nodes: [userNode, ...skillNodes], links };
}

export default function SkillGraphPage() {
  const user = authStore((state) => state.user);
  const shouldReduceMotion = useReducedMotion();
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [focusedNode, setFocusedNode] = useState('');
  const [viewport, setViewport] = useState({ width: 920, height: 620 });
  const graphRef = useRef<any>(null);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const target = graphContainerRef.current;
    if (!target || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (!entry) {
        return;
      }
      setViewport({
        width: Math.max(420, Math.floor(entry.contentRect.width)),
        height: Math.max(560, Math.floor(entry.contentRect.height)),
      });
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(() => buildSkillGraphData(skills, user?.username, viewport), [skills, user?.username, viewport]);

  const ForceGraph2D = useMemo(
    () =>
      dynamic(() => import('react-force-graph-2d'), {
        ssr: false,
      }),
    [],
  );

  const handleResetView = () => {
    graphRef.current?.zoomToFit?.(300, 50);
    setFocusedNode('');
  };

  const hasAutoFitted = useRef(false);
  useEffect(() => {
    if (skills.length > 0 && !hasAutoFitted.current && graphRef.current) {
      hasAutoFitted.current = true;
      setTimeout(() => {
        graphRef.current?.zoomToFit?.(300, 50);
      }, 600);
    }
  }, [skills]);

  const score = Math.min(skills.length * 10, 100);
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - score / 100);
  const nodeCount = graphData.nodes.length;
  const linkCount = graphData.links.length;

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-surface">
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-2 tracking-tight">认知导视体系</h1>
            <p className="text-on-surface-variant text-base">AI 深度解析您的真实技能网络，发现潜在关联与价值</p>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-xl">
            <span className="text-sm font-medium text-on-surface-variant">当前账号</span>
            <span className="text-xs text-primary font-bold ml-2">{user?.username ?? '未登录'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[79%_21%] gap-6">
          <section className="bg-[#08111f] rounded-[2rem] p-4 md:p-6 relative overflow-hidden flex flex-col min-h-[800px] shadow-[0_20px_48px_-10px_rgba(8,17,31,0.55)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(44,155,255,0.24),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(89,235,198,0.18),transparent_46%)] pointer-events-none" />

            <div className="flex justify-between items-center mb-3 z-10 relative text-white">
              <h2 className="font-headline text-xl font-bold">可探索技能图谱</h2>
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition"
                type="button"
                onClick={handleResetView}
              >
                重置视图
              </button>
            </div>

            <div ref={graphContainerRef} className="flex-grow relative w-full h-full mt-2 rounded-2xl border border-white/10 bg-black/15">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-white/75">图谱数据加载中...</div>
              ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <p className="text-red-300">{error}</p>
                  <button className="px-5 py-2 rounded-lg bg-primary text-white" onClick={() => void loadGraph()}>重试</button>
                </div>
              ) : skills.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-white/75">暂无技能图谱数据，请先上传并解析简历。</div>
              ) : (
                <ForceGraph2D
                  ref={graphRef}
                  graphData={graphData}
                  width={viewport.width}
                  height={viewport.height}
                  enableNodeDrag
                  cooldownTicks={0}
                  d3AlphaDecay={0.028}
                  d3VelocityDecay={0.52}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={() => 0.0045}
                  nodeRelSize={6}
                  backgroundColor="rgba(0,0,0,0)"
                  onNodeDragEnd={(node: any) => {
                    node.fx = node.x;
                    node.fy = node.y;
                  }}
                  onNodeHover={(node: unknown) => {
                    setFocusedNode((node as GraphNode | null)?.name ?? '');
                  }}
                  onNodeClick={(node: any) => {
                    graphRef.current?.centerAt?.(node.x, node.y, 500);
                    graphRef.current?.zoom?.(2.1, 500);
                    setFocusedNode((node as GraphNode).name);
                  }}
                  linkColor={(link: unknown) => {
                    const current = link as GraphLink;
                    if (!focusedNode) {
                      return 'rgba(136, 226, 255, 0.35)';
                    }
                    return current.source === focusedNode || current.target === focusedNode
                      ? 'rgba(74, 237, 196, 0.95)'
                      : 'rgba(136, 226, 255, 0.12)';
                  }}
                  nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                    const graphNode = node as GraphNode;
                    const label = graphNode.name;
                    const highlight = !focusedNode || focusedNode === graphNode.name;
                    const textSize = Math.max(10, 12) / globalScale;

                    ctx.font = `bold ${textSize}px sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const padding = 10 / globalScale;
                    const nodeHeight = 24 / globalScale;
                    const nodeWidth = textWidth + padding * 2;
                    const radius = nodeHeight / 2;

                    ctx.beginPath();
                    const x = node.x! - nodeWidth / 2;
                    const y = node.y! - nodeHeight / 2;
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + nodeWidth - radius, y);
                    ctx.quadraticCurveTo(x + nodeWidth, y, x + nodeWidth, y + radius);
                    ctx.lineTo(x + nodeWidth, y + nodeHeight - radius);
                    ctx.quadraticCurveTo(x + nodeWidth, y + nodeHeight, x + nodeWidth - radius, y + nodeHeight);
                    ctx.lineTo(x + radius, y + nodeHeight);
                    ctx.quadraticCurveTo(x, y + nodeHeight, x, y + nodeHeight - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                    ctx.closePath();
                    ctx.fillStyle = graphNode.kind === 'user' ? '#3f8cff' : (highlight ? '#52ffe2' : 'rgba(82,255,226,0.35)');
                    ctx.shadowColor = graphNode.kind === 'user' ? 'rgba(63,140,255,0.75)' : 'rgba(82,255,226,0.7)';
                    ctx.shadowBlur = 18;
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = graphNode.kind === 'user' ? '#ffffff' : (highlight ? '#0a1a2e' : 'rgba(10,26,46,0.5)');
                    ctx.fillText(label, node.x!, node.y!);
                  }}
                />
              )}
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-headline font-bold text-on-surface">AI 综合能力评估</h3>
                <span className="material-symbols-outlined text-primary">psychology</span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <svg
                  data-testid="skill-score-ring"
                  width="84"
                  height="84"
                  viewBox="0 0 84 84"
                  className="overflow-visible"
                >
                  <circle cx="42" cy="42" r={ringRadius} fill="none" stroke="rgba(14,28,44,0.12)" strokeWidth="8" />
                  <motion.circle
                    data-testid="skill-score-progress"
                    cx="42"
                    cy="42"
                    r={ringRadius}
                    fill="none"
                    stroke="url(#skillScoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    initial={{ strokeDashoffset: ringCircumference }}
                    animate={{ strokeDashoffset: ringOffset }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
                    transform="rotate(-90 42 42)"
                  />
                  <defs>
                    <linearGradient id="skillScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3f8cff" />
                      <stop offset="100%" stopColor="#52ffe2" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="font-headline text-6xl font-black text-primary tracking-tighter leading-none">{score}</span>
                <span className="text-on-surface-variant font-medium pb-1">/ 100</span>
              </div>
              <p className="text-sm text-on-surface-variant mt-2">当前图谱已识别 {skills.length} 项技能节点，后续会继续随着简历解析结果动态更新。</p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_32px_-4px_rgba(14,28,44,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">monitoring</span>
                <h3 className="font-headline font-bold text-on-surface">图谱状态卡</h3>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <p className="text-on-surface-variant">节点数：<span className="font-semibold text-on-surface">{nodeCount}</span></p>
                <p className="text-on-surface-variant">连线数：<span className="font-semibold text-on-surface">{linkCount}</span></p>
                <p className="text-on-surface-variant">当前聚焦节点：<span className="font-semibold text-on-surface">{focusedNode || '无'}</span></p>
                <p className="text-on-surface-variant pt-1">可通过拖拽节点、拖动画布与滚轮缩放进行自由探索。</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
