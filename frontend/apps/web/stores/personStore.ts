import { create } from 'zustand';
import type { PersonInfo, PersonGraph, Job } from '@/lib/api/person';

interface PersonState {
  info: PersonInfo | null;
  graph: PersonGraph | null;
  recommendedJobs: Job[];
  jobsTotal: number;
  setInfo: (info: PersonInfo) => void;
  setGraph: (graph: PersonGraph) => void;
  setRecommendedJobs: (jobs: Job[], total: number) => void;
  clearPerson: () => void;
}

export const usePersonStore = create<PersonState>((set) => ({
  info: null,
  graph: null,
  recommendedJobs: [],
  jobsTotal: 0,
  setInfo: (info) => set({ info }),
  setGraph: (graph) => set({ graph }),
  setRecommendedJobs: (jobs, total) => set({ recommendedJobs: jobs, jobsTotal: total }),
  clearPerson: () => set({ info: null, graph: null, recommendedJobs: [], jobsTotal: 0 }),
}));
