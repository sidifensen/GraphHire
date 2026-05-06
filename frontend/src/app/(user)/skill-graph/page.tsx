'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TopNav } from '@/app/(user)/_mock/components/TopNav';
import { RefreshCw } from 'lucide-react';
import UserWorkbenchSidebar from '@/app/(user)/_components/UserWorkbenchSidebar';
import { personApi, type AbilityAssessment } from '@/lib/api/person';
import type { ForceGraphMethods, LinkObject, NodeObject } from 'react-force-graph-2d';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false }) as unknown as React.ComponentType<{
  ref?: React.Ref<ForceGraphMethods<GraphNodeType, GraphLinkType>>;
  graphData: GraphData;
  backgroundColor?: string;
  linkColor?: (link: LinkObject<GraphNodeType, GraphLinkType>) => string;
  linkWidth?: number;
  linkDirectionalParticles?: number;
  linkDirectionalParticleWidth?: number;
  linkDirectionalParticleSpeed?: (link: LinkObject<GraphNodeType, GraphLinkType>) => number;
  linkDirectionalParticleColor?: (link: LinkObject<GraphNodeType, GraphLinkType>) => string;
  nodeRelSize?: number;
  nodeCanvasObject?: (node: NodeObject<GraphNodeType>, ctx: CanvasRenderingContext2D, globalScale: number) => void;
  nodePointerAreaPaint?: (node: NodeObject<GraphNodeType>, color: string, ctx: CanvasRenderingContext2D) => void;
  nodeLabel?: (node: NodeObject<GraphNodeType>) => string;
  d3VelocityDecay?: number;
  d3AlphaDecay?: number;
  warmupTicks?: number;
  cooldownTicks?: number;
  onEngineStop?: () => void;
  enableNodeDrag?: boolean;
  enablePanInteraction?: boolean;
  enableZoomInteraction?: boolean;
  minZoom?: number;
  maxZoom?: number;
  onNodeDragEnd?: (node: NodeObject<GraphNodeType>) => void;
  onBackgroundClick?: () => void;
}>;

type SkillGraphPayload = {
  personId?: number;
  realName?: string | null;
  avatarUrl?: string | null;
  skills?: string[];
  industryMatch?: {
    industryId?: number | null;
    industryName?: string | null;
    matched?: boolean;
  };
  skillCategories?: Array<{
    code?: string;
    name?: string;
    skills?: string[];
  }>;
  success?: boolean;
};

