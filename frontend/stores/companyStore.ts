import { create } from 'zustand';
import type { CompanyInfo, Job, Candidate } from '@/lib/api/company';

interface CompanyState {
  info: CompanyInfo | null;
  jobs: Job[];
  jobsTotal: number;
  candidates: Candidate[];
  candidatesTotal: number;
  setInfo: (info: CompanyInfo) => void;
  setJobs: (jobs: Job[], total: number) => void;
  setCandidates: (candidates: Candidate[], total: number) => void;
  clearCompany: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  info: null,
  jobs: [],
  jobsTotal: 0,
  candidates: [],
  candidatesTotal: 0,
  setInfo: (info) => set({ info }),
  setJobs: (jobs, total) => set({ jobs, jobsTotal: total }),
  setCandidates: (candidates, total) => set({ candidates, candidatesTotal: total }),
  clearCompany: () => set({ info: null, jobs: [], jobsTotal: 0, candidates: [], candidatesTotal: 0 }),
}));
