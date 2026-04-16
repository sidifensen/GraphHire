'use client';

import { Card } from '@/components/shared/ui/Card';
import { ForceGraph } from '@/components/shared/graph/ForceGraph';

interface GraphData {
  nodes: { id: string; name: string; type: string }[];
  edges: { source: string; target: string }[];
}

interface MiniGraphProps {
  graphData: GraphData | null;
}

export function MiniGraph({ graphData }: MiniGraphProps) {
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <Card title="能力概览">
        <div className="h-64 flex items-center justify-center text-gray-400">
          暂无图谱数据
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="能力概览"
      extra={<a href="/person/graph" className="text-sm text-primary">展开完整图谱 →</a>}
    >
      <div className="h-64">
        <ForceGraph nodes={graphData.nodes} edges={graphData.edges} height={240} />
      </div>
    </Card>
  );
}