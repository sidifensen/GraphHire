'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { RefreshCw } from 'lucide-react';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';
import { personApi, type AbilityAssessment } from '@/lib/api/person';
import type { ForceGraphMethods, LinkObject, NodeObject } from 'react-force-graph-2d';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type SkillGraphPayload = {
  personId?: number;
  realName?: string | null;
  avatarUrl?: string | null;
  skills?: string[];
  success?: boolean;
};

type GraphNodeType = {
  id: string;
  label: string;
  kind: 'person' | 'skill';
  color: string;
  radius: number;
};

type GraphLinkType = {
  source: string;
  target: string;
};

type GraphData = {
  nodes: NodeObject<GraphNodeType>[];
  links: LinkObject<GraphNodeType, GraphLinkType>[];
};

const LEVEL_TEXT: Record<string, string> = {
  HIGH: 'Top 5% 职场精英',
  MEDIUM: 'Top 30% 稳定进阶',
  LOW: '持续提升中',
};

function normalizeSkills(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const deduped = new Set<string>();
  for (const item of input) {
    if (typeof item !== 'string') {
      continue;
    }
    const cleaned = item.trim();
    if (cleaned.length === 0) {
      continue;
    }
    deduped.add(cleaned);
  }
  return Array.from(deduped);
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

function buildGraphData(personId: number, personName: string, skills: string[]): GraphData {
  const centerNodeId = `person:${personId}`;
  const personNode: NodeObject<GraphNodeType> = {
    id: centerNodeId,
    label: personName,
    kind: 'person',
    color: '#0052FF',
    radius: 38,
    fx: 0,
    fy: 0,
  };

  const skillNodes: NodeObject<GraphNodeType>[] = skills.map((skill) => ({
    id: `skill:${skill}`,
    label: skill,
    kind: 'skill',
    color: '#BFD2FF',
    radius: 16,
  }));

  const links: LinkObject<GraphNodeType, GraphLinkType>[] = skillNodes.map((node) => ({
    source: centerNodeId,
    target: node.id as string,
  }));

  return {
    nodes: [personNode, ...skillNodes],
    links,
  };
}

function drawNode(node: NodeObject<GraphNodeType>, ctx: CanvasRenderingContext2D, globalScale: number) {
  const label = node.label ?? '';
  const radius = node.radius ?? 10;
  const x = node.x ?? 0;
  const y = node.y ?? 0;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = node.color ?? '#90A4FF';
  ctx.fill();

  if (node.kind === 'person') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(0, 82, 255, 0.32)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const fontSize = node.kind === 'person' ? 14 / globalScale : 11 / globalScale;
  ctx.font = `${node.kind === 'person' ? 800 : 700} ${fontSize}px Manrope, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = node.kind === 'person' ? '#FFFFFF' : '#1B2A57';
  const textY = node.kind === 'person' ? y : y + radius + 12 / globalScale;
  ctx.fillText(label, x, textY);
}

export default function KnowledgeGraph() {
  const [skills, setSkills] = React.useState<string[]>([]);
  const [assessment, setAssessment] = React.useState<AbilityAssessment | null>(null);
  const [personId, setPersonId] = React.useState<number>(0);
  const [personName, setPersonName] = React.useState<string>('求职者');
  const [graphData, setGraphData] = React.useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const stageRef = React.useRef<ForceGraphMethods<GraphNodeType, GraphLinkType>>();

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
        const nextSkills = normalizeSkills(graph.skills);
        const nextPersonId = Number.isFinite(graph.personId) ? Number(graph.personId) : 0;
        const nextPersonName = graph.realName?.trim() ? graph.realName.trim() : '求职者';

        setSkills(nextSkills);
        setPersonId(nextPersonId);
        setPersonName(nextPersonName);
        setAssessment(assessmentResponse);
        setGraphData(buildGraphData(nextPersonId, nextPersonName, nextSkills));
      } catch (err) {
        if (!active) {
          return;
        }
        const message = err instanceof Error ? err.message : '能力图谱加载失败';
        setError(message || '能力图谱加载失败');
        setSkills([]);
        setPersonId(0);
        setPersonName('求职者');
        setAssessment(null);
        setGraphData(buildGraphData(0, '求职者', []));
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

  React.useEffect(() => {
    if (!stageRef.current || graphData.nodes.length === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      stageRef.current?.zoomToFit(500, 60);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [graphData]);

  const totalScore = safeScore(assessment);
  const skillCount = safeSkillCount(assessment, skills);
  const levelText = resolveLevelText(assessment?.level);

  const handleResetView = React.useCallback(() => {
    const graph = stageRef.current;
    if (!graph) {
      return;
    }
    graph.centerAt(0, 0, 450);
    graph.zoom(1.1, 450);
    graph.d3ReheatSimulation();
  }, []);

  return (
    <div className="flex min-h-screen md:min-h-[calc(100vh-4rem)] flex-col bg-surface-background">
      <div className="md:hidden">
        <TopNav title="我的图谱" />
      </div>

      <main className="flex-1 px-5 pb-28 pt-5 md:px-8 md:py-8 md:pb-32">
        <div className="mx-auto flex w-full max-w-[1700px] gap-6">
          <UserWorkbenchSidebar />

          <section className="relative min-h-[74vh] flex-1 overflow-hidden rounded-3xl border border-surface-mid/60 bg-[radial-gradient(circle_at_20%_20%,rgba(0,82,255,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.08),transparent_40%),linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,248,255,0.84))]">
            <div className="absolute inset-0 z-0" data-testid="force-graph-stage">
              <ForceGraph2D
                ref={stageRef}
                graphData={graphData}
                backgroundColor="rgba(0,0,0,0)"
                linkColor={() => 'rgba(0,82,255,0.25)'}
                linkWidth={1.5}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={2.2}
                linkDirectionalParticleSpeed={() => 0.006}
                nodeRelSize={7}
                nodeCanvasObject={drawNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                  const radius = node.radius ?? 10;
                  ctx.fillStyle = color;
                  ctx.beginPath();
                  ctx.arc(node.x ?? 0, node.y ?? 0, radius + 10, 0, 2 * Math.PI, false);
                  ctx.fill();
                }}
                nodeLabel={(node) => node.label}
                d3VelocityDecay={0.3}
                enableNodeDrag
                enablePanInteraction
                enableZoomInteraction
                minZoom={0.45}
                maxZoom={4}
                onNodeDragEnd={(node) => {
                  if (node.kind === 'person') {
                    node.fx = 0;
                    node.fy = 0;
                    return;
                  }
                  node.fx = node.x;
                  node.fy = node.y;
                }}
                onBackgroundClick={() => {
                  stageRef.current?.d3ReheatSimulation();
                }}
              />
            </div>

            <div className="pointer-events-none absolute left-7 top-6 z-20">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-primary/70">Immersive Skill Graph</p>
              <h2 className="mt-2 text-2xl font-black text-on-surface md:text-4xl">{personName}</h2>
              <p className="mt-2 text-sm font-semibold text-outline">
                {loading ? '正在同步能力图谱...' : `已连接 ${skillCount} 个技能节点`}
              </p>
              {error ? <p className="mt-2 text-xs font-semibold text-red-500">{error}</p> : null}
            </div>

            <button
              type="button"
              className="absolute right-7 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-mid bg-surface-lowest/85 text-on-surface-variant shadow-sm transition hover:text-primary"
              onClick={handleResetView}
              aria-label="重置图谱视角"
            >
              <RefreshCw size={18} />
            </button>

            <div className="absolute bottom-6 right-7 z-20 text-right">
              <div className="text-6xl font-black text-primary md:text-7xl">{totalScore}</div>
              <div className="mt-1 text-sm font-extrabold uppercase tracking-[0.2em] text-on-surface/85">综合分</div>
              <div className="mt-2 text-xs font-bold text-outline">{levelText}</div>
              <div className="mt-3 text-xl font-black text-on-surface">{skillCount} 知识节点</div>
              <div className="mt-1 max-w-[260px] text-xs font-semibold text-outline">
                {skills.length > 0 ? skills.slice(0, 8).join(' · ') : '暂无技能标签'}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
