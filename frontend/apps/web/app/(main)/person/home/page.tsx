'use client';

import { Suspense, useEffect, useState } from 'react';
import { WelcomeBanner } from './components/WelcomeBanner';
import { StatsRow } from './components/StatsRow';
import { RecommendedJobs } from './components/RecommendedJobs';
import { MiniGraph } from './components/MiniGraph';
import { personApi } from '@/lib/api/person';
import { usePersonStore } from '@/stores/personStore';

export default function PersonHomePage() {
  const setGraph = usePersonStore((s) => s.setGraph);
  const [graphData, setGraphData] = useState<{ nodes: never[]; edges: never[] } | null>(null);

  useEffect(() => {
    personApi.getGraph().then((data) => {
      setGraph(data);
      setGraphData(data);
    }).catch(() => setGraphData({ nodes: [], edges: [] }));
  }, [setGraph]);

  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <WelcomeBanner />
      <StatsRow />

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
        <RecommendedJobs />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg" />}>
        <MiniGraph graphData={graphData} />
      </Suspense>
    </div>
  );
}