type GraphNodeType = {
  id: string;
  label: string;
  kind: 'person' | 'skill';
  categoryCode?: string;
  categoryName?: string;
  color: string;
  strokeColor: string;
  textColor: string;
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

function normalizeSkillCategories(input: unknown): Array<{ code: string; name: string; skills: string[] }> {
  if (!Array.isArray(input)) {
    return [];
  }
  const categories: Array<{ code: string; name: string; skills: string[] }> = [];
  for (const item of input) {
    if (typeof item !== 'object' || item === null) {
      continue;
    }
    const record = item as { code?: unknown; name?: unknown; skills?: unknown };
    const code = typeof record.code === 'string' ? record.code.trim() : '';
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    if (!code || !name) {
      continue;
    }
    categories.push({
      code,
      name,
      skills: normalizeSkills(record.skills),
    });
  }
  return categories;
}

function colorByCategory(code: string, isDarkMode: boolean): { fill: string; stroke: string; text: string } {
  const paletteLight = ['#BFD2FF', '#CDEAC0', '#FFE2B8', '#FFD1D1', '#E0D4FF', '#BFE9E8', '#FCD6A4'];
  const paletteDark = ['#1F3559', '#1E3A2A', '#4A341A', '#4A2323', '#2D2450', '#153A3A', '#4B341F'];
  const hash = Array.from(code).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const idx = hash % paletteLight.length;
  return {
    fill: isDarkMode ? paletteDark[idx] : paletteLight[idx],
    stroke: isDarkMode ? 'rgba(147,197,253,0.72)' : 'rgba(0,82,255,0.32)',
    text: isDarkMode ? '#DDEAFE' : '#1B2A57',
  };
}

function buildGraphData(
  personId: number,
  personName: string,
  skills: string[],
  skillCategories: Array<{ code: string; name: string; skills: string[] }>,
  isDarkMode: boolean
): GraphData {
  const centerNodeId = `person:${personId}`;
  const personNode: NodeObject<GraphNodeType> = {
    id: centerNodeId,
    label: personName,
    kind: 'person',
    color: isDarkMode ? '#3B82F6' : '#0052FF',
    strokeColor: isDarkMode ? '#BFDBFE' : '#FFFFFF',
    textColor: '#FFFFFF',
    radius: 24,
    fx: 0,
    fy: 0,
  };

  const categoryBySkill = new Map<string, { code: string; name: string }>();
  for (const category of skillCategories) {
    for (const skill of category.skills) {
      if (!categoryBySkill.has(skill)) {
        categoryBySkill.set(skill, { code: category.code, name: category.name });
      }
    }
  }

  const skillNodes: NodeObject<GraphNodeType>[] = skills.map((skill) => {
    const category = categoryBySkill.get(skill);
    const colors = colorByCategory(category?.code ?? 'uncategorized', isDarkMode);
    return {
      id: `skill:${skill}`,
      label: skill,
      kind: 'skill',
      categoryCode: category?.code ?? 'uncategorized',
      categoryName: category?.name ?? '未分类',
      color: colors.fill,
      strokeColor: colors.stroke,
      textColor: colors.text,
      radius: 8,
    };
  });

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

  ctx.strokeStyle = node.strokeColor ?? 'rgba(0, 82, 255, 0.32)';
  ctx.lineWidth = node.kind === 'person' ? 3 : 1.5;
  ctx.stroke();

  const fontSize = node.kind === 'person' ? 11 / globalScale : 8 / globalScale;
  ctx.font = `${node.kind === 'person' ? 800 : 700} ${fontSize}px Manrope, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = node.textColor ?? (node.kind === 'person' ? '#FFFFFF' : '#1B2A57');
  const textY = node.kind === 'person' ? y : y + radius + 9 / globalScale;
  ctx.fillText(label, x, textY);
}

export default function KnowledgeGraph() {
  const [skills, setSkills] = React.useState<string[]>([]);
  const [skillCategories, setSkillCategories] = React.useState<Array<{ code: string; name: string; skills: string[] }>>([]);
  const [industryName, setIndustryName] = React.useState<string | null>(null);
  const [assessment, setAssessment] = React.useState<AbilityAssessment | null>(null);
  const [personId, setPersonId] = React.useState<number>(0);
  const [personName, setPersonName] = React.useState<string>('求职者');
  const [graphData, setGraphData] = React.useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = React.useState(true);
  const stageRef = React.useRef<ForceGraphMethods<GraphNodeType, GraphLinkType> | null>(null);
  const initialFitDoneRef = React.useRef(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobileViewport(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const root = window.document.documentElement;
    const apply = () => setIsDarkMode(root.classList.contains('dark'));
    apply();

    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

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
        const nextCategories = normalizeSkillCategories(graph.skillCategories);
        const nextPersonId = Number.isFinite(graph.personId) ? Number(graph.personId) : 0;
        const nextPersonName = graph.realName?.trim() ? graph.realName.trim() : '求职者';
        const nextIndustryName = graph.industryMatch?.industryName?.trim() ? graph.industryMatch.industryName.trim() : null;

        setSkills(nextSkills);
        setSkillCategories(nextCategories);
        setIndustryName(nextIndustryName);
        setPersonId(nextPersonId);
        setPersonName(nextPersonName);
        setAssessment(assessmentResponse);
      } catch (err) {
        if (!active) {
          return;
        }
        setSkills([]);
        setSkillCategories([]);
        setIndustryName(null);
        setPersonId(0);
        setPersonName('求职者');
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

  React.useEffect(() => {
    setGraphData(buildGraphData(personId, personName, skills, skillCategories, isDarkMode));
    initialFitDoneRef.current = false;
  }, [personId, personName, skills, skillCategories, isDarkMode]);

  React.useEffect(() => {
    if (!stageRef.current || graphData.nodes.length === 0) {
      return;
    }
    const graph = stageRef.current;
    const d3ForceFn = graph.d3Force;
    if (typeof d3ForceFn === 'function') {
      const linkForce = d3ForceFn('link');
      const linkForceWithDistance = linkForce as unknown as { distance?: (value: number) => unknown } | null;
      if (linkForceWithDistance && typeof linkForceWithDistance.distance === 'function') {
        linkForceWithDistance.distance(isMobileViewport ? 186 : 112);
      }
      const chargeForce = d3ForceFn('charge');
      const chargeForceWithStrength = chargeForce as unknown as { strength?: (value: number) => unknown } | null;
      if (chargeForceWithStrength && typeof chargeForceWithStrength.strength === 'function') {
        chargeForceWithStrength.strength(isMobileViewport ? -380 : -175);
      }
    }
    graph.d3ReheatSimulation?.();

    const timer = window.setTimeout(() => {
      graph.zoomToFit(900, isMobileViewport ? 52 : 36);
      graph.zoom(isMobileViewport ? 0.86 : 1.18, 320);
      graph.centerAt(0, 0, 240);
      initialFitDoneRef.current = true;
    }, 220);
    return () => window.clearTimeout(timer);
  }, [graphData, isMobileViewport]);

  const totalScore = safeScore(assessment);
  const skillCount = safeSkillCount(assessment, skills);

  const handleResetView = React.useCallback(() => {
    const graph = stageRef.current;
    if (!graph) {
      return;
    }
    graph.centerAt(0, 0, 450);
    graph.zoomToFit(650, isMobileViewport ? 56 : 40);
    graph.zoom(isMobileViewport ? 0.86 : 1.12, 280);
    graph.d3ReheatSimulation();
  }, [isMobileViewport]);

  return (
    <div className="flex min-h-screen md:h-[calc(100vh-4rem)] md:min-h-0 flex-col bg-surface-background">
      <div className="md:hidden">
        <TopNav title="我的图谱" />
      </div>

      <main className="flex-1 px-3 pb-2 pt-3 md:p-0">
        <div className="mx-auto flex h-full w-full max-w-[1700px] gap-3 md:max-w-none md:gap-0">
          <UserWorkbenchSidebar />

          <section
            className="relative h-full min-h-[90vh] md:h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] flex-1 overflow-hidden rounded-3xl border border-surface-mid/60 md:rounded-none md:border-0"
            style={{
              background: isDarkMode
                ? 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.14), transparent 46%), radial-gradient(circle at 80% 80%, rgba(29,78,216,0.18), transparent 44%), linear-gradient(145deg, rgba(10,14,24,0.98), rgba(17,23,38,0.96))'
                : 'radial-gradient(circle at 20% 20%, rgba(0,82,255,0.12), transparent 45%), radial-gradient(circle at 80% 80%, rgba(37,99,235,0.08), transparent 40%), linear-gradient(145deg, rgba(255,255,255,0.96), rgba(245,248,255,0.84))',
            }}
          >
            <div className="absolute inset-0 z-0" data-testid="force-graph-stage">
              <ForceGraph2D
                ref={stageRef}
                graphData={graphData}
                backgroundColor="rgba(0,0,0,0)"
                linkColor={() => (isDarkMode ? 'rgba(96,165,250,0.38)' : 'rgba(0,82,255,0.25)')}
                linkWidth={1.1}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={1.6}
                linkDirectionalParticleSpeed={() => 0.0042}
                linkDirectionalParticleColor={() => (isDarkMode ? 'rgba(147,197,253,0.92)' : 'rgba(0,82,255,0.78)')}
                nodeRelSize={5}
                nodeCanvasObject={drawNode}
                nodePointerAreaPaint={(node, color, ctx) => {
                  const radius = node.radius ?? 10;
                  ctx.fillStyle = color;
                  ctx.beginPath();
                  ctx.arc(node.x ?? 0, node.y ?? 0, radius + 7, 0, 2 * Math.PI, false);
                  ctx.fill();
                }}
                nodeLabel={(node) => node.label}
                d3VelocityDecay={isMobileViewport ? 0.24 : 0.42}
                d3AlphaDecay={isMobileViewport ? 0.012 : 0.022}
                warmupTicks={isMobileViewport ? 120 : 40}
                cooldownTicks={isMobileViewport ? 420 : 220}
                onEngineStop={() => {
                  if (!isMobileViewport || initialFitDoneRef.current) {
                    return;
                  }
                  const graph = stageRef.current;
                  if (!graph) {
                    return;
                  }
                  graph.zoomToFit(900, 52);
                  graph.zoom(0.86, 280);
                  graph.centerAt(0, 0, 200);
                  initialFitDoneRef.current = true;
                }}
                enableNodeDrag
                enablePanInteraction
                enableZoomInteraction
                minZoom={0.3}
                maxZoom={2.4}
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

            <button
              type="button"
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-2xl border border-surface-mid bg-surface-lowest/85 text-on-surface-variant shadow-sm transition hover:text-primary"
              onClick={handleResetView}
              aria-label="重置图谱视角"
            >
              <RefreshCw size={18} />
            </button>

            <div className="absolute bottom-3 right-3 z-20 text-right md:bottom-5 md:right-5">
              <div className="text-4xl font-black text-primary md:text-6xl">{totalScore}</div>
              <div className="mt-0.5 text-sm font-extrabold uppercase tracking-[0.2em] text-on-surface/85">综合分</div>
              {industryName ? <div className="mt-1 text-sm font-bold text-on-surface">{industryName}</div> : null}
              <div className="mt-1.5 text-base font-black text-on-surface md:text-lg">{skillCount} 知识节点</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
